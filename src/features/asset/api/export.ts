import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiUrls } from '@/api/config/endpoints'
import { downloadFile, fileTimestamp } from './download-file'

// ===========================================
// XUẤT CSV DANH SÁCH TÀI SẢN (theo bộ lọc đang xem)
// ===========================================

export interface ExportAssetsParams {
    folderId?: number
    searchTerm?: string
}

export const exportAssetsCsv = ({ folderId = 0, searchTerm }: ExportAssetsParams) =>
    downloadFile(
        { method: 'GET', url: apiUrls.asset.export, params: { folderId, ...(searchTerm ? { searchTerm } : {}) } },
        `danh-sach-thiet-ke_${fileTimestamp()}.csv`
    )

export const useExportAssetsCsv = () =>
    useMutation({
        mutationFn: exportAssetsCsv,
        onSuccess: () => toast.success('Đã xuất file CSV'),
    })
