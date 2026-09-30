import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiUrls } from '@/api/config/endpoints'
import type { components } from '@/api/generated/schema'
import { axios } from '@/shared/lib/axios'

// ===========================================
// TYPES (Tracking: /api/Log — chỉ quản trị viên)
// ===========================================

type Schemas = components['schemas']

export type ActivityLog = Schemas['ActivityLogDto']
export type ActionType = Schemas['ActionTypeDto']
export type SystemLog = Schemas['SystemLogDto']
export type CGServerLog = Schemas['CGServerLogDto']
export type LdapSyncLog = Schemas['LdapSyncLogDto']

export interface PagedLogResponse<T> {
  items: T[]
  totalCount: number
}

interface LogPageParams {
  pageNumber?: number
  pageSize?: number
}

// Khoảng thời gian (ISO) — backend so sánh CreatedAt >= from, <= to
interface LogRangeParams {
  from?: string
  to?: string
}

export interface ActivityLogParams extends LogPageParams, LogRangeParams {
  // Tìm trong tên người dùng, chi tiết thao tác, IP
  searchTerm?: string
  actionTypeId?: number
  outcome?: 'success' | 'failed'
}

export interface SystemLogParams extends LogPageParams, LogRangeParams {
  searchTerm?: string
  // Giá trị LogLevel của .NET: Warning | Error | Critical
  logLevel?: string
}

export interface CGServerLogParams extends LogPageParams, LogRangeParams {
  serverId?: number
}

export type LdapSyncLogParams = LogPageParams

// Loại nhật ký — trùng đường dẫn /api/Log/{kind}
export type LogKind = 'activities' | 'system' | 'cg-server' | 'ldap-sync'

export const LOG_KIND_LABELS: Record<LogKind, string> = {
  activities: 'Hoạt động người dùng',
  system: 'Hệ thống',
  'cg-server': 'CG Server',
  'ldap-sync': 'Đồng bộ LDAP',
}

export type LogPurgeResult = Schemas['LogPurgeResultDto']

// Mức log mà backend ghi (DatabaseLoggerProvider: Warning trở lên)
export const SYSTEM_LOG_LEVELS = ['Warning', 'Error', 'Critical'] as const

// Bỏ tham số rỗng để query gọn như các API khác
const clean = <T extends object>(params: T) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''))

const toPage = <T>(data: { items?: T[] | null; totalCount?: number }): PagedLogResponse<T> => ({
  items: data.items ?? [],
  totalCount: data.totalCount ?? 0,
})

// ===========================================
// API FUNCTIONS
// ===========================================

export const getActivityLogs = async (params: ActivityLogParams) => {
  const res = await axios.get<Schemas['ActivityLogDtoPagedLogResult']>(apiUrls.log.activities, { params: clean(params) })
  return toPage(res.data)
}

export const getActionTypes = async () => {
  const res = await axios.get<ActionType[]>(apiUrls.log.actionTypes)
  return res.data
}

export const getSystemLogs = async (params: SystemLogParams) => {
  const res = await axios.get<Schemas['SystemLogDtoPagedLogResult']>(apiUrls.log.system, { params: clean(params) })
  return toPage(res.data)
}

export const getCGServerLogs = async (params: CGServerLogParams) => {
  const res = await axios.get<Schemas['CGServerLogDtoPagedLogResult']>(apiUrls.log.cgServer, { params: clean(params) })
  return toPage(res.data)
}

export const getLdapSyncLogs = async (params: LdapSyncLogParams) => {
  const res = await axios.get<Schemas['LdapSyncLogDtoPagedLogResult']>(apiUrls.log.ldapSync, { params: clean(params) })
  return toPage(res.data)
}

// Xoá nhật ký có thời điểm tạo trước `before` (ISO không kèm múi giờ; không được ở tương lai)
export const purgeLogs = async ({ kind, before }: { kind: LogKind; before: string }) => {
  const res = await axios.delete<LogPurgeResult>(apiUrls.log.purge(kind), { params: { before } })
  return res.data
}

export const deleteLog = async ({ kind, id }: { kind: LogKind; id: number }) => {
  await axios.delete(apiUrls.log.deleteOne(kind, id))
}

// ===========================================
// CUSTOM HOOKS
// ===========================================

export const useActivityLogs = (params: ActivityLogParams, enabled = true) =>
  useQuery({
    queryKey: ['admin-logs', 'activities', params],
    queryFn: () => getActivityLogs(params),
    placeholderData: keepPreviousData,
    enabled,
  })

export const useActionTypes = () =>
  useQuery({ queryKey: ['admin-logs', 'action-types'], queryFn: getActionTypes, staleTime: Infinity })

export const useSystemLogs = (params: SystemLogParams, enabled = true) =>
  useQuery({
    queryKey: ['admin-logs', 'system', params],
    queryFn: () => getSystemLogs(params),
    placeholderData: keepPreviousData,
    enabled,
  })

export const useCGServerLogs = (params: CGServerLogParams, enabled = true) =>
  useQuery({
    queryKey: ['admin-logs', 'cg-server', params],
    queryFn: () => getCGServerLogs(params),
    placeholderData: keepPreviousData,
    enabled,
  })

export const useLdapSyncLogs = (params: LdapSyncLogParams, enabled = true) =>
  useQuery({
    queryKey: ['admin-logs', 'ldap-sync', params],
    queryFn: () => getLdapSyncLogs(params),
    placeholderData: keepPreviousData,
    enabled,
  })

const useInvalidateLogs = () => {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['admin-logs'] })
}

export const usePurgeLogs = () => {
  const invalidate = useInvalidateLogs()
  return useMutation({
    mutationFn: purgeLogs,
    onSuccess: (result, { kind }) => {
      const deleted = result?.deleted ?? 0
      if (deleted > 0) toast.success(`Đã xoá ${deleted.toLocaleString('vi-VN')} dòng nhật ký ${LOG_KIND_LABELS[kind]}`)
      else toast.info(`Không có nhật ký ${LOG_KIND_LABELS[kind]} nào trước thời điểm đã chọn`)
      invalidate()
    },
  })
}

export const useDeleteLog = () => {
  const invalidate = useInvalidateLogs()
  return useMutation({
    mutationFn: deleteLog,
    onSuccess: () => {
      toast.success('Đã xoá dòng nhật ký')
      invalidate()
    },
  })
}
