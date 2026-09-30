import { z } from 'zod'
import { apiUrls } from '@/api/config/endpoints'
import { axios } from '@/shared/lib/axios'

// ===========================================
// CHÍNH SÁCH MẬT KHẨU (giống Identity PasswordPolicy)
// ===========================================

export const PASSWORD_POLICY_HINT = 'Tối thiểu 8 ký tự, gồm cả chữ và số'

export const passwordSchema = z
  .string()
  .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
  .max(100, 'Mật khẩu không được vượt quá 100 ký tự')
  .refine((v) => /\p{L}/u.test(v) && /\d/.test(v), 'Mật khẩu phải gồm cả chữ và số')

// ===========================================
// API FUNCTIONS (không cần đăng nhập)
// ===========================================

export const requestPasswordReset = async (userNameOrEmail: string) => {
  const res = await axios.post<{ message: string }>(apiUrls.auth.forgotPassword, { userNameOrEmail })
  return res.data
}

export const resetPassword = async (data: { token: string; newPassword: string }) => {
  const res = await axios.post<{ message: string }>(apiUrls.auth.resetPassword, data)
  return res.data
}
