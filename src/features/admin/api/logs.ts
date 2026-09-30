import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
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

// ----- Nhật ký kiểm toán (thay đổi dữ liệu quản trị) -----

export type AuditAction = 'create' | 'update' | 'delete'

export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  create: 'Tạo mới',
  update: 'Cập nhật',
  delete: 'Xoá',
}

export interface AuditLog {
  id: number
  createdAt: string
  userId?: string | null
  userName?: string | null
  userFullName?: string | null
  ipAddress?: string | null
  action: AuditAction
  module: string
  entityType: string
  entityId?: string | null
  // Tên thuộc tính thay đổi, phân tách dấu phẩy (update / xoá mềm)
  changedFields?: string | null
}

// before/after: chuỗi JSON { thuộc tính: giá trị } đã che trường nhạy cảm; null khi tạo mới / xoá hẳn
export interface AuditLogDetail extends AuditLog {
  before?: string | null
  after?: string | null
}

export interface AuditEntityType {
  entityType: string
  module: string
  count: number
}

export interface AuditLogParams extends LogPageParams, LogRangeParams {
  // Người thao tác: user id hoặc một phần tên đăng nhập / họ tên
  user?: string
  entityType?: string
  entityId?: string
  action?: AuditAction
  // Tìm trong người dùng, IP, loại/id đối tượng, trường thay đổi
  searchTerm?: string
}

// Tên hiển thị loại đối tượng (tên lớp entity phía backend)
export const AUDIT_ENTITY_LABELS: Record<string, string> = {
  User: 'Người dùng',
  ProductGroup: 'Nhóm người dùng',
  UserProductGroup: 'Thành viên nhóm',
  Role: 'Vai trò',
  Permission: 'Quyền',
  AccessControlEntry: 'Phân quyền',
  Department: 'Phòng ban',
  Position: 'Chức vụ',
  Setting: 'Cài đặt',
  LDAPConfiguration: 'Cấu hình LDAP',
  EmailTemplate: 'Mẫu email',
  Database: 'Cơ sở dữ liệu',
  StoragePoint: 'Điểm lưu trữ',
  Server: 'Máy chủ',
  Workflow: 'Quy trình',
  WorkflowStatus: 'Trạng thái quy trình',
  WorkflowStatusTransition: 'Bước chuyển quy trình',
  WorkflowAction: 'Hành động quy trình',
  CGServer: 'CG server',
  CGServerBackup: 'CG server dự phòng',
  Field: 'Trường dữ liệu',
  FieldGroup: 'Nhóm trường',
  FieldGroupField: 'Trường trong nhóm',
  Panel: 'Panel hiển thị',
  PanelField: 'Trường trong panel',
  DataType: 'Kiểu dữ liệu',
  AssetType: 'Loại thiết kế',
  CategoryGroup: 'Nhóm chuyên mục',
  Category: 'Chuyên mục',
}

export const auditEntityLabel = (entityType?: string | null) =>
  entityType ? (AUDIT_ENTITY_LABELS[entityType] ?? entityType) : '—'

// Loại nhật ký — trùng đường dẫn /api/Log/{kind}
export type LogKind = 'activities' | 'system' | 'cg-server' | 'ldap-sync' | 'audit'

export const LOG_KIND_LABELS: Record<LogKind, string> = {
  activities: 'Hoạt động người dùng',
  system: 'Hệ thống',
  'cg-server': 'CG Server',
  'ldap-sync': 'Đồng bộ LDAP',
  audit: 'Kiểm toán',
}

// Bộ lọc xuất CSV: như danh sách của từng loại, không phân trang
export type LogExportParams = Omit<
  ActivityLogParams & SystemLogParams & CGServerLogParams & AuditLogParams,
  'pageNumber' | 'pageSize'
>

export interface LogExportResult {
  fileName: string
  rows: number
  truncated: boolean
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

export const getAuditLogs = async (params: AuditLogParams) => {
  const res = await axios.get<PagedLogResponse<AuditLog>>(apiUrls.log.audit, { params: clean(params) })
  return toPage(res.data)
}

export const getAuditLog = async (id: number) => {
  const res = await axios.get<AuditLogDetail>(apiUrls.log.auditDetails(id))
  return res.data
}

export const getAuditEntityTypes = async () => {
  const res = await axios.get<AuditEntityType[]>(apiUrls.log.auditEntityTypes)
  return res.data
}

// Tên file từ Content-Disposition (ưu tiên filename*=UTF-8'')
const fileNameFrom = (disposition: string | undefined, fallback: string) => {
  const star = disposition?.match(/filename\*=UTF-8''([^;]+)/i)?.[1]
  if (star) return decodeURIComponent(star)
  return disposition?.match(/filename="?([^";]+)"?/i)?.[1] ?? fallback
}

// Xuất CSV phía máy chủ theo bộ lọc (mọi trang, tối đa LogExport:MaxRows dòng mới nhất) rồi tải về
export const exportLogs = async ({ kind, params }: { kind: LogKind; params: LogExportParams }): Promise<LogExportResult> => {
  try {
    const res = await axios.get<Blob>(apiUrls.log.export(kind), { params: clean(params), responseType: 'blob' })
    const fileName = fileNameFrom(res.headers['content-disposition'], `nhat-ky-${kind}.csv`)
    const url = URL.createObjectURL(res.data)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    link.click()
    URL.revokeObjectURL(url)
    return {
      fileName,
      rows: Number(res.headers['x-export-rows'] ?? 0),
      truncated: res.headers['x-export-truncated'] === 'true',
    }
  } catch (error) {
    // responseType blob: đọc ProblemDetails để thông báo lỗi đúng nội dung
    if (error instanceof AxiosError && error.response?.data instanceof Blob) {
      try {
        error.response.data = JSON.parse(await error.response.data.text())
      } catch {
        // Không phải JSON: giữ nguyên
      }
    }
    throw error
  }
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

export const useAuditLogs = (params: AuditLogParams, enabled = true) =>
  useQuery({
    queryKey: ['admin-logs', 'audit', params],
    queryFn: () => getAuditLogs(params),
    placeholderData: keepPreviousData,
    enabled,
  })

export const useAuditLog = (id: number | null) =>
  useQuery({
    queryKey: ['admin-logs', 'audit-detail', id],
    queryFn: () => getAuditLog(id!),
    enabled: id != null,
  })

export const useAuditEntityTypes = (enabled = true) =>
  useQuery({ queryKey: ['admin-logs', 'audit-entity-types'], queryFn: getAuditEntityTypes, enabled })

export const useExportLogs = () =>
  useMutation({
    mutationFn: exportLogs,
    onSuccess: ({ rows, truncated }) => {
      if (truncated)
        toast.warning('Đã xuất file nhật ký (bị giới hạn)', {
          description: `${rows.toLocaleString('vi-VN')} dòng mới nhất; thu hẹp khoảng thời gian để xuất phần còn lại`,
        })
      else toast.success('Đã xuất file nhật ký', { description: `${rows.toLocaleString('vi-VN')} dòng theo bộ lọc hiện tại` })
    },
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
