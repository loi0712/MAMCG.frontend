import { keepPreviousData, useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiUrls } from '@/api/config/endpoints'
import type { components } from '@/api/generated/schema'
import { axios } from '@/shared/lib/axios'
import { type PagedParams, toPagedQuery } from './common'

// ===========================================
// TYPES (Configuration: /api/Database, /api/StoragePoint, /api/Server)
// ===========================================

type Schemas = components['schemas']

export type DatabaseConnection = Schemas['DatabaseDto']
export type DatabaseRequest = Schemas['SaveDatabaseDto']
export type StoragePoint = Schemas['StoragePointDto']
export type StoragePointRequest = Schemas['SaveStoragePointDto']
export type StorageUsage = Schemas['StorageUsageDto']
export type ConfigServer = Schemas['ServerDto']
export type ConfigServerRequest = Schemas['SaveServerDto']
export type ConnectionTestResult = Schemas['ConnectionTestResult']

export interface PagedResponse<T> {
  items: T[]
  totalCount: number
}

// Backend che mật khẩu/secret bằng chuỗi này; gửi lại đúng chuỗi = giữ nguyên giá trị đang lưu
export const SECRET_MASK = '********'

// Định dạng dung lượng: 1536 -> "1,5 KB"
export const formatBytes = (bytes: number | null | undefined) => {
  if (bytes == null || !Number.isFinite(bytes)) return '—'
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
  let value = bytes
  let unit = 0
  while (Math.abs(value) >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit++
  }
  return `${value.toLocaleString('vi-VN', { maximumFractionDigits: unit === 0 ? 0 : 1 })} ${units[unit]}`
}

// ===========================================
// API FUNCTIONS: DATABASE
// ===========================================

export const getDatabases = async (params: PagedParams) => {
  const res = await axios.get<PagedResponse<DatabaseConnection>>(apiUrls.database.list, {
    params: toPagedQuery(params),
  })
  return res.data
}

export const getDatabase = async (id: number) => {
  const res = await axios.get<DatabaseConnection>(apiUrls.database.details(id))
  return res.data
}

export const createDatabase = async (data: DatabaseRequest) => {
  const res = await axios.post<DatabaseConnection>(apiUrls.database.create, data)
  return res.data
}

export const updateDatabase = async ({ id, data }: { id: number; data: DatabaseRequest }) => {
  const res = await axios.put<DatabaseConnection>(apiUrls.database.update(id), data)
  return res.data
}

export const deleteDatabase = async (id: number) => {
  await axios.delete(apiUrls.database.delete(id))
}

export const testDatabase = async (id: number) => {
  const res = await axios.post<ConnectionTestResult>(apiUrls.database.test(id))
  return res.data
}

// ===========================================
// API FUNCTIONS: STORAGE POINT
// ===========================================

export const getStoragePoints = async (params: PagedParams) => {
  const res = await axios.get<PagedResponse<StoragePoint>>(apiUrls.storagePoint.list, {
    params: toPagedQuery(params),
  })
  return res.data
}

export const getStoragePoint = async (id: number) => {
  const res = await axios.get<StoragePoint>(apiUrls.storagePoint.details(id))
  return res.data
}

export const createStoragePoint = async (data: StoragePointRequest) => {
  const res = await axios.post<StoragePoint>(apiUrls.storagePoint.create, data)
  return res.data
}

export const updateStoragePoint = async ({ id, data }: { id: number; data: StoragePointRequest }) => {
  const res = await axios.put<StoragePoint>(apiUrls.storagePoint.update(id), data)
  return res.data
}

export const deleteStoragePoint = async (id: number) => {
  await axios.delete(apiUrls.storagePoint.delete(id))
}

export const getStorageUsage = async (id: number) => {
  const res = await axios.get<StorageUsage>(apiUrls.storagePoint.usage(id))
  return res.data
}

// ===========================================
// API FUNCTIONS: SERVER (máy chủ dịch vụ: transcoder, ...)
// ===========================================

export const getConfigServers = async (params: PagedParams) => {
  const res = await axios.get<PagedResponse<ConfigServer>>(apiUrls.server.list, { params: toPagedQuery(params) })
  return res.data
}

export const getConfigServer = async (id: number) => {
  const res = await axios.get<ConfigServer>(apiUrls.server.details(id))
  return res.data
}

export const createConfigServer = async (data: ConfigServerRequest) => {
  const res = await axios.post<ConfigServer>(apiUrls.server.create, data)
  return res.data
}

export const updateConfigServer = async ({ id, data }: { id: number; data: ConfigServerRequest }) => {
  const res = await axios.put<ConfigServer>(apiUrls.server.update(id), data)
  return res.data
}

export const deleteConfigServer = async (id: number) => {
  await axios.delete(apiUrls.server.delete(id))
}

// ===========================================
// CUSTOM HOOKS: DATABASE
// ===========================================

export const useDatabases = (params: PagedParams) =>
  useQuery({
    queryKey: ['admin-databases', params],
    queryFn: () => getDatabases(params),
    placeholderData: keepPreviousData,
  })

const useInvalidateDatabases = () => {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['admin-databases'] })
}

export const useCreateDatabase = () => {
  const invalidate = useInvalidateDatabases()
  return useMutation({
    mutationFn: createDatabase,
    onSuccess: () => {
      toast.success('Đã thêm kết nối database')
      invalidate()
    },
  })
}

export const useUpdateDatabase = () => {
  const invalidate = useInvalidateDatabases()
  return useMutation({
    mutationFn: updateDatabase,
    onSuccess: () => {
      toast.success('Đã cập nhật kết nối database')
      invalidate()
    },
  })
}

export const useDeleteDatabase = () => {
  const invalidate = useInvalidateDatabases()
  return useMutation({
    mutationFn: deleteDatabase,
    onSuccess: () => {
      toast.success('Đã xoá kết nối database')
      invalidate()
    },
  })
}

// Kiểm tra kết nối bằng cấu hình đang lưu (backend hiện chỉ hỗ trợ SQL Server)
export const useTestDatabase = () =>
  useMutation({
    mutationFn: testDatabase,
    onSuccess: (result) => {
      if (result.success) toast.success(`${result.message ?? 'Kết nối thành công'} (${result.elapsedMs ?? 0} ms)`)
      else toast.error(result.message ?? 'Kết nối thất bại')
    },
  })

// ===========================================
// CUSTOM HOOKS: STORAGE POINT
// ===========================================

export const useStoragePoints = (params: PagedParams) =>
  useQuery({
    queryKey: ['admin-storage-points', params],
    queryFn: () => getStoragePoints(params),
    placeholderData: keepPreviousData,
  })

// Dung lượng từng điểm lưu trữ (đọc từ máy chủ API) – mỗi điểm một request
export const useStorageUsages = (ids: number[]) =>
  useQueries({
    queries: ids.map((id) => ({
      queryKey: ['admin-storage-usage', id],
      queryFn: () => getStorageUsage(id),
      staleTime: 60_000,
    })),
  })

const useInvalidateStoragePoints = () => {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ['admin-storage-points'] })
    queryClient.invalidateQueries({ queryKey: ['admin-storage-usage'] })
  }
}

export const useCreateStoragePoint = () => {
  const invalidate = useInvalidateStoragePoints()
  return useMutation({
    mutationFn: createStoragePoint,
    onSuccess: () => {
      toast.success('Đã thêm hệ thống lưu trữ')
      invalidate()
    },
  })
}

export const useUpdateStoragePoint = () => {
  const invalidate = useInvalidateStoragePoints()
  return useMutation({
    mutationFn: updateStoragePoint,
    onSuccess: () => {
      toast.success('Đã cập nhật hệ thống lưu trữ')
      invalidate()
    },
  })
}

export const useDeleteStoragePoint = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteStoragePoint,
    onSuccess: (_data, id) => {
      toast.success('Đã xoá hệ thống lưu trữ')
      queryClient.removeQueries({ queryKey: ['admin-storage-usage', id] })
      queryClient.invalidateQueries({ queryKey: ['admin-storage-points'] })
    },
  })
}

// ===========================================
// CUSTOM HOOKS: SERVER
// ===========================================

export const useConfigServers = (params: PagedParams) =>
  useQuery({
    queryKey: ['admin-config-servers', params],
    queryFn: () => getConfigServers(params),
    placeholderData: keepPreviousData,
  })

const useInvalidateConfigServers = () => {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['admin-config-servers'] })
}

export const useCreateConfigServer = () => {
  const invalidate = useInvalidateConfigServers()
  return useMutation({
    mutationFn: createConfigServer,
    onSuccess: () => {
      toast.success('Đã thêm máy chủ')
      invalidate()
    },
  })
}

export const useUpdateConfigServer = () => {
  const invalidate = useInvalidateConfigServers()
  return useMutation({
    mutationFn: updateConfigServer,
    onSuccess: () => {
      toast.success('Đã cập nhật máy chủ')
      invalidate()
    },
  })
}

export const useDeleteConfigServer = () => {
  const invalidate = useInvalidateConfigServers()
  return useMutation({
    mutationFn: deleteConfigServer,
    onSuccess: () => {
      toast.success('Đã xoá máy chủ')
      invalidate()
    },
  })
}
