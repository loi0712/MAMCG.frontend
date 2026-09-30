import { useCallback } from 'react'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiUrls } from '@/api/config/endpoints'
import type { components } from '@/api/generated/schema'
import { axios } from '@/shared/lib/axios'

// ===========================================
// TYPES (/api/Backup)
// ===========================================

type Schemas = components['schemas']

export type BackupConfig = Schemas['BackupConfigDto']
export type BackupDatabase = Schemas['BackupDatabaseDto']
export type BackupStatus = Schemas['BackupStatusDto']
export type BackupHistoryItem = Schemas['BackupHistoryDto']
export type BackupRunResult = Schemas['BackupRunResultDto']
export type BackupRunRequest = Schemas['RunBackupDto']

export type BackupHistoryStatus = 'Running' | 'Success' | 'Failed' | 'Deleted'
export type BackupDay = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

export const BACKUP_DAYS: { value: BackupDay; label: string; full: string }[] = [
  { value: 'mon', label: 'T2', full: 'Thứ Hai' },
  { value: 'tue', label: 'T3', full: 'Thứ Ba' },
  { value: 'wed', label: 'T4', full: 'Thứ Tư' },
  { value: 'thu', label: 'T5', full: 'Thứ Năm' },
  { value: 'fri', label: 'T6', full: 'Thứ Sáu' },
  { value: 'sat', label: 'T7', full: 'Thứ Bảy' },
  { value: 'sun', label: 'CN', full: 'Chủ Nhật' },
]

export interface BackupHistoryParams {
  pageNumber?: number
  pageSize?: number
  status?: BackupHistoryStatus | ''
  batchId?: string
  connectionName?: string
  // Giờ Việt Nam, không kèm múi giờ (yyyy-MM-ddTHH:mm:ss) như backend lưu
  from?: string
  to?: string
}

export interface BackupHistoryPage {
  items: BackupHistoryItem[]
  totalCount: number
}

// Khoảng 3 giây một lần khi đang chạy backup
export const BACKUP_POLL_MS = 3000

// ===========================================
// API FUNCTIONS
// ===========================================

export const getBackupConfig = async () => {
  const res = await axios.get<BackupConfig>(apiUrls.backup.config)
  return res.data
}

export const saveBackupConfig = async (data: BackupConfig) => {
  const res = await axios.put<BackupConfig>(apiUrls.backup.config, data)
  return res.data
}

export const getBackupDatabases = async () => {
  const res = await axios.get<BackupDatabase[]>(apiUrls.backup.databases)
  return res.data
}

export const getBackupStatus = async () => {
  const res = await axios.get<BackupStatus>(apiUrls.backup.status)
  return res.data
}

export const getBackupHistory = async ({ pageNumber = 1, pageSize = 10, ...filters }: BackupHistoryParams) => {
  const params: Record<string, string | number> = { pageNumber, pageSize }
  for (const [key, value] of Object.entries(filters)) if (value) params[key] = value
  const res = await axios.get<Schemas['BackupHistoryDtoPagedResult']>(apiUrls.backup.history, { params })
  return {
    items: res.data.items ?? [],
    totalCount: res.data.totalCount ?? 0,
  } satisfies BackupHistoryPage
}

export const runBackup = async (data: BackupRunRequest) => {
  const res = await axios.post<BackupRunResult>(apiUrls.backup.run, data)
  return res.data
}

export const deleteBackup = async (id: number) => {
  const res = await axios.delete<BackupHistoryItem>(apiUrls.backup.delete(id))
  return res.data
}

// ===========================================
// CUSTOM HOOKS
// ===========================================

const KEYS = {
  config: ['admin-backup-config'],
  databases: ['admin-backup-databases'],
  status: ['admin-backup-status'],
  history: ['admin-backup-history'],
} as const

export const useBackupConfig = () => useQuery({ queryKey: KEYS.config, queryFn: getBackupConfig })

export const useBackupDatabases = () => useQuery({ queryKey: KEYS.databases, queryFn: getBackupDatabases })

// Tự làm mới 3 giây/lần khi đang có lượt backup chạy
export const useBackupStatus = () =>
  useQuery({
    queryKey: KEYS.status,
    queryFn: getBackupStatus,
    refetchInterval: (query) => (query.state.data?.running ? BACKUP_POLL_MS : false),
  })

export const useBackupHistory = (params: BackupHistoryParams, polling = false) =>
  useQuery({
    queryKey: [...KEYS.history, params],
    queryFn: () => getBackupHistory(params),
    placeholderData: keepPreviousData,
    // Poll khi đang chạy backup hoặc trang hiện tại còn bản ghi "Running"
    refetchInterval: (query) =>
      polling || query.state.data?.items.some((r) => r.status === 'Running') ? BACKUP_POLL_MS : false,
  })

export const useInvalidateBackup = () => {
  const queryClient = useQueryClient()
  return useCallback(() => {
    queryClient.invalidateQueries({ queryKey: KEYS.status })
    queryClient.invalidateQueries({ queryKey: KEYS.history })
  }, [queryClient])
}

export const useSaveBackupConfig = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: saveBackupConfig,
    onSuccess: (data) => {
      toast.success('Đã lưu cấu hình backup')
      queryClient.setQueryData(KEYS.config, data)
      queryClient.invalidateQueries({ queryKey: KEYS.databases })
      queryClient.invalidateQueries({ queryKey: KEYS.status })
    },
  })
}

export const useRunBackup = () => {
  const invalidate = useInvalidateBackup()
  return useMutation({
    mutationFn: runBackup,
    onSuccess: (result) => {
      const count = result.databases?.length ?? 0
      toast.success(`Đã bắt đầu backup ${count} CSDL`)
      invalidate()
    },
  })
}

export const useDeleteBackup = () => {
  const invalidate = useInvalidateBackup()
  return useMutation({
    mutationFn: deleteBackup,
    onSuccess: () => {
      toast.success('Đã xoá bản backup')
      invalidate()
    },
  })
}

// ===========================================
// TIỆN ÍCH HIỂN THỊ
// ===========================================

// Thời gian backend trả về theo giờ Việt Nam, không kèm múi giờ: hiển thị nguyên giờ đó
export const formatBackupTime = (value: string | null | undefined) =>
  value ? new Date(value).toLocaleString('vi-VN') : '—'

export const formatDuration = (ms: number | null | undefined) => {
  if (ms == null) return '—'
  if (ms < 1000) return `${ms} ms`
  const seconds = ms / 1000
  if (seconds < 60) return `${seconds.toLocaleString('vi-VN', { maximumFractionDigits: 1 })} giây`
  const minutes = Math.floor(seconds / 60)
  return `${minutes} phút ${Math.round(seconds % 60)} giây`
}
