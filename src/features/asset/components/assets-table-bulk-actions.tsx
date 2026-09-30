// components/assets/asset-table-bulk-actions.tsx
import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { Download, Loader2, Trash2, Workflow } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table'
import { type ParsedAsset } from '../api/get-assets'
import { BULK_LIMITS, useBulkDownloadAssets } from '../api/bulk'
import { AssetMultiDeleteDialog } from './assets-multi-delete-dialog'
import { AssetBulkActionDialog } from './asset-bulk-action-dialog'

type AssetTableBulkActionsProps<TData> = {
    table: Table<TData>
}

export function AssetTableBulkActions<TData>({ table }: AssetTableBulkActionsProps<TData>) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [showActionDialog, setShowActionDialog] = useState(false)
    const bulkDownload = useBulkDownloadAssets()
    const selectedRows = table.getFilteredSelectedRowModel().rows

    // Tải file gốc của các thiết kế đã chọn thành 1 file ZIP
    const handleBulkDownload = () => {
        const ids = selectedRows.map((row) => (row.original as ParsedAsset).id)
        if (ids.length > BULK_LIMITS.download) {
            toast.error(`Chỉ được tải tối đa ${BULK_LIMITS.download} thiết kế mỗi lần`)
            return
        }
        toast.info('Đang đóng gói file, vui lòng chờ...', { id: 'bulk-download' })
        bulkDownload.mutate(ids, { onSettled: () => toast.dismiss('bulk-download') })
    }

    return (
        <>
            <BulkActionsToolbar table={table} entityName='thiết kế'>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant='outline'
                            size='icon'
                            onClick={handleBulkDownload}
                            disabled={bulkDownload.isPending}
                            className='size-8'
                            aria-label='Tải xuống các thiết kế đã chọn'
                        >
                            {bulkDownload.isPending ? <Loader2 className='animate-spin' /> : <Download />}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Tải xuống (ZIP)</p>
                    </TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant='outline'
                            size='icon'
                            onClick={() => setShowActionDialog(true)}
                            className='size-8'
                            aria-label='Xử lý quy trình cho các thiết kế đã chọn'
                        >
                            <Workflow />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Xử lý quy trình (duyệt, trả lại...)</p>
                    </TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant='destructive'
                            size='icon'
                            onClick={() => setShowDeleteConfirm(true)}
                            className='size-8'
                            aria-label='Xoá các thiết kế đã chọn'
                        >
                            <Trash2 />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Xoá (chuyển vào thùng rác)</p>
                    </TooltipContent>
                </Tooltip>
            </BulkActionsToolbar>

            <AssetBulkActionDialog table={table} open={showActionDialog} onOpenChange={setShowActionDialog} />
            <AssetMultiDeleteDialog table={table} open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm} />
        </>
    )
}
