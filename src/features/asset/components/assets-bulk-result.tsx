import { CheckCircle2, XCircle } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { type BulkResult } from '../api/bulk'

type AssetsBulkResultProps = {
    result: BulkResult
    // Tên hiển thị theo id tài sản (mã + tên)
    labels: Map<number, string>
}

// Tổng kết thao tác hàng loạt + danh sách kết quả từng thiết kế (lỗi hiển thị trước)
export function AssetsBulkResult({ result, labels }: AssetsBulkResultProps) {
    const items = [...result.items].sort((a, b) => Number(a.ok) - Number(b.ok))

    return (
        <div className='space-y-3'>
            <div className='flex flex-wrap gap-4 text-sm'>
                <span>Tổng: <strong>{result.total}</strong></span>
                <span className='text-green-600 dark:text-green-400'>Thành công: <strong>{result.succeeded}</strong></span>
                <span className='text-destructive'>Thất bại: <strong>{result.failed}</strong></span>
            </div>
            <ScrollArea className='max-h-64 rounded-md border'>
                <ul className='divide-y text-sm' data-testid='bulk-result-list'>
                    {items.map((item) => (
                        <li key={item.id} className='flex items-start gap-2 px-3 py-2'>
                            {item.ok ? (
                                <CheckCircle2 className='mt-0.5 h-4 w-4 shrink-0 text-green-600 dark:text-green-400' />
                            ) : (
                                <XCircle className='text-destructive mt-0.5 h-4 w-4 shrink-0' />
                            )}
                            <div className='min-w-0'>
                                <div className='truncate font-medium'>{labels.get(item.id) ?? `#${item.id}`}</div>
                                {!item.ok && item.error && (
                                    <div className='text-muted-foreground text-xs'>{item.error}</div>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            </ScrollArea>
        </div>
    )
}

/** Nhãn "mã – tên" cho các thiết kế đang chọn. */
export const buildAssetLabels = (assets: { id: number; assetId?: string; fileName?: string; name?: string }[]) =>
    new Map(assets.map((a) => [a.id, [a.assetId, a.fileName || a.name].filter(Boolean).join(' – ') || `#${a.id}`]))
