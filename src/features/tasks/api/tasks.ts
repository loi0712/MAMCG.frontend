import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { apiUrls } from '@/api/config/endpoints'
import { axios } from '@/shared/lib/axios'

// ===========================================
// TYPES (Content: /api/Workflow — WorkflowTaskDtos)
// ===========================================

// Loại đối tượng nguồn của nội dung trong quy trình
export type ReferenceType = 'asset' | 'cg-scene'

export interface MyTask {
  id: number
  title: string
  content: string
  workflowId: number
  workflowName: string
  statusId: number
  statusName: string
  statusColor: string | null
  // Id người dùng (GUID) và/hoặc id nhóm (số), phân tách bởi dấu phẩy
  assignedTo: string | null
  author: string | null
  // Thời điểm được giao bước hiện tại
  assignedAt: string | null
  deadline: string | null
  isOverdue: boolean
  referenceType: ReferenceType | string | null
  referenceId: string | null
  createdAt: string
  modifiedAt: string
}

export interface MyTasksResponse {
  items: MyTask[]
  totalCount: number
}

export interface MyTaskParams {
  statusId?: number
  workflowId?: number
  overdue?: boolean
  search?: string
  pageNumber?: number
  pageSize?: number
}

export interface MyTaskStatusCount {
  statusId: number
  statusName: string
  color: string | null
  displayOrder: number | null
  workflowName: string | null
  count: number
}

export interface MyTaskSummary {
  total: number
  overdue: number
  statuses: MyTaskStatusCount[]
}

export interface WorkflowHistoryEntry {
  id: number
  actorId: string | null
  actorName: string | null
  actionId: number | null
  actionName: string | null
  actionColor: string | null
  fromStatusId: number | null
  fromStatusName: string | null
  fromStatusColor: string | null
  toStatusId: number | null
  toStatusName: string | null
  toStatusColor: string | null
  assignedTo: string | null
  // Tên người / nhóm được giao, nối bằng dấu phẩy
  assignedToNames: string | null
  comment: string | null
  actionTime: string | null
  deadline: string | null
}

export interface WorkflowVersionSummary {
  id: number
  versionNumber: number
  createdAt: string
  hasSnapshot: boolean
}

export interface WorkflowVersionDetail {
  id: number
  versionNumber: number
  createdAt: string
  // JSON snapshot toàn bộ thông tin đối tượng tại thời điểm chuyển bước
  contentSnapshot: string | null
  diff: string | null
}

// Đường dẫn trang chi tiết theo đối tượng nguồn; null nếu chưa có trang:
// nội dung cũ chưa gắn đối tượng, hoặc cảnh CG (reference_id là id cảnh; /assets/cg/details nhận id tài sản).
export const referenceLink = (task: Pick<MyTask, 'referenceType' | 'referenceId'>) => {
  if (!task.referenceId) return null
  if (task.referenceType === 'asset') return { to: '/assets/details/details' as const, search: { id: task.referenceId } }
  return null
}

// ===========================================
// API FUNCTIONS
// ===========================================

export const getMyTasks = async (params: MyTaskParams) => {
  const query = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ''))
  const res = await axios.get<MyTasksResponse>(apiUrls.workflowTask.myTasks, { params: query })
  return { items: res.data.items ?? [], totalCount: res.data.totalCount ?? 0 } satisfies MyTasksResponse
}

export const getMyTaskSummary = async () => {
  const res = await axios.get<MyTaskSummary>(apiUrls.workflowTask.summary)
  return res.data
}

export const getWorkflowItemHistory = async (itemId: number) => {
  const res = await axios.get<WorkflowHistoryEntry[]>(apiUrls.workflowTask.history(itemId))
  return res.data
}

export const getWorkflowItemVersions = async (itemId: number) => {
  const res = await axios.get<WorkflowVersionSummary[]>(apiUrls.workflowTask.versions(itemId))
  return res.data
}

export const getWorkflowItemVersion = async (itemId: number, version: number) => {
  const res = await axios.get<WorkflowVersionDetail>(apiUrls.workflowTask.version(itemId, version))
  return res.data
}

// ===========================================
// CUSTOM HOOKS
// ===========================================

// Mọi query công việc dùng chung tiền tố để realtime "tasks-changed" làm mới một lần
export const MY_TASKS_KEY = ['my-tasks'] as const

export const useMyTasks = (params: MyTaskParams) =>
  useQuery({
    queryKey: [...MY_TASKS_KEY, 'list', params],
    queryFn: () => getMyTasks(params),
    placeholderData: keepPreviousData,
  })

// Menu "Công việc": số việc theo trạng thái (polling khi không có realtime)
export const useMyTaskSummary = (enabled = true) =>
  useQuery({
    queryKey: [...MY_TASKS_KEY, 'summary'],
    queryFn: getMyTaskSummary,
    refetchInterval: 60_000,
    enabled,
  })

export const useWorkflowItemHistory = (itemId: number | undefined, enabled = true) =>
  useQuery({
    queryKey: ['workflow-item', itemId, 'history'],
    queryFn: () => getWorkflowItemHistory(itemId!),
    enabled: enabled && !!itemId,
  })

export const useWorkflowItemVersions = (itemId: number | undefined, enabled = true) =>
  useQuery({
    queryKey: ['workflow-item', itemId, 'versions'],
    queryFn: () => getWorkflowItemVersions(itemId!),
    enabled: enabled && !!itemId,
  })

export const useWorkflowItemVersion = (itemId: number | undefined, version: number | undefined) =>
  useQuery({
    queryKey: ['workflow-item', itemId, 'versions', version],
    queryFn: () => getWorkflowItemVersion(itemId!, version!),
    enabled: !!itemId && !!version,
    staleTime: Infinity, // phiên bản đã lưu không đổi
  })
