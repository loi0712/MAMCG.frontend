import Axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { toast } from 'sonner'

import { env } from '@/config/env'
import { apiUrls } from '@/api/config/endpoints'
import { type AuthUser } from '@/features/auth/types/auth'
import {
  isTokenExpired,
  readAccessTokenCookie,
  readRefreshTokenCookie,
  useAuthStore,
} from '@/stores/auth-store'

export const axios = Axios.create({
  baseURL: env.apiUrl,
})

// Gọi các API phiên đăng nhập (refresh/logout) không qua interceptor để tránh vòng lặp 401 -> refresh
const sessionClient = Axios.create({ baseURL: env.apiUrl })

// Các API xác thực: 401/400 là kết quả nghiệp vụ, không làm mới token rồi gửi lại
const AUTH_URLS: string[] = [
  apiUrls.auth.login,
  apiUrls.auth.refresh,
  apiUrls.auth.logout,
  apiUrls.auth.forgotPassword,
  apiUrls.auth.resetPassword,
]

// Làm mới trước khi access token hết hạn (tránh 401 và ảnh /storage dùng token cũ)
const REFRESH_BEFORE_MS = 60 * 1000

export interface SessionTokensResponse {
  user?: AuthUser | null
  token: string
  refreshToken: string
}

let refreshPromise: Promise<string | null> | null = null

/**
 * Đổi refresh token lấy access token mới. Nhiều request cùng gặp 401 chỉ gọi máy chủ một lần
 * (các request còn lại chờ chung promise này). Trả null nếu phiên không còn hiệu lực.
 */
export function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = doRefresh().finally(() => {
      refreshPromise = null
    })
  }
  return refreshPromise
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Tab khác đã làm mới (cookie dùng chung): nhận token mới trong cookie thay vì gọi lại máy chủ
function adoptTokenFromOtherTab(current: string): string | null {
  const latest = readAccessTokenCookie()
  if (latest && latest !== current && !isTokenExpired(latest, REFRESH_BEFORE_MS / 2)) {
    useAuthStore.getState().auth.setTokens(latest, readRefreshTokenCookie() || null)
    return latest
  }
  return null
}

async function doRefresh(): Promise<string | null> {
  const { auth } = useAuthStore.getState()
  const startedWith = auth.accessToken
  const adopted = adoptTokenFromOtherTab(startedWith)
  if (adopted) return adopted

  const refreshToken = readRefreshTokenCookie() || auth.refreshToken
  if (!refreshToken) return null

  try {
    const res = await sessionClient.post<SessionTokensResponse>(apiUrls.auth.refresh, { refreshToken })
    const { auth: latest } = useAuthStore.getState()
    latest.setTokens(res.data.token, res.data.refreshToken)
    if (res.data.user) latest.setUser(res.data.user)
    return res.data.token
  } catch {
    // Hai tab làm mới cùng lúc: máy chủ từ chối tab chậm hơn, chờ tab kia ghi cookie rồi dùng token đó
    await sleep(1000)
    return adoptTokenFromOtherTab(startedWith)
  }
}

/** Gọi khi khởi động: access token đã/sắp hết hạn mà còn refresh token thì làm mới trước khi render. */
export async function ensureFreshSession() {
  const { auth } = useAuthStore.getState()
  if (!auth.user || !auth.refreshToken) return
  if (!auth.accessToken || isTokenExpired(auth.accessToken, REFRESH_BEFORE_MS)) {
    const token = await refreshAccessToken()
    if (!token) useAuthStore.getState().auth.reset()
  }
}

let keepAliveTimer: ReturnType<typeof setInterval> | undefined

/** Tự làm mới access token khi sắp hết hạn, để URL media (?access_token=) tạo sau đó luôn còn hiệu lực. */
export function startSessionKeepAlive() {
  if (keepAliveTimer) return
  keepAliveTimer = setInterval(() => {
    const { auth } = useAuthStore.getState()
    if (auth.user && auth.refreshToken && auth.accessToken && isTokenExpired(auth.accessToken, 2 * REFRESH_BEFORE_MS)) {
      void refreshAccessToken()
    }
  }, 30 * 1000)
}

/** Đăng xuất phía máy chủ (thu hồi phiên); lỗi mạng không chặn việc đăng xuất ở trình duyệt. */
export async function logoutSession() {
  const { auth } = useAuthStore.getState()
  try {
    await sessionClient.post(
      apiUrls.auth.logout,
      { refreshToken: readRefreshTokenCookie() || auth.refreshToken || null },
      auth.accessToken ? { headers: { Authorization: `Bearer ${auth.accessToken}` } } : undefined
    )
  } catch {
    // Bỏ qua: phiên phía máy chủ tự hết hạn
  }
}

const isAuthUrl = (url?: string) => !!url && AUTH_URLS.includes(url)

const onRequestSuccess = async (config: InternalAxiosRequestConfig) => {
  const { auth } = useAuthStore.getState()
  let token = auth.accessToken

  // Token sắp hết hạn: làm mới trước (các request song song dùng chung một lần gọi)
  if (token && auth.refreshToken && !isAuthUrl(config.url) && isTokenExpired(token, REFRESH_BEFORE_MS / 2)) {
    token = (await refreshAccessToken()) ?? token
  }

  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`)
  }

  config.headers.set('Accept', 'application/json')

  return config
}

axios.interceptors.request.use(onRequestSuccess, (error) => Promise.reject(error))

// Nhiều request có thể cùng trả 401: chỉ xử lý đăng xuất một lần
let isHandlingUnauthorized = false

async function handleUnauthorized() {
  if (isHandlingUnauthorized) return
  isHandlingUnauthorized = true

  try {
    useAuthStore.getState().auth.reset()
    toast.error('Phiên đăng nhập đã hết hạn!')

    // Import động để tránh vòng phụ thuộc với main.tsx
    const { router } = await import('@/main')
    const currentPath = window.location.pathname + window.location.search
    if (window.location.pathname !== '/sign-in') {
      await router.navigate({ to: '/sign-in', search: { redirect: currentPath } })
    }
  } finally {
    isHandlingUnauthorized = false
  }
}

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean }

// 401: làm mới token một lần rồi gửi lại request; không được thì về trang đăng nhập.
// Không áp dụng cho chính các request đăng nhập/làm mới/quên mật khẩu.
axios.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetriableConfig | undefined
    if (error.response?.status !== 401 || !config || isAuthUrl(config.url)) {
      return Promise.reject(error)
    }

    if (!config._retried && useAuthStore.getState().auth.refreshToken) {
      config._retried = true
      const token = await refreshAccessToken()
      if (token) {
        config.headers.set('Authorization', `Bearer ${token}`)
        return axios(config)
      }
    }

    void handleUnauthorized()
    return Promise.reject(error)
  }
)
