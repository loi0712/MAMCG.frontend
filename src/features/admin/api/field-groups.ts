import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiUrls } from '@/api/config/endpoints'
import { axios } from '@/shared/lib/axios'
import { type PagedParams, toPagedQuery } from './common'

// ===========================================
// TYPES (Asset: FieldGroupListItemDto, FieldGroupDetailDto, FieldGroupUpsertDto)
// ===========================================

export interface FieldGroupListItem {
  id: number
  name: string
  description: string | null
  displayOrder: number
  isActive: boolean
  fieldCount: number
  createdAt: string
  modifiedAt: string
}

export interface FieldGroupsResponse {
  items: FieldGroupListItem[]
  totalCount: number
}

export interface FieldGroupField {
  id: number
  fieldName: string
  displayName: string
  dataTypeId: number
  dataTypeName: string | null
  isRequired: boolean
  isSystemField: boolean
  displayOrder: number
}

export interface FieldGroupDetail {
  id: number
  name: string
  description: string | null
  displayOrder: number
  isActive: boolean
  createdAt: string
  modifiedAt: string
  fields: FieldGroupField[]
}

export interface FieldGroupRequest {
  name: string
  description?: string | null
  displayOrder: number
  isActive: boolean
  // Danh sách id trường theo thứ tự hiển thị; null = giữ nguyên
  fieldIds?: number[] | null
}

export interface FieldGroupParams extends PagedParams {
  isActive?: boolean
}

// ===========================================
// API FUNCTIONS
// ===========================================

export const getFieldGroups = async ({ isActive, ...params }: FieldGroupParams) => {
  const res = await axios.get<FieldGroupsResponse>(apiUrls.fieldGroup.list, {
    params: { ...toPagedQuery(params), ...(isActive !== undefined ? { isActive } : {}) },
  })
  return res.data
}

export const getFieldGroup = async (id: number) => {
  const res = await axios.get<FieldGroupDetail>(apiUrls.fieldGroup.details(id))
  return res.data
}

export const createFieldGroup = async (data: FieldGroupRequest) => {
  const res = await axios.post<FieldGroupDetail>(apiUrls.fieldGroup.create, data)
  return res.data
}

export const updateFieldGroup = async ({ id, data }: { id: number; data: FieldGroupRequest }) => {
  const res = await axios.put<FieldGroupDetail>(apiUrls.fieldGroup.update(id), data)
  return res.data
}

export const setFieldGroupFields = async ({ id, fieldIds }: { id: number; fieldIds: number[] }) => {
  const res = await axios.put<FieldGroupDetail>(apiUrls.fieldGroup.fields(id), { fieldIds })
  return res.data
}

export const deleteFieldGroup = async (id: number) => {
  await axios.delete(apiUrls.fieldGroup.delete(id))
}

// ===========================================
// CUSTOM HOOKS
// ===========================================

export const useFieldGroups = (params: FieldGroupParams) =>
  useQuery({
    queryKey: ['admin-field-groups', params],
    queryFn: () => getFieldGroups(params),
    placeholderData: keepPreviousData,
  })

export const useFieldGroup = (id: number | null | undefined) =>
  useQuery({
    queryKey: ['admin-field-group', id],
    queryFn: () => getFieldGroup(id as number),
    enabled: id != null,
  })

const useInvalidateFieldGroups = () => {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ['admin-field-groups'] })
    queryClient.invalidateQueries({ queryKey: ['admin-field-group'] })
  }
}

export const useCreateFieldGroup = () => {
  const invalidate = useInvalidateFieldGroups()
  return useMutation({
    mutationFn: createFieldGroup,
    onSuccess: () => {
      toast.success('Đã thêm nhóm trường')
      invalidate()
    },
  })
}

export const useUpdateFieldGroup = () => {
  const invalidate = useInvalidateFieldGroups()
  return useMutation({
    mutationFn: updateFieldGroup,
    onSuccess: () => {
      toast.success('Đã cập nhật nhóm trường')
      invalidate()
    },
  })
}

export const useSetFieldGroupFields = () => {
  const invalidate = useInvalidateFieldGroups()
  return useMutation({
    mutationFn: setFieldGroupFields,
    onSuccess: () => {
      toast.success('Đã cập nhật danh sách trường')
      invalidate()
    },
  })
}

export const useDeleteFieldGroup = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteFieldGroup,
    onSuccess: (_data, id) => {
      toast.success('Đã xoá nhóm trường')
      queryClient.removeQueries({ queryKey: ['admin-field-group', id] })
      queryClient.invalidateQueries({ queryKey: ['admin-field-groups'] })
    },
  })
}
