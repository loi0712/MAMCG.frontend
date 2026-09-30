import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiUrls } from '@/api/config/endpoints'
import { axios } from '@/shared/lib/axios'
import { downloadFile, fileTimestamp } from './download-file'

// ===========================================
// TYPES (Asset.Application.Assets.Bulk)
// ===========================================

export const BULK_LIMITS = {
    delete: 200,
    download: 200,
    action: 100,
} as const

export interface BulkItemResult {
    id: number
    ok: boolean
    error: string | null
}

export interface BulkResult {
    total: number
    succeeded: number
    failed: number
    items: BulkItemResult[]
}

export interface WorkflowAction {
    id: string
    name: string
    color: string | null
    requireUpload: boolean
}

export interface BulkAvailableActions {
    // Hành động mà mọi tài sản đã chọn đều có
    common: WorkflowAction[]
    items: { id: number; error: string | null; actions: WorkflowAction[] }[]
}

// ===========================================
// API FUNCTIONS
// ===========================================

export const bulkDeleteAssets = async (ids: number[]) => {
    const res = await axios.post<BulkResult>(apiUrls.asset.bulkDelete, { ids })
    return res.data
}

export const getBulkAvailableActions = async (ids: number[]) => {
    const res = await axios.post<BulkAvailableActions>(apiUrls.asset.bulkAvailableActions, { ids })
    return res.data
}

export const bulkAssetAction = async (data: { ids: number[]; actionId: number; comment?: string }) => {
    const res = await axios.post<BulkResult>(apiUrls.asset.bulkAction, data)
    return res.data
}

export const bulkDownloadAssets = (ids: number[]) =>
    downloadFile({ method: 'POST', url: apiUrls.asset.bulkDownload, data: { ids } }, `tai-san_${fileTimestamp()}.zip`)

// ===========================================
// CUSTOM HOOKS
// ===========================================

export const useBulkAvailableActions = (ids: number[], enabled: boolean) =>
    useQuery({
        queryKey: ['asset-bulk-actions', ids],
        queryFn: () => getBulkAvailableActions(ids),
        enabled: enabled && ids.length > 0,
        staleTime: 0,
    })

const useInvalidateAssets = () => {
    const queryClient = useQueryClient()
    return () => {
        queryClient.invalidateQueries({ queryKey: ['assets'] })
        queryClient.invalidateQueries({ queryKey: ['asset-trash'] })
    }
}

/** Thông báo tổng kết thành công/thất bại của thao tác hàng loạt. */
export const toastBulkResult = (result: BulkResult, verb: string) => {
    if (result.failed === 0) toast.success(`Đã ${verb} ${result.succeeded} thiết kế`)
    else if (result.succeeded === 0) toast.error(`Không ${verb} được thiết kế nào (${result.failed} lỗi)`)
    else toast.warning(`Đã ${verb} ${result.succeeded}/${result.total} thiết kế, ${result.failed} lỗi`)
}

export const useBulkDeleteAssets = () => {
    const invalidate = useInvalidateAssets()
    return useMutation({
        mutationFn: bulkDeleteAssets,
        onSuccess: (result) => {
            toastBulkResult(result, 'xoá')
            invalidate()
        },
    })
}

export const useBulkAssetAction = () => {
    const invalidate = useInvalidateAssets()
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: bulkAssetAction,
        onSuccess: (result) => {
            toastBulkResult(result, 'xử lý')
            invalidate()
            queryClient.invalidateQueries({ queryKey: ['asset-detail'] })
        },
    })
}

export const useBulkDownloadAssets = () =>
    useMutation({
        mutationFn: bulkDownloadAssets,
        onSuccess: () => toast.success('Đã tạo file ZIP, trình duyệt đang tải xuống'),
    })
