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

export interface CGServersResponse {
  items: CGServer[]
  totalCount: number
}

// Id trạng thái cố định phía backend (CGServerStatusIds)
export const CG_SERVER_STATUS = { online: 1, offline: 2, maintenance: 3 } as const

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

// ===========================================
// CUSTOM HOOKS
// ===========================================

export const useCGServers = (params: PagedParams) =>
  useQuery({
    queryKey: ['admin-cg-servers', params],
    queryFn: () => getCGServers(params),
    placeholderData: keepPreviousData,
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
      if (result.reachable) toast.success(`Kết nối được ${result.server?.serverName ?? "CG server"} (${result.elapsedMs} ms)`)
      else toast.error(result.message ?? `Không kết nối được ${result.server?.serverName ?? "CG server"}`)
      invalidate()
    },
  })
}
