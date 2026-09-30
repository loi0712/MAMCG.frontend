import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiUrls } from '@/api/config/endpoints'
import { axios } from '@/shared/lib/axios'

// ===========================================
// TYPES (Asset.Application.Categories.Dtos)
// ===========================================

export interface CategoryListItem {
  id: number
  name: string
  groupId: number
  code: string | null
  description: string | null
  groupName: string | null
}

export interface CategoryGroupListItem {
  id: number
  name: string
  description: string | null
  categoryCount: number
}

export interface CategoryDetail {
  id: number
  code: string
  name: string
  description: string | null
  group: { id: number; name: string; description: string | null } | null
}

export interface CategoryListParams {
  pageNumber: number
  pageSize: number
  groupId?: number
  searchTerm?: string
}

export interface CategoryRequest {
  name: string
  groupId: number
  code: string
  description: string
}

export interface CategoryGroupRequest {
  name: string
  description: string
}

// ===========================================
// API FUNCTIONS
// ===========================================

export const getCategoryList = async ({ pageNumber, pageSize, groupId, searchTerm }: CategoryListParams) => {
  const res = await axios.get<{ categories: CategoryListItem[]; totalCount: number }>(apiUrls.category.list, {
    params: { pageNumber, pageSize, ...(groupId ? { groupId } : {}), ...(searchTerm ? { searchTerm } : {}) },
  })
  return res.data
}

export const getCategoryDetail = async (id: number) => {
  const res = await axios.get<{ category: CategoryDetail | null }>(apiUrls.category.details(id))
  return res.data.category
}

export const updateCategory = async ({ id, data }: { id: number; data: CategoryRequest }) => {
  const res = await axios.put(apiUrls.category.update(id), data)
  return res.data
}

export const deleteCategory = async (id: number) => {
  await axios.delete(apiUrls.category.delete(id))
}

export const getCategoryGroupList = async ({ pageNumber, pageSize, searchTerm }: Omit<CategoryListParams, 'groupId'>) => {
  const res = await axios.get<{ categoryGroups: CategoryGroupListItem[]; totalCount: number }>(apiUrls.categoryGroup.list, {
    params: { pageNumber, pageSize, ...(searchTerm ? { searchTerm } : {}) },
  })
  return res.data
}

export const createCategoryGroup = async (data: CategoryGroupRequest) => {
  const res = await axios.post(apiUrls.categoryGroup.create, data)
  return res.data
}

export const updateCategoryGroup = async ({ id, data }: { id: number; data: CategoryGroupRequest }) => {
  const res = await axios.put(apiUrls.categoryGroup.update(id), data)
  return res.data
}

export const deleteCategoryGroup = async (id: number) => {
  await axios.delete(apiUrls.categoryGroup.delete(id))
}

// ===========================================
// CUSTOM HOOKS
// ===========================================

export const useCategoryList = (params: CategoryListParams) =>
  useQuery({
    queryKey: ['categories', 'list', params],
    queryFn: () => getCategoryList(params),
    placeholderData: keepPreviousData,
  })

export const useCategoryDetail = (id: number | null) =>
  useQuery({
    queryKey: ['categories', 'detail', id],
    queryFn: () => getCategoryDetail(id as number),
    enabled: id != null,
  })

export const useCategoryGroupList = (params: Omit<CategoryListParams, 'groupId'>) =>
  useQuery({
    queryKey: ['category-group-list', params],
    queryFn: () => getCategoryGroupList(params),
    placeholderData: keepPreviousData,
  })

// Nhóm/chuyên mục còn được dùng ở form tạo thiết kế, thư mục, bộ lọc → làm mới hết
const useInvalidateCategories = () => {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ['categories'] })
    queryClient.invalidateQueries({ queryKey: ['category-groups'] })
    queryClient.invalidateQueries({ queryKey: ['category-group-list'] })
    queryClient.invalidateQueries({ queryKey: ['dynamic-fields-create'] })
  }
}

export const useUpdateCategory = () => {
  const invalidate = useInvalidateCategories()
  return useMutation({
    mutationFn: updateCategory,
    onSuccess: () => {
      toast.success('Đã cập nhật chuyên mục')
      invalidate()
    },
  })
}

export const useDeleteCategory = () => {
  const invalidate = useInvalidateCategories()
  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      toast.success('Đã xoá chuyên mục')
      invalidate()
    },
  })
}

export const useCreateCategoryGroup = () => {
  const invalidate = useInvalidateCategories()
  return useMutation({
    mutationFn: createCategoryGroup,
    onSuccess: () => {
      toast.success('Đã thêm nhóm chuyên mục')
      invalidate()
    },
  })
}

export const useUpdateCategoryGroup = () => {
  const invalidate = useInvalidateCategories()
  return useMutation({
    mutationFn: updateCategoryGroup,
    onSuccess: () => {
      toast.success('Đã cập nhật nhóm chuyên mục')
      invalidate()
    },
  })
}

export const useDeleteCategoryGroup = () => {
  const invalidate = useInvalidateCategories()
  return useMutation({
    mutationFn: deleteCategoryGroup,
    onSuccess: () => {
      toast.success('Đã xoá nhóm chuyên mục')
      invalidate()
    },
  })
}
