import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiUrls } from '@/api/config/endpoints'
import { axios } from '@/shared/lib/axios'

// ===========================================
// TYPES (Asset.Application.Assets.Trash)
// ===========================================

export interface TrashAsset {
    id: number
    name: string
    code: string | null
    extension: string | null
    size: number
    thumbnail: string | null
    createdAt: string
    deletedAt: string
    // Mã đã bị tài sản khác dùng → khôi phục sẽ bị từ chối
    codeConflict: boolean
}

export interface TrashResponse {
    assets: TrashAsset[]
    totalCount: number
    // Số ngày giữ trong thùng rác trước khi tự xoá vĩnh viễn (0 = không tự xoá)
    retentionDays: number
}

export interface TrashParams {
    pageNumber: number
    pageSize: number
    searchTerm?: string
}

// ===========================================
// API FUNCTIONS
// ===========================================

export const getTrash = async ({ pageNumber, pageSize, searchTerm }: TrashParams) => {
    const res = await axios.get<TrashResponse>(apiUrls.asset.trash, {
        params: { pageNumber, pageSize, ...(searchTerm ? { searchTerm } : {}) },
    })
    return res.data
}

export const restoreAsset = async (id: number) => {
    await axios.post(apiUrls.asset.restore(id))
}

export const purgeAsset = async (id: number) => {
    await axios.delete(apiUrls.asset.purge(id))
}

// ===========================================
// CUSTOM HOOKS
// ===========================================

export const useTrash = (params: TrashParams, enabled = true) =>
    useQuery({
        queryKey: ['asset-trash', params],
        queryFn: () => getTrash(params),
        placeholderData: keepPreviousData,
        enabled,
    })

const useInvalidateTrash = () => {
    const queryClient = useQueryClient()
    return () => {
        queryClient.invalidateQueries({ queryKey: ['asset-trash'] })
        queryClient.invalidateQueries({ queryKey: ['assets'] })
    }
}

export const useRestoreAsset = () => {
    const invalidate = useInvalidateTrash()
    return useMutation({
        mutationFn: restoreAsset,
        onSuccess: () => {
            toast.success('Đã khôi phục thiết kế')
            invalidate()
        },
    })
}

export const usePurgeAsset = () => {
    const invalidate = useInvalidateTrash()
    return useMutation({
        mutationFn: purgeAsset,
        onSuccess: () => {
            toast.success('Đã xoá vĩnh viễn thiết kế')
            invalidate()
        },
    })
}
