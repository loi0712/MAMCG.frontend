import { keepPreviousData, useQuery } from '@tanstack/react-query'
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
