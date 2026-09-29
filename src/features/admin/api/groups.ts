import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiUrls } from '@/api/config/endpoints'
import { axios } from '@/shared/lib/axios'
import { type PagedParams, toPagedQuery } from './common'

// ===========================================
// TYPES (Identity: ProductGroupDto, Create/UpdateProductGroupDto)
// ===========================================

export interface GroupUser {
  id: string
  fullName: string | null
  email: string | null
  isActive: boolean
}

export interface Group {
  id: number
  name: string | null
  description: string | null
  users: GroupUser[] | null
}

export interface GroupsResponse {
  groups: Group[]
  totalCount: number
}

export interface GroupRequest {
  name: string
  description?: string | null
  // Danh sách id người dùng, phân tách bởi dấu phẩy
  userIds?: string | null
}

// ===========================================
// API FUNCTIONS
// ===========================================

export const getGroups = async (params: PagedParams) => {
  const res = await axios.get<GroupsResponse>(apiUrls.group.list, { params: toPagedQuery(params) })
  return res.data
}

export const createGroup = async (data: GroupRequest) => {
  const res = await axios.post<Group>(apiUrls.group.create, data)
  return res.data
}

export const updateGroup = async ({ id, data }: { id: number; data: GroupRequest }) => {
  const res = await axios.put<Group>(apiUrls.group.update(id), data)
  return res.data
}

export const deleteGroup = async (id: number) => {
  const res = await axios.delete<boolean>(apiUrls.group.delete(id))
  return res.data
}

// ===========================================
// CUSTOM HOOKS
// ===========================================

export const useGroups = (params: PagedParams) =>
  useQuery({
    queryKey: ['admin-groups', params],
    queryFn: () => getGroups(params),
    placeholderData: keepPreviousData,
  })

const useInvalidateGroups = () => {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['admin-groups'] })
}

export const useCreateGroup = () => {
  const invalidate = useInvalidateGroups()
  return useMutation({
    mutationFn: createGroup,
    onSuccess: () => {
      toast.success('Đã thêm nhóm quyền')
      invalidate()
    },
  })
}

export const useUpdateGroup = () => {
  const invalidate = useInvalidateGroups()
  return useMutation({
    mutationFn: updateGroup,
    onSuccess: () => {
      toast.success('Đã cập nhật nhóm quyền')
      invalidate()
    },
  })
}

export const useDeleteGroup = () => {
  const invalidate = useInvalidateGroups()
  return useMutation({
    mutationFn: deleteGroup,
    onSuccess: () => {
      toast.success('Đã xoá nhóm quyền')
      invalidate()
    },
  })
}
