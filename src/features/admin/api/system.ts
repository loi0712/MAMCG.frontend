import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { apiUrls } from '@/api/config/endpoints'
import type { components } from '@/api/generated/schema'
import { axios } from '@/shared/lib/axios'

// ===========================================
// TYPES (Host: /api/SystemStatus — chỉ admin)
// ===========================================

type Schemas = components['schemas']

export type SystemDashboard = Schemas['DashboardDto']
export type ServerInfo = Schemas['ServerInfoDto']
export type ServiceHealth = Schemas['ServiceHealthDto']
export type StorageStat = Schemas['StorageStatDto']
export type RecentActivity = Schemas['RecentActivityDto']
export type UserStats = Schemas['UserStatsDto']
export type MediaStats = Schemas['MediaStatsDto']
export type CGServerStats = Schemas['CGServerStatsDto']

// Trạng thái dịch vụ backend trả về (ServiceHealthDto.status)
export type ServiceStatus = 'running' | 'degraded' | 'down' | 'not_configured'

// Chu kỳ tự làm mới số liệu hệ thống
export const SYSTEM_REFRESH_INTERVAL = 30_000

// ===========================================
// API FUNCTIONS
// ===========================================

export const getSystemDashboard = async () => {
  const res = await axios.get<SystemDashboard>(apiUrls.systemStatus.dashboard)
  return res.data
}

export const getServerInfo = async () => {
  const res = await axios.get<ServerInfo>(apiUrls.systemStatus.server)
  return res.data
}

export const getServiceHealth = async () => {
  const res = await axios.get<ServiceHealth[]>(apiUrls.systemStatus.services)
  return res.data
}

// ===========================================
// CUSTOM HOOKS
// ===========================================

export const useSystemDashboard = () =>
  useQuery({
    queryKey: ['admin-system-dashboard'],
    queryFn: getSystemDashboard,
    refetchInterval: SYSTEM_REFRESH_INTERVAL,
    placeholderData: keepPreviousData,
  })

export const useServerInfo = () =>
  useQuery({
    queryKey: ['admin-system-server'],
    queryFn: getServerInfo,
    refetchInterval: SYSTEM_REFRESH_INTERVAL,
    placeholderData: keepPreviousData,
  })

export const useServiceHealth = () =>
  useQuery({
    queryKey: ['admin-system-services'],
    queryFn: getServiceHealth,
    refetchInterval: SYSTEM_REFRESH_INTERVAL,
    placeholderData: keepPreviousData,
  })

// ===========================================
// FORMATTERS
// ===========================================

const BYTE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']

export const formatBytes = (bytes: number | null | undefined, digits = 1) => {
  if (bytes == null || !Number.isFinite(bytes)) return '—'
  if (bytes < 1024) return `${bytes} B`
  let value = bytes
  let unit = 0
  while (value >= 1024 && unit < BYTE_UNITS.length - 1) {
    value /= 1024
    unit++
  }
  return `${value.toLocaleString('vi-VN', { maximumFractionDigits: digits })} ${BYTE_UNITS[unit]}`
}

export const formatUptime = (seconds: number | null | undefined) => {
  if (seconds == null || !Number.isFinite(seconds) || seconds < 0) return '—'
  const d = Math.floor(seconds / 86_400)
  const h = Math.floor((seconds % 86_400) / 3_600)
  const m = Math.floor((seconds % 3_600) / 60)
  return d > 0 ? `${d}d ${h}h ${m}m` : `${h}h ${m}m`
}

export const formatDateTime = (value: string | null | undefined) => {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('vi-VN')
}

export const formatNumber = (value: number | null | undefined) => (value == null ? '—' : value.toLocaleString('vi-VN'))

// Phần trăm (0–100) an toàn cho Progress
export const percent = (part: number | null | undefined, total: number | null | undefined) =>
  part != null && total ? Math.min(100, Math.max(0, (part / total) * 100)) : 0

// ===========================================
// TRẠNG THÁI DỊCH VỤ
// ===========================================

export const SERVICE_STATUS: Record<ServiceStatus, { label: string; className: string; dot: string }> = {
  running: { label: 'Đang chạy', className: 'border-green-500 text-green-400', dot: 'bg-green-400' },
  degraded: { label: 'Suy giảm', className: 'border-yellow-500 text-yellow-400', dot: 'bg-yellow-400' },
  down: { label: 'Lỗi', className: 'border-red-500 text-red-400', dot: 'bg-red-400' },
  not_configured: { label: 'Chưa cấu hình', className: 'border-border text-muted-foreground', dot: 'bg-muted-foreground' },
}

export const isServiceStatus = (value: string | null | undefined): value is ServiceStatus =>
  value != null && Object.prototype.hasOwnProperty.call(SERVICE_STATUS, value)

// Tổng thể: có dịch vụ down → sự cố; có degraded → suy giảm
export const overallStatus = (statuses: Array<string | null | undefined>) => {
  if (statuses.length === 0) return { label: 'Không rõ', className: 'text-muted-foreground' }
  if (statuses.includes('down')) return { label: 'Có sự cố', className: 'text-red-400' }
  if (statuses.includes('degraded')) return { label: 'Suy giảm', className: 'text-yellow-400' }
  return { label: 'Hoạt động', className: 'text-green-400' }
}
