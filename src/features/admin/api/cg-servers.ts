import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiUrls } from '@/api/config/endpoints'
import type { components } from '@/api/generated/schema'
import { axios } from '@/shared/lib/axios'
import { type PagedParams, toPagedQuery } from './common'

// ===========================================
// TYPES (Playout: /api/CGServer)
// ===========================================

type Schemas = components['schemas']

export type CGServer = Schemas['CGServerAdminDto']
export type CGServerStatus = Schemas['CGServerStatusDto']
export type CGServerCheckResult = Schemas['CGServerCheckResultDto']
export type CGServerRequest = Schemas['SaveCGServerDto']
export type CGChannel = Schemas['CGChannelDto']
export type CGServerMetricPoint = Schemas['CGServerMetricPointDto']

export interface CGServerMetricsParams {
  // Thời điểm ISO không kèm múi giờ (giờ Việt Nam như backend)
  from?: string
  to?: string
  limit?: number
}

export interface CGServersResponse {
  items: CGServer[]
  totalCount: number
}

// Id trạng thái cố định phía backend (CGServerStatusIds)
export const CG_SERVER_STATUS = { online: 1, offline: 2, maintenance: 3 } as const

// Backend giám sát CG server mỗi 60 giây: màn trạng thái tự làm mới mỗi 30 giây
export const CG_SERVER_REFRESH_MS = 30_000

// Trạng thái kênh được tính là đang phát (khớp CGServerMetrics.IsActiveState phía backend)
const ACTIVE_CHANNEL_STATES = ['playing', 'play', 'onair', 'on-air', 'on_air', 'live', 'running']
export const isActiveChannelState = (state?: string | null) =>
  !!state && ACTIVE_CHANNEL_STATES.includes(state.trim().toLowerCase())

// CG app có báo số liệu (lệnh status hoặc heartbeat) hay chưa
export const hasCGMetrics = (server: CGServer) => !!server.metricsUpdatedAt

// Date → ISO giờ địa phương, không kèm múi giờ (backend lưu giờ Việt Nam)
export const toLocalIso = (date: Date) =>
  new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().replace('Z', '')

// ===========================================
// API FUNCTIONS
// ===========================================

export const getCGServers = async (params: PagedParams) => {
  const res = await axios.get<CGServersResponse>(apiUrls.cgServer.list, { params: toPagedQuery(params) })
  return res.data
}

export const getCGServerStatuses = async () => {
  const res = await axios.get<CGServerStatus[]>(apiUrls.cgServer.statuses)
  return res.data
}

export const createCGServer = async (data: CGServerRequest) => {
  const res = await axios.post<CGServer>(apiUrls.cgServer.create, data)
  return res.data
}

export const updateCGServer = async ({ id, data }: { id: number; data: CGServerRequest }) => {
  const res = await axios.put<CGServer>(apiUrls.cgServer.update(id), data)
  return res.data
}

export const deleteCGServer = async (id: number) => {
  await axios.delete(apiUrls.cgServer.delete(id))
}

export const checkCGServer = async (id: number) => {
  const res = await axios.post<CGServerCheckResult>(apiUrls.cgServer.check(id))
  return res.data
}

export const getCGServerMetrics = async (id: number, params: CGServerMetricsParams) => {
  const res = await axios.get<CGServerMetricPoint[]>(apiUrls.cgServer.metrics(id), { params })
  return res.data ?? []
}

// ===========================================
// CUSTOM HOOKS
// ===========================================

export const useCGServers = (params: PagedParams, options?: { refetchInterval?: number }) =>
  useQuery({
    queryKey: ['admin-cg-servers', params],
    queryFn: () => getCGServers(params),
    placeholderData: keepPreviousData,
    refetchInterval: options?.refetchInterval,
  })

// Lịch sử số liệu (tăng dần theo thời gian) trong `rangeMs` gần nhất; mốc from tính lúc gọi API
// để tự làm mới luôn lấy đúng khoảng. Backend trả tối đa `limit` điểm mới nhất (≤ 5000).
export const CG_METRICS_MAX_LIMIT = 5000

export const useCGServerMetrics = (
  id: number | undefined,
  rangeMs: number,
  options?: { limit?: number; refetchInterval?: number }
) =>
  useQuery({
    queryKey: ['admin-cg-servers', 'metrics', id, rangeMs, options?.limit],
    queryFn: () =>
      getCGServerMetrics(id as number, {
        from: toLocalIso(new Date(Date.now() - rangeMs)),
        limit: options?.limit ?? CG_METRICS_MAX_LIMIT,
      }),
    enabled: id != null,
    // Giữ dữ liệu cũ khi đổi khoảng thời gian, nhưng không lẫn sang server khác
    placeholderData: (prev, prevQuery) => (prevQuery?.queryKey[2] === id ? prev : undefined),
    refetchInterval: options?.refetchInterval,
  })

export const useCGServerStatuses = () =>
  useQuery({ queryKey: ['admin-cg-server-statuses'], queryFn: getCGServerStatuses, staleTime: Infinity })

const useInvalidateCGServers = () => {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['admin-cg-servers'] })
}

export const useCreateCGServer = () => {
  const invalidate = useInvalidateCGServers()
  return useMutation({
    mutationFn: createCGServer,
    onSuccess: () => {
      toast.success('Đã thêm CG server')
      invalidate()
    },
  })
}

export const useUpdateCGServer = () => {
  const invalidate = useInvalidateCGServers()
  return useMutation({
    mutationFn: updateCGServer,
    onSuccess: () => {
      toast.success('Đã cập nhật CG server')
      invalidate()
    },
  })
}

export const useDeleteCGServer = () => {
  const invalidate = useInvalidateCGServers()
  return useMutation({
    mutationFn: deleteCGServer,
    onSuccess: () => {
      toast.success('Đã xoá CG server')
      invalidate()
    },
  })
}

// Kiểm tra kết nối TCP tới CG server; backend cập nhật trạng thái Online/Offline
export const useCheckCGServer = () => {
  const invalidate = useInvalidateCGServers()
  return useMutation({
    mutationFn: checkCGServer,
    onSuccess: (result) => {
      const name = result.server?.serverName ?? 'CG server'
      if (result.reachable)
        toast.success(`Kết nối được ${name} (${result.latencyMs ?? result.elapsedMs} ms)`, {
          description: result.metricsAvailable ? 'Đã cập nhật số liệu từ CG app' : 'CG app không trả số liệu (lệnh status)',
        })
      else toast.error(result.message ?? `Không kết nối được ${name}`)
      invalidate()
    },
  })
}
