import { create } from 'zustand'
import { getCookie, setCookie, removeCookie } from '@/shared/lib/cookies'
import { type AuthUser } from '@/features/auth/types/auth'

const ACCESS_TOKEN = 'mamcg_access_token'
const USER_INFO = 'mamcg_user'
// Refresh token: cookie riêng, SameSite=Strict (không gửi kèm request từ trang khác), sống bằng hạn phiên phía máy chủ
const REFRESH_TOKEN = 'mamcg_refresh_token'
const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 7

/** Đọc refresh token mới nhất từ cookie (tab khác có thể vừa làm mới). */
export function readRefreshTokenCookie(): string {
  return getCookie(REFRESH_TOKEN) ?? ''
}

/** Đọc access token mới nhất từ cookie. */
export function readAccessTokenCookie(): string {
  return readJsonCookie<string>(ACCESS_TOKEN) ?? ''
}

// Đọc JSON từ cookie; cookie hỏng thì coi như chưa có
function readJsonCookie<T>(name: string): T | null {
  const raw = getCookie(name)
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    removeCookie(name)
    return null
  }
}

// Thời điểm hết hạn của JWT (ms), null nếu không đọc được claim exp
export function tokenExpiresAt(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null
  } catch {
    return null
  }
}

// JWT đã hết hạn (hoặc còn dưới `skewMs`) thì không dùng lại
export function isTokenExpired(token: string, skewMs = 0): boolean {
  const exp = tokenExpiresAt(token)
  return exp !== null && exp - skewMs <= Date.now()
}

interface AuthState {
  auth: {
    user: AuthUser | null
    setUser: (user: AuthUser | null) => void
    accessToken: string
    setAccessToken: (accessToken: string) => void
    refreshToken: string
    // Lưu cặp token sau đăng nhập/làm mới/đổi mật khẩu
    setTokens: (accessToken: string, refreshToken?: string | null) => void
    isAuthenticated: boolean
    resetAccessToken: () => void
    reset: () => void
  }
}

export const useAuthStore = create<AuthState>()((set) => {
  // Restore token + user từ cookie. Access token hết hạn nhưng còn refresh token thì giữ phiên
  // (axios làm mới trước request đầu tiên); không còn refresh token thì coi như đã đăng xuất
  let initToken = readJsonCookie<string>(ACCESS_TOKEN) ?? ''
  let initUser = readJsonCookie<AuthUser>(USER_INFO)
  let initRefresh = readRefreshTokenCookie()
  if (initToken && isTokenExpired(initToken) && !initRefresh) {
    removeCookie(ACCESS_TOKEN)
    removeCookie(USER_INFO)
    initToken = ''
    initUser = null
  }
  if (!initToken || !initUser) {
    removeCookie(REFRESH_TOKEN)
    initRefresh = ''
  }
  
  return {
    auth: {
      user: initUser,
      accessToken: initToken,
      refreshToken: initRefresh,
      isAuthenticated: !!(initToken && initUser), // Cả 2 phải có
      
      setUser: (user) =>
        set((state) => {
          // Lưu user vào cookie/localStorage
          if (user) {
            setCookie(USER_INFO, JSON.stringify(user))
          } else {
            removeCookie(USER_INFO)
          }
          
          return { 
            ...state, 
            auth: { 
              ...state.auth, 
              user,
              isAuthenticated: !!(user && state.auth.accessToken)
            } 
          }
        }),
        
      setAccessToken: (accessToken) =>
        set((state) => {
          // Lưu token vào cookie
          if (accessToken) {
            setCookie(ACCESS_TOKEN, JSON.stringify(accessToken))
          } else {
            removeCookie(ACCESS_TOKEN)
          }
          
          return { 
            ...state, 
            auth: { 
              ...state.auth, 
              accessToken,
              isAuthenticated: !!(accessToken && state.auth.user)
            } 
          }
        }),
        
      setTokens: (accessToken, refreshToken) =>
        set((state) => {
          setCookie(ACCESS_TOKEN, JSON.stringify(accessToken))
          const nextRefresh = refreshToken ?? state.auth.refreshToken
          if (nextRefresh) {
            setCookie(REFRESH_TOKEN, nextRefresh, REFRESH_TOKEN_MAX_AGE, 'Strict')
          } else {
            removeCookie(REFRESH_TOKEN)
          }
          return {
            ...state,
            auth: {
              ...state.auth,
              accessToken,
              refreshToken: nextRefresh,
              isAuthenticated: !!(accessToken && state.auth.user),
            },
          }
        }),

      resetAccessToken: () =>
        set((state) => {
          removeCookie(ACCESS_TOKEN)
          return { 
            ...state, 
            auth: { 
              ...state.auth, 
              accessToken: '',
              isAuthenticated: false
            } 
          }
        }),
        
      reset: () =>
        set((state) => {
          removeCookie(ACCESS_TOKEN)
          removeCookie(USER_INFO)
          removeCookie(REFRESH_TOKEN)
          return {
            ...state,
            auth: { 
              ...state.auth, 
              user: null, 
              accessToken: '',
              refreshToken: '',
              isAuthenticated: false
            },
          }
        }),
    },
  }
})
