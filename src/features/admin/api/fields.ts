import { keepPreviousData, useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiUrls } from '@/api/config/endpoints'
import { axios } from '@/shared/lib/axios'
import { type PagedParams, toPagedQuery } from './common'

// ===========================================
// TYPES (Asset: ViewListFieldDto, ViewDetailFieldDto, DataTypeDto, Create/UpdateFieldDto)
// ===========================================

export interface FieldListItem {
  id: number
  name: string
}

export interface FieldsResponse {
  fields: FieldListItem[]
  totalCount: number
}

export interface DataType {
  id: number
  name: string
  datasource: string | null
}

export interface FieldDetail {
  id: number
  fieldName: string
  displayName: string
  dataType: DataType | null
  isRequired: boolean
  editable: boolean
  value: string | null
}

export interface FieldRequest {
  fieldName: string
  displayName: string
  dataTypeId: number
  isRequired: boolean
  defaultValue: string
  editable: boolean
}

// ===========================================
// API FUNCTIONS
// ===========================================

export const getFields = async (params: PagedParams) => {
  const res = await axios.get<FieldsResponse>(apiUrls.field.list, { params: toPagedQuery(params) })
  return res.data
}

export const getDataTypes = async () => {
  const res = await axios.get<DataType[]>(apiUrls.field.dataTypes)
  return res.data
}

export const getField = async (id: number) => {
  const res = await axios.get<FieldDetail>(apiUrls.field.details(id))
  return res.data
}

export const createField = async (data: FieldRequest) => {
  const res = await axios.post<FieldDetail>(apiUrls.field.create, data)
  return res.data
}

export const updateField = async ({ id, data }: { id: number; data: Partial<FieldRequest> }) => {
  const res = await axios.put<FieldDetail>(apiUrls.field.update(id), data)
  return res.data
}

export const deleteField = async (id: number) => {
  const res = await axios.delete<boolean>(apiUrls.field.delete(id))
  return res.data
}

// ===========================================
// CUSTOM HOOKS
// ===========================================

export const useFields = (params: PagedParams) =>
  useQuery({
    queryKey: ['admin-fields', params],
    queryFn: () => getFields(params),
    placeholderData: keepPreviousData,
  })

export const useDataTypes = () =>
  useQuery({ queryKey: ['admin-data-types'], queryFn: getDataTypes, staleTime: 5 * 60 * 1000 })

// API danh sách chỉ trả id + tên: lấy chi tiết cho các trường đang hiển thị
export const useFieldDetails = (ids: number[]) =>
  useQueries({
    queries: ids.map((id) => ({
      queryKey: ['admin-field', id],
      queryFn: () => getField(id),
    })),
  })

const useInvalidateFields = () => {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ['admin-fields'] })
    queryClient.invalidateQueries({ queryKey: ['admin-field'] })
  }
}

export const useCreateField = () => {
  const invalidate = useInvalidateFields()
  return useMutation({
    mutationFn: createField,
    onSuccess: () => {
      toast.success('Đã thêm trường dữ liệu')
      invalidate()
    },
  })
}

export const useUpdateField = () => {
  const invalidate = useInvalidateFields()
  return useMutation({
    mutationFn: updateField,
    onSuccess: () => {
      toast.success('Đã cập nhật trường dữ liệu')
      invalidate()
    },
  })
}

export const useDeleteField = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteField,
    onSuccess: (_data, id) => {
      toast.success('Đã xoá trường dữ liệu')
      // Bỏ mục khỏi danh sách đã cache trước, rồi gỡ chi tiết của nó:
      // nếu không, hàng cũ còn hiển thị sẽ gọi lại chi tiết và nhận 404
      queryClient.setQueriesData<FieldsResponse>({ queryKey: ['admin-fields'] }, (old) =>
        old && { ...old, fields: old.fields.filter((x) => x.id !== id), totalCount: old.totalCount - 1 }
      )
      queryClient.removeQueries({ queryKey: ['admin-field', id] })
      queryClient.invalidateQueries({ queryKey: ['admin-fields'] })
    },
  })
}
