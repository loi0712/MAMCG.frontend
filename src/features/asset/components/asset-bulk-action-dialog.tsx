import { useMemo, useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { AlertCircle, Loader2, Workflow } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { getServerErrorMessage } from '@/utils/handle-server-error'
import { type ParsedAsset } from '../api/get-assets'
import { BULK_LIMITS, type BulkResult, useBulkAssetAction, useBulkAvailableActions } from '../api/bulk'
import { AssetsBulkResult, buildAssetLabels } from './assets-bulk-result'

type AssetBulkActionDialogProps<TData> = {
    open: boolean
    onOpenChange: (open: boolean) => void
    table: Table<TData>
}

/**
 * Thực hiện 1 hành động quy trình (duyệt, trả lại...) cho nhiều thiết kế.
 * Chỉ cho chọn hành động mà TẤT CẢ thiết kế đang chọn đều có; kết quả hiển thị theo từng thiết kế.
 */
export function AssetBulkActionDialog<TData>({ open, onOpenChange, table }: AssetBulkActionDialogProps<TData>) {
    const selectedRows = table.getFilteredSelectedRowModel().rows
    const assets = useMemo(() => selectedRows.map((row) => row.original as ParsedAsset), [selectedRows])
    const ids = useMemo(() => assets.map((a) => a.id), [assets])
    const overLimit = ids.length > BULK_LIMITS.action

    const [actionId, setActionId] = useState<string | null>(null)
    const [comment, setComment] = useState('')
    const [result, setResult] = useState<BulkResult | null>(null)
    const [labels, setLabels] = useState(new Map<number, string>())

    const available = useBulkAvailableActions(ids, open && !overLimit && !result)
    const bulkAction = useBulkAssetAction()
    const common = available.data?.common ?? []
    const itemErrors = (available.data?.items ?? []).filter((i) => i.error)
    const selected = common.find((a) => a.id === actionId) ?? null

    const handleOpenChange = (next: boolean) => {
        onOpenChange(next)
        if (!next) {
            setTimeout(() => {
                setResult(null)
                setActionId(null)
                setComment('')
            }, 300)
        }
    }

    const handleSubmit = async () => {
        if (!selected) return
        setLabels(buildAssetLabels(assets))
        try {
            const res = await bulkAction.mutateAsync({ ids, actionId: Number(selected.id), comment: comment.trim() || undefined })
            setResult(res)
            table.resetRowSelection()
        } catch {
            // Lỗi đã được thông báo chung
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className='sm:max-w-lg'>
                <DialogHeader>
                    <DialogTitle className='flex items-center gap-2'>
                        <Workflow className='h-5 w-5' />
                        {result ? 'Kết quả xử lý quy trình' : `Xử lý quy trình cho ${ids.length} thiết kế`}
                    </DialogTitle>
                    {!result && (
                        <DialogDescription>
                            Hành động được thực hiện lần lượt cho từng thiết kế. Thiết kế bạn không được giao xử lý sẽ bị bỏ qua và
                            báo lỗi riêng.
                        </DialogDescription>
                    )}
                </DialogHeader>

                {result ? (
                    <AssetsBulkResult result={result} labels={labels} />
                ) : overLimit ? (
                    <Alert variant='destructive'>
                        <AlertCircle className='h-4 w-4' />
                        <AlertDescription>
                            Chỉ được xử lý tối đa {BULK_LIMITS.action} thiết kế mỗi lần. Hãy bỏ chọn bớt.
                        </AlertDescription>
                    </Alert>
                ) : available.isLoading ? (
                    <div className='text-muted-foreground flex h-24 items-center justify-center gap-2 text-sm'>
                        <Loader2 className='h-4 w-4 animate-spin' /> Đang tải các hành động khả dụng...
                    </div>
                ) : available.isError ? (
                    <Alert variant='destructive'>
                        <AlertCircle className='h-4 w-4' />
                        <AlertDescription>{getServerErrorMessage(available.error, 'Không tải được hành động quy trình')}</AlertDescription>
                    </Alert>
                ) : (
                    <div className='space-y-4'>
                        {common.length === 0 ? (
                            <Alert>
                                <AlertCircle className='h-4 w-4' />
                                <AlertDescription>
                                    Các thiết kế đã chọn không có hành động quy trình chung. Hãy chọn các thiết kế đang ở cùng trạng thái.
                                </AlertDescription>
                            </Alert>
                        ) : (
                            <div className='space-y-2'>
                                <Label>Hành động</Label>
                                <div className='flex flex-wrap gap-2' role='radiogroup' aria-label='Hành động quy trình'>
                                    {common.map((action) => (
                                        <Button
                                            key={action.id}
                                            type='button'
                                            role='radio'
                                            aria-checked={actionId === action.id}
                                            variant={actionId === action.id ? 'default' : 'outline'}
                                            size='sm'
                                            onClick={() => setActionId(action.id)}
                                            className={cn(action.requireUpload && 'opacity-60')}
                                            title={action.requireUpload ? 'Hành động yêu cầu tải lên file, chỉ thực hiện được trong trang chi tiết' : undefined}
                                            disabled={action.requireUpload}
                                        >
                                            {action.color && (
                                                <span className='h-2.5 w-2.5 rounded-full' style={{ backgroundColor: action.color }} />
                                            )}
                                            {action.name}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {itemErrors.length > 0 && (
                            <div className='text-muted-foreground space-y-1 text-xs'>
                                <div>
                                    <Badge variant='outline' className='mr-1'>{itemErrors.length}</Badge>
                                    thiết kế không có hành động nào:
                                </div>
                                <ul className='list-inside list-disc'>
                                    {itemErrors.slice(0, 5).map((i) => (
                                        <li key={i.id}>
                                            {buildAssetLabels(assets).get(i.id) ?? `#${i.id}`}: {i.error}
                                        </li>
                                    ))}
                                    {itemErrors.length > 5 && <li>… và {itemErrors.length - 5} thiết kế khác</li>}
                                </ul>
                            </div>
                        )}

                        <div className='space-y-2'>
                            <Label htmlFor='bulk-action-comment'>Ghi chú</Label>
                            <Textarea
                                id='bulk-action-comment'
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder='Ghi chú cho lịch sử quy trình (không bắt buộc)'
                                className='min-h-16'
                                maxLength={1000}
                            />
                        </div>
                    </div>
                )}

                <DialogFooter>
                    <Button variant='outline' onClick={() => handleOpenChange(false)} disabled={bulkAction.isPending}>
                        {result ? 'Đóng' : 'Huỷ'}
                    </Button>
                    {!result && (
                        <Button onClick={handleSubmit} disabled={!selected || bulkAction.isPending || overLimit}>
                            {bulkAction.isPending && <Loader2 className='h-4 w-4 animate-spin' />}
                            Thực hiện{selected ? `: ${selected.name}` : ''}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
