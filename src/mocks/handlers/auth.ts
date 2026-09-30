import { http, HttpResponse } from 'msw'
import { apiUrls } from '@/api/config/endpoints'
import { users } from '../db'
import { api } from './utils'

// ===========================================
// PHIÊN ĐĂNG NHẬP GIẢ LẬP (bám theo Identity UserSessionService)
// ===========================================

// Lưu trong localStorage để tải lại trang vẫn giữ được phiên (refresh token trong cookie vẫn dùng được)
const SESSIONS_KEY = 'mamcg_mock_sessions'
// Đặt localStorage['mamcg_mock_access_ttl'] = số giây để thử luồng làm mới token (mặc định 30 phút)
const ACCESS_TTL_KEY = 'mamcg_mock_access_ttl'
const ROTATION_GRACE_MS = 30 * 1000
const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000

export interface MockSession {
  id: string
  userId: string
  refreshToken: string
  previousToken: string | null
  rotatedAt: number | null
  createdAt: string
  lastUsedAt: string
  expiresAt: number
  ipAddress: string
  userAgent: string
  revokedAt: string | null
}

const loadSessions = (): MockSession[] => {
  try {
    return JSON.parse(localStorage.getItem(SESSIONS_KEY) ?? '[]') as MockSession[]
  } catch {
    return []
  }
}

export const sessions: MockSession[] = loadSessions()
export const saveSessions = () => localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions))

// Vài phiên trên thiết bị khác của admin để màn "Phiên đăng nhập" có dữ liệu
if (sessions.length === 0) {
  const ago = (h: number) => new Date(Date.now() - h * 3600_000).toISOString()
  const other = (id: string, userAgent: string, ipAddress: string, h: number): MockSession => ({
    id,
    userId: 'u-1',
    refreshToken: `${id}.seed`,
    previousToken: null,
    rotatedAt: null,
    createdAt: ago(h + 20),
    lastUsedAt: ago(h),
    expiresAt: Date.now() + REFRESH_TTL_MS,
    ipAddress,
    userAgent,
    revokedAt: null,
  })
  sessions.push(
    other('seed-phone', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) Mobile/15E148 Safari/604.1', '10.0.0.42', 3),
    other('seed-studio', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0 Safari/537.36 Edg/128.0', '10.0.12.7', 26)
  )
}

// Đọc/ghi Map trong localStorage (dữ liệu mock phải còn sau khi mở liên kết email/tải lại trang)
const persistedMap = <V>(key: string) => {
  let entries: [string, V][] = []
  try {
    entries = JSON.parse(localStorage.getItem(key) ?? '[]') as [string, V][]
  } catch {
    entries = []
  }
  const map = new Map<string, V>(entries)
  const set = map.set.bind(map)
  map.set = (k, v) => {
    const result = set(k, v)
    localStorage.setItem(key, JSON.stringify([...map.entries()]))
    return result
  }
  return map
}

// Mật khẩu đã đổi trong phiên dev (mặc định mọi mật khẩu đều đúng, trừ "wrong")
export const passwords = persistedMap<string>('mamcg_mock_passwords')
export const passwordMatches = (userId: string, password: string) =>
  passwords.has(userId) ? passwords.get(userId) === password : !!password && password !== 'wrong'

// Tài khoản AD/LDAP giả lập: không đổi/đặt lại mật khẩu
export const isDirectoryAccount = (username: string | null) => !!username?.startsWith('ldap.')

// Giống Identity PasswordPolicy
export const checkPasswordPolicy = (password: string | undefined, username?: string | null): string | null => {
  if (!password || password.length < 8) return 'Mật khẩu phải có ít nhất 8 ký tự'
  if (password.length > 100) return 'Mật khẩu không được vượt quá 100 ký tự'
  if (!/\p{L}/u.test(password) || !/\d/.test(password)) return 'Mật khẩu phải gồm cả chữ và số'
  if (username && password.toLowerCase() === username.toLowerCase()) return 'Mật khẩu không được trùng tên đăng nhập'
  return null
}

const b64 = (o: object) => btoa(JSON.stringify(o)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_')
const randomToken = () =>
  btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(24))))
    .replace(/=+$/, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')

const accessTtlSeconds = () => {
  const value = Number(localStorage.getItem(ACCESS_TTL_KEY))
  return Number.isFinite(value) && value > 0 ? value : 30 * 60
}

// JWT không ký, đủ để frontend đọc claim exp; sid = Id phiên như backend
const fakeToken = (sub: string, sid: string) => {
  const exp = Math.floor(Date.now() / 1000) + accessTtlSeconds()
  return `${b64({ alg: 'none', typ: 'JWT' })}.${b64({ sub, sid, exp })}.mock`
}

export const decodeToken = (request: Request): { sub?: string; sid?: string; exp?: number } | null => {
  const header = request.headers.get('Authorization') ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!token) return null
  try {
    return JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
  } catch {
    return null
  }
}

/** Người dùng của access token (không tin id do client gửi). */
export const currentUser = (request: Request) => {
  const claims = decodeToken(request)
  return claims?.sub ? users.find((u) => u.id === claims.sub) : undefined
}

const newRefreshToken = (sessionId: string) => `${sessionId}.${randomToken()}`
const sessionIdOf = (refreshToken: string) => refreshToken.split('.')[0]

export const createSession = (userId: string, request: Request) => {
  const now = new Date().toISOString()
  const id = crypto.randomUUID()
  const session: MockSession = {
    id,
    userId,
    refreshToken: newRefreshToken(id),
    previousToken: null,
    rotatedAt: null,
    createdAt: now,
    lastUsedAt: now,
    expiresAt: Date.now() + REFRESH_TTL_MS,
    ipAddress: '127.0.0.1',
    userAgent: request.headers.get('User-Agent') ?? navigator.userAgent,
    revokedAt: null,
  }
  sessions.push(session)
  saveSessions()
  return session
}

export const tokensOf = (session: MockSession) => ({
  token: fakeToken(session.userId, session.id),
  refreshToken: session.refreshToken,
})

export const isSessionActive = (s: MockSession) => !s.revokedAt && s.expiresAt > Date.now()

export const revokeUserSessions = (userId: string, exceptSessionId?: string) => {
  let count = 0
  sessions.forEach((s) => {
    if (s.userId === userId && !s.revokedAt && s.id !== exceptSessionId) {
      s.revokedAt = new Date().toISOString()
      count++
    }
  })
  saveSessions()
  return count
}

const unauthorized = (error: string) => HttpResponse.json({ error }, { status: 401 })
const badRequest = (title: string) => HttpResponse.json({ title, status: 400 }, { status: 400 })

// Token đặt lại mật khẩu (thay cho bảng password_reset_token): hạn 30 phút, dùng một lần
type ResetToken = { userId: string; createdAt: number; expiresAt: number; used: boolean }
const resetTokens = persistedMap<ResetToken>('mamcg_mock_reset_tokens')
// Đánh dấu đã dùng (ghi lại vào localStorage)
const markUsed = (userId: string) =>
  resetTokens.forEach((t, k) => {
    if (t.userId === userId) resetTokens.set(k, { ...t, used: true })
  })
const RESET_TTL_MS = 30 * 60 * 1000
const FORGOT_MESSAGE =
  'Nếu thông tin khớp với một tài khoản đang hoạt động, hệ thống đã gửi email hướng dẫn đặt lại mật khẩu. Liên kết có hiệu lực trong 30 phút.'

export const authHandlers = [
  // Như ActiveUserTokenValidator: access token hết hạn hoặc phiên đã thu hồi -> 401
  http.all(api('/api/*'), ({ request }) => {
    const path = new URL(request.url).pathname
    if (path.startsWith('/api/Auth/')) return
    const claims = decodeToken(request)
    if (!claims) return
    if (typeof claims.exp === 'number' && claims.exp * 1000 <= Date.now()) {
      return unauthorized('Token đã hết hạn')
    }
    const session = claims.sid ? sessions.find((s) => s.id === claims.sid) : undefined
    if (session && !isSessionActive(session)) return unauthorized('Phiên đăng nhập đã bị thu hồi')
  }),

  // Mọi mật khẩu đều hợp lệ, trừ "wrong" để thử luồng đăng nhập sai (hoặc mật khẩu đã đổi trong phiên dev)
  http.post(api(apiUrls.auth.login), async ({ request }) => {
    const body = (await request.json()) as { userName?: string; username?: string; password?: string }
    const username = body.userName ?? body.username ?? ''
    const user = users.find((u) => u.username === username) ?? users[0]
    if (!username || !body.password || !passwordMatches(user.id, body.password)) {
      return HttpResponse.json({ error: 'Tên đăng nhập hoặc mật khẩu không đúng' }, { status: 400 })
    }
    const session = createSession(user.id, request)
    return HttpResponse.json({ user: { ...user, password: null }, ...tokensOf(session) })
  }),

  // Xoay vòng refresh token; dùng lại token cũ (ngoài 30 giây ân hạn) thì thu hồi cả phiên
  http.post(api(apiUrls.auth.refresh), async ({ request }) => {
    const { refreshToken = '' } = (await request.json()) as { refreshToken?: string }
    const session = sessions.find((s) => s.id === sessionIdOf(refreshToken))
    if (!session || !isSessionActive(session)) return unauthorized('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại')
    if (session.refreshToken !== refreshToken) {
      if (session.previousToken === refreshToken && session.rotatedAt && Date.now() - session.rotatedAt < ROTATION_GRACE_MS) {
        return unauthorized('Phiên đăng nhập vừa được làm mới ở nơi khác')
      }
      session.revokedAt = new Date().toISOString()
      saveSessions()
      return unauthorized('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại')
    }
    const user = users.find((u) => u.id === session.userId)
    if (!user || !user.isActive) {
      session.revokedAt = new Date().toISOString()
      saveSessions()
      return unauthorized('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại')
    }
    session.previousToken = session.refreshToken
    session.refreshToken = newRefreshToken(session.id)
    session.rotatedAt = Date.now()
    session.lastUsedAt = new Date().toISOString()
    session.expiresAt = Date.now() + REFRESH_TTL_MS
    saveSessions()
    return HttpResponse.json({ user: { ...user, password: null }, ...tokensOf(session) })
  }),

  http.post(api(apiUrls.auth.logout), async ({ request }) => {
    const body = ((await request.json().catch(() => null)) ?? {}) as { refreshToken?: string | null }
    const sid = decodeToken(request)?.sid
    const session = sessions.find(
      (s) => s.id === sid || (!!body.refreshToken && (s.refreshToken === body.refreshToken || s.previousToken === body.refreshToken))
    )
    if (session && !session.revokedAt) {
      session.revokedAt = new Date().toISOString()
      saveSessions()
      return HttpResponse.json(true)
    }
    return HttpResponse.json(false)
  }),

  // Luôn trả cùng một thông báo; liên kết (thay cho email) in ra console để thử trên môi trường mock
  http.post(api(apiUrls.auth.forgotPassword), async ({ request }) => {
    const { userNameOrEmail = '' } = (await request.json()) as { userNameOrEmail?: string }
    const key = userNameOrEmail.trim().toLowerCase()
    if (!key) return badRequest('Vui lòng nhập tên đăng nhập hoặc email')
    const user = users.find((u) => u.username?.toLowerCase() === key || u.email?.toLowerCase() === key)
    const recent =
      !!user && [...resetTokens.values()].some((t) => t.userId === user.id && !t.used && Date.now() - t.createdAt < 60_000)
    if (user && user.isActive && !isDirectoryAccount(user.username) && user.email && !recent) {
      markUsed(user.id)
      const token = randomToken()
      resetTokens.set(token, { userId: user.id, createdAt: Date.now(), expiresAt: Date.now() + RESET_TTL_MS, used: false })
      const link = `/reset-password?token=${token}`
      // eslint-disable-next-line no-console
      console.info(`[MSW] Email đặt lại mật khẩu gửi ${user.email}: ${window.location.origin}${link}`)
      ;(window as unknown as { __mockLastResetLink?: string }).__mockLastResetLink = link
    }
    return HttpResponse.json({ message: FORGOT_MESSAGE })
  }),

  http.post(api(apiUrls.auth.resetPassword), async ({ request }) => {
    const { token = '', newPassword = '' } = (await request.json()) as { token?: string; newPassword?: string }
    const entry = resetTokens.get(token.trim())
    if (!entry || entry.used || entry.expiresAt <= Date.now()) {
      return badRequest('Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn')
    }
    const user = users.find((u) => u.id === entry.userId)
    if (!user || !user.isActive || isDirectoryAccount(user.username)) {
      return badRequest('Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn')
    }
    const policyError = checkPasswordPolicy(newPassword, user.username)
    if (policyError) return badRequest(policyError)
    passwords.set(user.id, newPassword)
    markUsed(user.id)
    revokeUserSessions(user.id)
    return HttpResponse.json({ message: 'Đã đặt lại mật khẩu, vui lòng đăng nhập bằng mật khẩu mới' })
  }),
]
