import { AxiosError } from 'axios'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { handleServerError } from '@/utils/handle-server-error'
import { apiUrls } from '@/api/config/endpoints'
import { axios } from '@/shared/lib/axios'
import { type WorkflowHistory } from '@/features/asset/api/get-asset'

// ===========================================
// TYPES (Asset.Application.CGScenes.Dtos)
// ===========================================

// Biến của template: JSON gốc giữ tên PascalCase (CGJsonVariable), riêng AssetId là camelCase
export interface CGTemplateVariable {
  DisplayName?: string | null
  IsRequiredAsset?: boolean
  assetId?: number | null
  Value?: string | null
  W?: number | null
  H?: number | null
  X?: number | null
  Y?: number | null
  Color?: string | null
}

export interface CGTemplate {
  id: number
  name: string
  jsonContent: {
    SceneName: string
    FolderPath: string
    ScenePath: string
    PreviewPath: string
    Background?: string | null
    Variables?: Record<string, CGTemplateVariable> | null
  }
}

export interface CGSceneVariable {
  displayName?: string | null
  isRequiredAsset?: boolean
  assetId?: number | null
  value?: string | null
  w?: number | null
  h?: number | null
  x?: number | null
  y?: number | null
  color?: string | null
}

export interface CGSceneContent {
  sceneName: string
  folderPath: string
  scenePath: string
  previewPath: string
  background?: string | null
  variables?: Record<string, CGSceneVariable> | null
}

export interface CreateCGSceneRequest {
  cgTemplateId: number
  jsonContent: CGSceneContent
}

export interface CGSceneListField {
  id: number
  fieldName: string
  dataType: string
  displayName: string
  value: string | null
  color: string | null
}

export interface CGSceneListItem {
  id: number
  workflowItemId: number
  code: string | null
  createdAt: string | null
  fields: CGSceneListField[]
}

export interface CGScenesResponse {
  cgScenes: CGSceneListItem[]
  totalCount: number
}

export interface CGWorkflowAction {
  id: string
  name: string
  color: string | null
  requireUpload: boolean
}

export interface CGSceneDetail {
  success: boolean
  message: string | null
  id: number
  code: string
  workflowItem: { id: number; histories: WorkflowHistory[]; actions: CGWorkflowAction[] } | null
  fields: { fieldName: string; displayName: string; value: string | null }[]
  scenes: CGSceneContent[]
  backgrounds?: { name: string; value: string }[] | null
}

interface ApiResponse {
  success: boolean
  message: string | null
}

// ===========================================
// API FUNCTIONS
// ===========================================

export const getCGTemplates = async () => {
  const res = await axios.get<CGTemplate[]>(apiUrls.cgScene.templates)
  return res.data
}

export const getCGScenes = async (params: { pageNumber: number; pageSize: number }) => {
  const res = await axios.get<CGScenesResponse>(apiUrls.cgScene.list, { params })
  // Backend trả 1 phần tử rỗng (id = 0) khi không có dữ liệu để giữ cấu trúc cột
  return { ...res.data, cgScenes: res.data.cgScenes.filter((s) => s.id > 0) }
}

export const getCGScene = async (id: number) => {
  const res = await axios.get<CGSceneDetail>(apiUrls.cgScene.details(id))
  if (res.data.success === false) throw new Error(res.data.message || 'Không tìm thấy CG scene')
  return res.data
}

export const createCGScene = async (data: CreateCGSceneRequest) => {
  const res = await axios.post<CGSceneDetail>(apiUrls.cgScene.create, data)
  // Lỗi nghiệp vụ của API tạo scene trả về 200 kèm success = false
  if (res.data.success === false) throw new Error(res.data.message || 'Tạo CG scene thất bại')
  return res.data
}

export const approveCGScene = async ({ id, actionId, comment }: { id: number; actionId: number; comment?: string }) => {
  const res = await axios.put<ApiResponse>(apiUrls.cgScene.approval(id), { actionId, comment })
  if (res.data.success === false) throw new Error(res.data.message || 'Xử lý quy trình thất bại')
  return res.data
}

// ===========================================
// CUSTOM HOOKS
// ===========================================

// Lỗi HTTP → thông báo từ máy chủ; lỗi nghiệp vụ (success = false) → thông điệp đi kèm
const notifyError = (error: unknown) => {
  if (error instanceof AxiosError || !(error instanceof Error)) handleServerError(error)
  else toast.error(error.message)
}

export const useCGTemplates = () =>
  useQuery({ queryKey: ['cg-templates'], queryFn: getCGTemplates, staleTime: 5 * 60 * 1000 })

export const useCGScenes = (params: { pageNumber: number; pageSize: number }) =>
  useQuery({
    queryKey: ['cg-scenes', params],
    queryFn: () => getCGScenes(params),
    placeholderData: keepPreviousData,
  })

export const useCGScene = (id: number | null) =>
  useQuery({
    queryKey: ['cg-scene', id],
    queryFn: () => getCGScene(id as number),
    enabled: id != null && id > 0,
  })

export const useCreateCGScene = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createCGScene,
    onSuccess: () => {
      toast.success('Đã tạo CG scene')
      queryClient.invalidateQueries({ queryKey: ['cg-scenes'] })
    },
    onError: notifyError,
  })
}

export const useApproveCGScene = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: approveCGScene,
    onSuccess: (_data, variables) => {
      toast.success('Đã thực hiện hành động quy trình')
      queryClient.invalidateQueries({ queryKey: ['cg-scenes'] })
      queryClient.invalidateQueries({ queryKey: ['cg-scene', variables.id] })
    },
    onError: notifyError,
  })
}
