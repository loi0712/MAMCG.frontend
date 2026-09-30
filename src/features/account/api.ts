import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiUrls } from '@/api/config/endpoints'
import { axios, type SessionTokensResponse } from '@/shared/lib/axios'
import { useAuthStore } from '@/stores/auth-store'
import { type User } from '@/features/admin/api/users'

// ===========================================
// TYPES (Identity: UserProfileDto, UpdateProfileDto, UserSessionDto)
// ===========================================

export interface UserProfile extends User {
  // Tài khoản AD/LDAP: không đổi mật khẩu, họ tên, email tại đây
  isDirectoryAccount: boolean
  lastLoginAt: string | null
  createdAt: string
}

export interface UpdateProfileRequest {
  fullName: string
  email: string
  phoneNumber?: string | null
  gender?: boolean | null
  dateOfBirth?: string | null
  address?: string | null
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface UserSession {
  id: string
  createdAt: string
  lastUsedAt: string | null
  expiresAt: string
  ipAddress: string | null
  userAgent: string | null
  isCurrent: boolean
}

// ===========================================
// API FUNCTIONS
// ===========================================

export const getMyProfile = async () => {
  const res = await axios.get<UserProfile>(apiUrls.account.me)
  return res.data
}

export const updateMyProfile = async (data: UpdateProfileRequest) => {
  const res = await axios.put<UserProfile>(apiUrls.account.me, data)
  return res.data
}

export const changePassword = async (data: ChangePasswordRequest) => {
  const res = await axios.post<SessionTokensResponse & { message: string }>(apiUrls.account.changePassword, data)
  return res.data
}

export const getMySessions = async () => {
  const res = await axios.get<UserSession[]>(apiUrls.account.sessions)
  return res.data
}

export const revokeSession = async (id: string) => {
  const res = await axios.delete<boolean>(apiUrls.account.revokeSession(id))
  return res.data
}

export const revokeOtherSessions = async () => {
  const res = await axios.post<number>(apiUrls.account.revokeOtherSessions)
  return res.data
}

// ===========================================
// CUSTOM HOOKS
// ===========================================

export const useMyProfile = () => useQuery({ queryKey: ['my-profile'], queryFn: getMyProfile })

export const useUpdateMyProfile = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateMyProfile,
    onSuccess: (profile) => {
      toast.success('Đã cập nhật hồ sơ')
      queryClient.setQueryData(['my-profile'], profile)
      // Cập nhật tên/email hiển thị ở menu tài khoản
      const { auth } = useAuthStore.getState()
      if (auth.user) {
        auth.setUser({ ...auth.user, fullName: profile.fullName ?? auth.user.fullName, email: profile.email ?? auth.user.email, phoneNumber: profile.phoneNumber })
      }
    },
  })
}

export const useChangePassword = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: changePassword,
    onSuccess: (res) => {
      // Máy chủ thu hồi mọi phiên cũ và cấp phiên mới cho thiết bị này
      useAuthStore.getState().auth.setTokens(res.token, res.refreshToken)
      toast.success(res.message || 'Đã đổi mật khẩu')
      queryClient.invalidateQueries({ queryKey: ['my-sessions'] })
    },
  })
}

export const useMySessions = () => useQuery({ queryKey: ['my-sessions'], queryFn: getMySessions })

export const useRevokeSession = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: revokeSession,
    onSuccess: () => {
      toast.success('Đã đăng xuất phiên')
      queryClient.invalidateQueries({ queryKey: ['my-sessions'] })
    },
  })
}

export const useRevokeOtherSessions = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: revokeOtherSessions,
    onSuccess: (count) => {
      toast.success(count > 0 ? `Đã đăng xuất ${count} phiên khác` : 'Không có phiên nào khác')
      queryClient.invalidateQueries({ queryKey: ['my-sessions'] })
    },
  })
}
