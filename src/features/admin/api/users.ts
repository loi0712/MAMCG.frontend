import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiUrls } from '@/api/config/endpoints'
import { axios } from '@/shared/lib/axios'
import { type PagedParams, toPagedQuery } from './common'
import { type Department, type Position } from './lookups'

// ===========================================
// TYPES (Identity: UserDto, CreateUserDto, UpdateUserDto)
// ===========================================

export interface User {
  id: string
  username: string | null
  fullName: string | null
  email: string | null
  phoneNumber: string | null
  gender: boolean | null
  dateOfBirth: string | null
  address: string | null
  department: Department | null
  position: Position | null
  imageUrl: string | null
  isActive: boolean
}

export interface UsersResponse {
  users: User[]
  totalCount: number
}

export interface CreateUserRequest {
  username: string
  password: string
  fullName: string
  email: string
  phoneNumber?: string | null
  departmentId?: number | null
  positionId?: number | null
  isActive: boolean
}

// Mọi trường là tuỳ chọn; password rỗng/không gửi thì giữ mật khẩu cũ
export type UpdateUserRequest = Partial<Omit<CreateUserRequest, 'username'>>

// ===========================================
// API FUNCTIONS
// ===========================================

export const getUsers = async (params: PagedParams) => {
  const res = await axios.get<UsersResponse>(apiUrls.user.list, { params: toPagedQuery(params) })
  return res.data
}

export const createUser = async (data: CreateUserRequest) => {
  const res = await axios.post<User>(apiUrls.user.create, data)
  return res.data
}

export const updateUser = async ({ id, data }: { id: string; data: UpdateUserRequest }) => {
  const res = await axios.put<User>(apiUrls.user.update(id), data)
  return res.data
}

// CSV (UTF-8 BOM) do máy chủ tạo; lấy tên file từ Content-Disposition
export const exportUsers = async (searchTerm?: string) => {
  const res = await axios.get<Blob>(apiUrls.user.export, {
    params: searchTerm ? { searchTerm } : undefined,
    responseType: 'blob',
  })
  const disposition = String(res.headers['content-disposition'] ?? '')
  const match = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(disposition)
  const fileName = match ? decodeURIComponent(match[1] ?? match[2]) : `nguoi-dung_${new Date().toISOString().split('T')[0]}.csv`
  const url = URL.createObjectURL(res.data)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}

export const deleteUser = async (id: string) => {
  const res = await axios.delete<boolean>(apiUrls.user.delete(id))
  return res.data
}

// ===========================================
// CUSTOM HOOKS
// ===========================================

export const useUsers = (params: PagedParams) =>
  useQuery({
    queryKey: ['admin-users', params],
    queryFn: () => getUsers(params),
    placeholderData: keepPreviousData,
  })

const useInvalidateUsers = () => {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['admin-users'] })
}

export const useCreateUser = () => {
  const invalidate = useInvalidateUsers()
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      toast.success('Đã thêm người dùng')
      invalidate()
    },
  })
}

export const useUpdateUser = () => {
  const invalidate = useInvalidateUsers()
  return useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      toast.success('Đã cập nhật người dùng')
      invalidate()
    },
  })
}

export const useExportUsers = () =>
  useMutation({
    mutationFn: exportUsers,
    onSuccess: () => toast.success('Đã xuất danh sách người dùng'),
  })

export const useDeleteUser = () => {
  const invalidate = useInvalidateUsers()
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      toast.success('Đã xoá người dùng')
      invalidate()
    },
  })
}
