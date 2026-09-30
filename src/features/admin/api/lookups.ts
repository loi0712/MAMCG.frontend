import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiUrls } from '@/api/config/endpoints'
import { axios } from '@/shared/lib/axios'
import { ALL_ITEMS, type PagedParams, toPagedQuery } from './common'

// ===========================================
// TYPES (Identity: DepartmentDto, PositionDto)
// ===========================================

export interface Department {
  id: number
  name: string
  description: string | null
  // Số người dùng đang thuộc phòng ban (chỉ có ở danh sách phân trang)
  userCount?: number | null
}

export interface Position {
  id: number
  name: string
  description: string | null
  // Số người dùng đang giữ chức vụ (chỉ có ở danh sách phân trang)
  userCount?: number | null
}

export interface OrgUnitRequest {
  name: string
  description?: string | null
}

// ===========================================
// API FUNCTIONS
// ===========================================

export const getDepartmentsPaged = async (params: PagedParams) => {
  const res = await axios.get<{ departments: Department[]; totalCount: number }>(
    apiUrls.department.list,
    { params: toPagedQuery(params) }
  )
  return res.data
}

export const getPositionsPaged = async (params: PagedParams) => {
  const res = await axios.get<{ positions: Position[]; totalCount: number }>(
    apiUrls.position.list,
    { params: toPagedQuery(params) }
  )
  return res.data
}

export const getDepartments = async () => (await getDepartmentsPaged(ALL_ITEMS)).departments

export const getPositions = async () => (await getPositionsPaged(ALL_ITEMS)).positions

export const createDepartment = async (data: OrgUnitRequest) =>
  (await axios.post<Department>(apiUrls.department.create, data)).data

export const updateDepartment = async ({ id, data }: { id: number; data: OrgUnitRequest }) =>
  (await axios.put<Department>(apiUrls.department.update(id), data)).data

export const deleteDepartment = async (id: number) =>
  (await axios.delete<boolean>(apiUrls.department.delete(id))).data

export const createPosition = async (data: OrgUnitRequest) =>
  (await axios.post<Position>(apiUrls.position.create, data)).data

export const updatePosition = async ({ id, data }: { id: number; data: OrgUnitRequest }) =>
  (await axios.put<Position>(apiUrls.position.update(id), data)).data

export const deletePosition = async (id: number) =>
  (await axios.delete<boolean>(apiUrls.position.delete(id))).data

// ===========================================
// CUSTOM HOOKS
// ===========================================

export const useDepartments = () =>
  useQuery({ queryKey: ['departments'], queryFn: getDepartments, staleTime: 5 * 60 * 1000 })

export const usePositions = () =>
  useQuery({ queryKey: ['positions'], queryFn: getPositions, staleTime: 5 * 60 * 1000 })

export const useDepartmentsPaged = (params: PagedParams) =>
  useQuery({
    queryKey: ['departments', 'paged', params],
    queryFn: () => getDepartmentsPaged(params),
    placeholderData: keepPreviousData,
  })

export const usePositionsPaged = (params: PagedParams) =>
  useQuery({
    queryKey: ['positions', 'paged', params],
    queryFn: () => getPositionsPaged(params),
    placeholderData: keepPreviousData,
  })

// Đổi phòng ban/chức vụ thì danh sách người dùng (cột phòng ban/chức vụ) cũng cần tải lại
const useOrgMutation = <TVariables, TData>(
  kind: 'departments' | 'positions',
  mutationFn: (variables: TVariables) => Promise<TData>,
  successMessage: string
) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => {
      toast.success(successMessage)
      queryClient.invalidateQueries({ queryKey: [kind] })
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
  })
}

export const useCreateDepartment = () => useOrgMutation('departments', createDepartment, 'Đã thêm phòng ban')
export const useUpdateDepartment = () => useOrgMutation('departments', updateDepartment, 'Đã cập nhật phòng ban')
export const useDeleteDepartment = () => useOrgMutation('departments', deleteDepartment, 'Đã xoá phòng ban')
export const useCreatePosition = () => useOrgMutation('positions', createPosition, 'Đã thêm chức vụ')
export const useUpdatePosition = () => useOrgMutation('positions', updatePosition, 'Đã cập nhật chức vụ')
export const useDeletePosition = () => useOrgMutation('positions', deletePosition, 'Đã xoá chức vụ')
