import { http, HttpResponse } from 'msw'
import { apiUrls } from '@/api/config/endpoints'
import type { ChangePasswordRequest, UpdateProfileRequest } from '@/features/account/api'
import type { User } from '@/features/admin/api/users'
import { users } from '../db'
import {
  checkPasswordPolicy,
  createSession,
  currentUser,
  decodeToken,
  isDirectoryAccount,
  isSessionActive,
  passwordMatches,
  passwords,
  revokeUserSessions,
  saveSessions,
  sessions,
  tokensOf,
} from './auth'
import { api, notFound } from './utils'

// Thông tin chỉ có ở hồ sơ (UserProfileDto)
const extras = new Map<string, { createdAt: string; lastLoginAt: string | null }>()

const toProfile = (u: User) => {
  const extra = extras.get(u.id) ?? { createdAt: '2025-08-15T08:00:00', lastLoginAt: new Date().toISOString() }
  return { ...u, isDirectoryAccount: isDirectoryAccount(u.username), ...extra }
}

const badRequest = (title: string) => HttpResponse.json({ title, status: 400 }, { status: 400 })
const unauthorized = () => new HttpResponse(null, { status: 401 })

export const accountHandlers = [
  http.get(api(apiUrls.account.me), ({ request }) => {
    const user = currentUser(request)
    return user ? HttpResponse.json(toProfile(user)) : unauthorized()
  }),

  // Không cho sửa tên đăng nhập, phòng ban, chức vụ, trạng thái; họ tên/email của tài khoản LDAP
  http.put(api(apiUrls.account.me), async ({ request }) => {
    const user = currentUser(request)
    if (!user) return unauthorized()
    const data = (await request.json()) as UpdateProfileRequest
    const fullName = data.fullName?.trim() ?? ''
    const email = data.email?.trim() ?? ''
    if (!fullName) return badRequest('Vui lòng nhập họ tên')
    if (!/^[^@\s]+@[^@\s]+$/.test(email)) return badRequest('Email không hợp lệ')
    if (isDirectoryAccount(user.username) && (fullName !== user.fullName || email.toLowerCase() !== user.email?.toLowerCase())) {
      return badRequest('Họ tên và email của tài khoản AD/LDAP được đồng bộ từ máy chủ thư mục, không sửa được tại đây')
    }
    if (users.some((u) => u.id !== user.id && u.email?.toLowerCase() === email.toLowerCase())) {
      return HttpResponse.json({ title: 'Email đã được sử dụng cho tài khoản khác', status: 409 }, { status: 409 })
    }
    Object.assign(user, {
      fullName,
      email,
      phoneNumber: data.phoneNumber?.trim() || null,
      gender: data.gender ?? null,
      dateOfBirth: data.dateOfBirth ?? null,
      address: data.address?.trim() || null,
    })
    return HttpResponse.json(toProfile(user))
  }),

  // Kiểm tra mật khẩu cũ + chính sách; thu hồi mọi phiên rồi cấp phiên mới cho thiết bị hiện tại
  http.post(api(apiUrls.account.changePassword), async ({ request }) => {
    const user = currentUser(request)
    if (!user) return unauthorized()
    const data = (await request.json()) as ChangePasswordRequest
    if (isDirectoryAccount(user.username)) {
      return badRequest(
        'Tài khoản đăng nhập bằng AD/LDAP không đổi mật khẩu trong hệ thống. Vui lòng đổi mật khẩu trên máy chủ thư mục (AD/LDAP).'
      )
    }
    if (!passwordMatches(user.id, data.currentPassword)) return badRequest('Mật khẩu hiện tại không đúng')
    if (data.currentPassword === data.newPassword) return badRequest('Mật khẩu mới phải khác mật khẩu hiện tại')
    const policyError = checkPasswordPolicy(data.newPassword, user.username)
    if (policyError) return badRequest(policyError)
    passwords.set(user.id, data.newPassword)
    revokeUserSessions(user.id)
    const session = createSession(user.id, request)
    return HttpResponse.json({ message: 'Đã đổi mật khẩu. Các thiết bị khác đã bị đăng xuất.', ...tokensOf(session) })
  }),

  http.get(api(apiUrls.account.sessions), ({ request }) => {
    const user = currentUser(request)
    if (!user) return unauthorized()
    const sid = decodeToken(request)?.sid
    return HttpResponse.json(
      sessions
        .filter((s) => s.userId === user.id && isSessionActive(s))
        .sort((a, b) => b.lastUsedAt.localeCompare(a.lastUsedAt))
        .map((s) => ({
          id: s.id,
          createdAt: s.createdAt,
          lastUsedAt: s.lastUsedAt,
          expiresAt: new Date(s.expiresAt).toISOString(),
          ipAddress: s.ipAddress,
          userAgent: s.userAgent,
          isCurrent: s.id === sid,
        }))
    )
  }),

  http.delete(api(apiUrls.account.revokeSession(':id')), ({ request, params }) => {
    const user = currentUser(request)
    if (!user) return unauthorized()
    const session = sessions.find((s) => s.id === params.id && s.userId === user.id)
    if (!session) return notFound()
    session.revokedAt ??= new Date().toISOString()
    saveSessions()
    return HttpResponse.json(true)
  }),

  http.post(api(apiUrls.account.revokeOtherSessions), ({ request }) => {
    const user = currentUser(request)
    if (!user) return unauthorized()
    return HttpResponse.json(revokeUserSessions(user.id, decodeToken(request)?.sid))
  }),
]
