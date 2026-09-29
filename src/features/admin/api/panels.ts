import { keepPreviousData, useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiUrls } from '@/api/config/endpoints'
import { axios } from '@/shared/lib/axios'
import { type PagedParams, toPagedQuery } from './common'
import { type FieldDetail } from './fields'

// ===========================================
// TYPES (Asset: ViewListPanelDto, ViewDetailPanelDto, Create/UpdatePanelDto)
// ===========================================

export interface PanelListItem {
  id: number
  panelName: string
}

export interface PanelsResponse {
  panels: PanelListItem[]
  totalCount: number
}

export interface PanelDetail {
  id: number
  panelName: string
  description: string | null
  visibilityRules: string | null
  index: number
  fields: FieldDetail[]
}

export interface PanelRequest {
  panelName: string
  description?: string | null
  visibilityRules?: string | null
  index?: number | null
  // Danh sách id trường, phân tách bởi dấu phẩy
  fieldIds?: string | null
}

// ===========================================
// API FUNCTIONS
// ===========================================

export const getPanels = async (params: PagedParams) => {
  const res = await axios.get<PanelsResponse>(apiUrls.panel.list, { params: toPagedQuery(params) })
  return res.data
}

export const getPanel = async (id: number) => {
  const res = await axios.get<PanelDetail>(apiUrls.panel.details(id))
  return res.data
}

export const createPanel = async (data: PanelRequest) => {
  const res = await axios.post<PanelDetail>(apiUrls.panel.create, data)
  return res.data
}

export const updatePanel = async ({ id, data }: { id: number; data: PanelRequest }) => {
  const res = await axios.put<PanelDetail>(apiUrls.panel.update(id), data)
  return res.data
}

export const deletePanel = async (id: number) => {
  const res = await axios.delete<boolean>(apiUrls.panel.delete(id))
  return res.data
}

// ===========================================
// CUSTOM HOOKS
// ===========================================

export const usePanels = (params: PagedParams) =>
  useQuery({
    queryKey: ['admin-panels', params],
    queryFn: () => getPanels(params),
    placeholderData: keepPreviousData,
  })

// API danh sách chỉ trả id + tên: lấy chi tiết cho các panel đang hiển thị
export const usePanelDetails = (ids: number[]) =>
  useQueries({
    queries: ids.map((id) => ({
      queryKey: ['admin-panel', id],
      queryFn: () => getPanel(id),
    })),
  })

const useInvalidatePanels = () => {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ['admin-panels'] })
    queryClient.invalidateQueries({ queryKey: ['admin-panel'] })
  }
}

export const useCreatePanel = () => {
  const invalidate = useInvalidatePanels()
  return useMutation({
    mutationFn: createPanel,
    onSuccess: () => {
      toast.success('Đã thêm panel hiển thị')
      invalidate()
    },
  })
}

export const useUpdatePanel = () => {
  const invalidate = useInvalidatePanels()
  return useMutation({
    mutationFn: updatePanel,
    onSuccess: () => {
      toast.success('Đã cập nhật panel hiển thị')
      invalidate()
    },
  })
}

export const useDeletePanel = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deletePanel,
    onSuccess: (_data, id) => {
      toast.success('Đã xoá panel hiển thị')
      // Bỏ mục khỏi danh sách đã cache trước, rồi gỡ chi tiết của nó:
      // nếu không, hàng cũ còn hiển thị sẽ gọi lại chi tiết và nhận 404
      queryClient.setQueriesData<PanelsResponse>({ queryKey: ['admin-panels'] }, (old) =>
        old && { ...old, panels: old.panels.filter((x) => x.id !== id), totalCount: old.totalCount - 1 }
      )
      queryClient.removeQueries({ queryKey: ['admin-panel', id] })
      queryClient.invalidateQueries({ queryKey: ['admin-panels'] })
    },
  })
}
