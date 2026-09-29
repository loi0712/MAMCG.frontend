import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiUrls } from '@/api/config/endpoints'
import { axios } from '@/shared/lib/axios'
import { type PagedParams, toPagedQuery } from './common'

// ===========================================
// TYPES (Content: /api/WorkflowDefinition — WorkflowAdminDtos)
// ===========================================

export interface WorkflowListItem {
  id: number
  name: string
  description: string | null
  isActive: boolean
  statusCount: number
  transitionCount: number
  // Số nội dung đang chạy (chưa tới trạng thái kết thúc)
  activeItemCount: number
  createdAt: string
  modifiedAt: string
}

export interface WorkflowsResponse {
  items: WorkflowListItem[]
  totalCount: number
}

export interface WorkflowStatus {
  id: number
  // null = trạng thái dùng chung (không thuộc riêng quy trình nào, không sửa/xoá được)
  workflowId: number | null
  name: string
  color: string | null
  displayOrder: number | null
  description: string | null
  isInitial: boolean
  isFinal: boolean
  itemCount: number
}

export interface WorkflowTransition {
  id: number
  workflowId: number
  // null = bước khởi tạo (nội dung mới tạo đi vào toStatusId)
  fromStatusId: number | null
  fromStatusName: string | null
  toStatusId: number | null
  toStatusName: string | null
  actionId: number | null
  actionName: string | null
  deadlineHours: number | null
  // Id người dùng (GUID) và/hoặc id nhóm (số), phân tách bởi dấu phẩy
  assignedUserGroupId: string | null
  requireUpload: boolean
  notificationTypeId: number | null
}

export interface WorkflowDetail {
  id: number
  name: string
  description: string | null
  isActive: boolean
  // JSON bố cục sơ đồ (nodes/connections) do giao diện tự quản lý
  layoutJson: string | null
  createdAt: string
  modifiedAt: string
  statuses: WorkflowStatus[]
  transitions: WorkflowTransition[]
}

export interface WorkflowAction {
  id: number
  name: string
  color: string | null
  icon: string | null
  displayOrder: number | null
  description: string | null
}

export interface WorkflowRequest {
  name: string
  description?: string | null
  isActive: boolean
}

export interface WorkflowStatusRequest {
  name: string
  color?: string | null
  displayOrder?: number | null
  description?: string | null
  isInitial: boolean
  isFinal: boolean
}

export interface WorkflowTransitionRequest {
  fromStatusId: number | null
  toStatusId: number
  actionId: number
  deadlineHours?: number | null
  assignedUserGroupId?: string | null
  requireUpload: boolean
  notificationTypeId?: number | null
}

export interface WorkflowActionRequest {
  name: string
  color?: string | null
  icon?: string | null
  displayOrder?: number | null
  description?: string | null
}

export interface WorkflowParams extends PagedParams {
  isActive?: boolean
}

// ===========================================
// API FUNCTIONS
// ===========================================

const w = apiUrls.workflow

export const getWorkflows = async ({ isActive, ...params }: WorkflowParams) => {
  const res = await axios.get<WorkflowsResponse>(w.list, {
    params: { ...toPagedQuery(params), ...(isActive !== undefined ? { isActive } : {}) },
  })
  return res.data
}

export const getWorkflow = async (id: number) => {
  const res = await axios.get<WorkflowDetail>(w.details(id))
  return res.data
}

export const createWorkflow = async (data: WorkflowRequest) => {
  const res = await axios.post<WorkflowDetail>(w.create, data)
  return res.data
}

export const updateWorkflow = async ({ id, data }: { id: number; data: WorkflowRequest }) => {
  const res = await axios.put<WorkflowDetail>(w.update(id), data)
  return res.data
}

export const deleteWorkflow = async (id: number) => {
  await axios.delete(w.delete(id))
}

export const cloneWorkflow = async ({ id, name }: { id: number; name?: string }) => {
  const res = await axios.post<WorkflowDetail>(w.clone(id), null, { params: name ? { name } : {} })
  return res.data
}

export const saveWorkflowLayout = async ({ id, layoutJson }: { id: number; layoutJson: string | null }) => {
  await axios.put(w.layout(id), { layoutJson })
}

export const addWorkflowStatus = async ({ workflowId, data }: { workflowId: number; data: WorkflowStatusRequest }) => {
  const res = await axios.post<WorkflowStatus>(w.addStatus(workflowId), data)
  return res.data
}

export const updateWorkflowStatus = async ({ id, data }: { id: number; data: WorkflowStatusRequest }) => {
  const res = await axios.put<WorkflowStatus>(w.status(id), data)
  return res.data
}

export const deleteWorkflowStatus = async (id: number) => {
  await axios.delete(w.status(id))
}

export const addWorkflowTransition = async ({
  workflowId,
  data,
}: {
  workflowId: number
  data: WorkflowTransitionRequest
}) => {
  const res = await axios.post<WorkflowTransition>(w.addTransition(workflowId), data)
  return res.data
}

export const updateWorkflowTransition = async ({ id, data }: { id: number; data: WorkflowTransitionRequest }) => {
  const res = await axios.put<WorkflowTransition>(w.transition(id), data)
  return res.data
}

export const deleteWorkflowTransition = async (id: number) => {
  await axios.delete(w.transition(id))
}

export const getWorkflowActions = async () => {
  const res = await axios.get<WorkflowAction[]>(w.actions)
  return res.data
}

export const createWorkflowAction = async (data: WorkflowActionRequest) => {
  const res = await axios.post<WorkflowAction>(w.actions, data)
  return res.data
}

export const updateWorkflowAction = async ({ id, data }: { id: number; data: WorkflowActionRequest }) => {
  const res = await axios.put<WorkflowAction>(w.action(id), data)
  return res.data
}

export const deleteWorkflowAction = async (id: number) => {
  await axios.delete(w.action(id))
}

// ===========================================
// CUSTOM HOOKS
// ===========================================

export const useWorkflows = (params: WorkflowParams) =>
  useQuery({
    queryKey: ['admin-workflows', params],
    queryFn: () => getWorkflows(params),
    placeholderData: keepPreviousData,
  })

export const useWorkflow = (id: number | null | undefined) =>
  useQuery({
    queryKey: ['admin-workflow', id],
    queryFn: () => getWorkflow(id as number),
    enabled: id != null,
  })

export const useWorkflowActions = () =>
  useQuery({ queryKey: ['admin-workflow-actions'], queryFn: getWorkflowActions })

const useInvalidateWorkflows = () => {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ['admin-workflows'] })
    queryClient.invalidateQueries({ queryKey: ['admin-workflow'] })
  }
}

export const useCreateWorkflow = () => {
  const invalidate = useInvalidateWorkflows()
  return useMutation({
    mutationFn: createWorkflow,
    onSuccess: () => {
      toast.success('Đã tạo quy trình')
      invalidate()
    },
  })
}

export const useUpdateWorkflow = () => {
  const invalidate = useInvalidateWorkflows()
  return useMutation({
    mutationFn: updateWorkflow,
    onSuccess: () => {
      toast.success('Đã cập nhật quy trình')
      invalidate()
    },
  })
}

export const useDeleteWorkflow = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteWorkflow,
    onSuccess: (_data, id) => {
      toast.success('Đã xoá quy trình')
      queryClient.removeQueries({ queryKey: ['admin-workflow', id] })
      queryClient.invalidateQueries({ queryKey: ['admin-workflows'] })
    },
  })
}

export const useCloneWorkflow = () => {
  const invalidate = useInvalidateWorkflows()
  return useMutation({
    mutationFn: cloneWorkflow,
    onSuccess: (copy) => {
      toast.success(`Đã nhân bản thành "${copy.name}" (chưa kích hoạt)`)
      invalidate()
    },
  })
}

export const useSaveWorkflowLayout = () => {
  const invalidate = useInvalidateWorkflows()
  return useMutation({
    mutationFn: saveWorkflowLayout,
    onSuccess: () => {
      toast.success('Đã lưu sơ đồ quy trình')
      invalidate()
    },
  })
}

export const useAddWorkflowStatus = () => {
  const invalidate = useInvalidateWorkflows()
  return useMutation({
    mutationFn: addWorkflowStatus,
    onSuccess: () => {
      toast.success('Đã thêm trạng thái')
      invalidate()
    },
  })
}

export const useUpdateWorkflowStatus = () => {
  const invalidate = useInvalidateWorkflows()
  return useMutation({
    mutationFn: updateWorkflowStatus,
    onSuccess: () => {
      toast.success('Đã cập nhật trạng thái')
      invalidate()
    },
  })
}

export const useDeleteWorkflowStatus = () => {
  const invalidate = useInvalidateWorkflows()
  return useMutation({
    mutationFn: deleteWorkflowStatus,
    onSuccess: () => {
      toast.success('Đã xoá trạng thái')
      invalidate()
    },
  })
}

export const useAddWorkflowTransition = () => {
  const invalidate = useInvalidateWorkflows()
  return useMutation({
    mutationFn: addWorkflowTransition,
    onSuccess: () => {
      toast.success('Đã thêm bước chuyển')
      invalidate()
    },
  })
}

export const useUpdateWorkflowTransition = () => {
  const invalidate = useInvalidateWorkflows()
  return useMutation({
    mutationFn: updateWorkflowTransition,
    onSuccess: () => {
      toast.success('Đã cập nhật bước chuyển')
      invalidate()
    },
  })
}

export const useDeleteWorkflowTransition = () => {
  const invalidate = useInvalidateWorkflows()
  return useMutation({
    mutationFn: deleteWorkflowTransition,
    onSuccess: () => {
      toast.success('Đã xoá bước chuyển')
      invalidate()
    },
  })
}

const useInvalidateActions = () => {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ['admin-workflow-actions'] })
    // Tên hành động hiển thị trong chi tiết quy trình
    queryClient.invalidateQueries({ queryKey: ['admin-workflow'] })
  }
}

export const useCreateWorkflowAction = () => {
  const invalidate = useInvalidateActions()
  return useMutation({
    mutationFn: createWorkflowAction,
    onSuccess: () => {
      toast.success('Đã thêm hành động')
      invalidate()
    },
  })
}

export const useUpdateWorkflowAction = () => {
  const invalidate = useInvalidateActions()
  return useMutation({
    mutationFn: updateWorkflowAction,
    onSuccess: () => {
      toast.success('Đã cập nhật hành động')
      invalidate()
    },
  })
}

export const useDeleteWorkflowAction = () => {
  const invalidate = useInvalidateActions()
  return useMutation({
    mutationFn: deleteWorkflowAction,
    onSuccess: () => {
      toast.success('Đã xoá hành động')
      invalidate()
    },
  })
}
