// components/assets/asset-multi-delete-dialog.tsx
import { useMemo, useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { type ParsedAsset } from '../api/get-assets'
import { BULK_LIMITS, type BulkResult, useBulkDeleteAssets } from '../api/bulk'
import { AssetsBulkResult, buildAssetLabels } from './assets-bulk-result'

type AssetMultiDeleteDialogProps<TData> = {
    open: boolean
    onOpenChange: (open: boolean) => void
    table: Table<TData>
}

export function AssetMultiDeleteDialog<TData>({ open, onOpenChange, table }: AssetMultiDeleteDialogProps<TData>) {
    const [result, setResult] = useState<BulkResult | null>(null)
    const bulkDelete = useBulkDeleteAssets()

    const selectedRows = table.getFilteredSelectedRowModel().rows
    const assets = useMemo(() => selectedRows.map((row) => row.original as ParsedAsset), [selectedRows])
    // Giữ nhãn theo lúc bấm xoá: sau khi xoá danh sách tải lại, các hàng đã chọn không còn
    const [labels, setLabels] = useState(new Map<number, string>())
    const overLimit = assets.length > BULK_LIMITS.delete

    const handleDelete = async () => {
        setLabels(buildAssetLabels(assets))
        try {
            const res = await bulkDelete.mutateAsync(assets.map((a) => a.id))
            setResult(res)
            if (res.failed === 0) handleOpenChange(false)
            table.resetRowSelection()
        } catch {
            // Lỗi đã được thông báo chung
        }
    }

    const handleOpenChange = (next: boolean) => {
        onOpenChange(next)
        if (!next) setTimeout(() => setResult(null), 300)
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className='sm:max-w-lg'>
                <DialogHeader>
                    <DialogTitle className='text-destructive flex items-center gap-2'>
                        <AlertTriangle className='h-5 w-5' />
                        {result ? 'Kết quả xoá thiết kế' : `Xoá ${assets.length} thiết kế`}
                    </DialogTitle>
                    {!result && (
                        <DialogDescription>
                            Các thiết kế đã chọn sẽ được chuyển vào thùng rác. Quản trị viên có thể khôi phục hoặc xoá vĩnh viễn
                            trong mục Thùng rác.
                        </DialogDescription>
                    )}
                </DialogHeader>

                {result ? (
                    <AssetsBulkResult result={result} labels={labels} />
                ) : overLimit ? (
                    <Alert variant='destructive'>
                        <AlertTitle>Vượt quá giới hạn</AlertTitle>
                        <AlertDescription>
                            Chỉ được xoá tối đa {BULK_LIMITS.delete} thiết kế mỗi lần. Hãy bỏ chọn bớt.
                        </AlertDescription>
                    </Alert>
                ) : (
                    <Alert>
                        <AlertTitle>Lưu ý</AlertTitle>
                        <AlertDescription>
                            Thiết kế trong thùng rác sẽ bị xoá vĩnh viễn (kể cả file gốc) sau thời hạn lưu do quản trị viên cấu hình.
                        </AlertDescription>
                    </Alert>
                )}

                <DialogFooter>
                    <Button variant='outline' onClick={() => handleOpenChange(false)} disabled={bulkDelete.isPending}>
                        {result ? 'Đóng' : 'Huỷ'}
                    </Button>
                    {!result && (
                        <Button variant='destructive' onClick={handleDelete} disabled={bulkDelete.isPending || overLimit || assets.length === 0}>
                            {bulkDelete.isPending && <Loader2 className='h-4 w-4 animate-spin' />}
                            Chuyển vào thùng rác
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
