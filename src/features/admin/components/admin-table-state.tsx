import { Loader2 } from 'lucide-react'
import { TableCell, TableRow } from '@/components/ui/table'

type AdminTableStateProps = {
  colSpan: number
  isLoading: boolean
  isError: boolean
  isEmpty: boolean
  emptyText?: string
}

// Một hàng thông báo trạng thái: đang tải / lỗi / không có dữ liệu. Trả null khi có dữ liệu.
export function AdminTableState({
  colSpan,
  isLoading,
  isError,
  isEmpty,
  emptyText = 'Không có dữ liệu',
}: AdminTableStateProps) {
  let content: React.ReactNode = null
  if (isLoading) {
    content = (
      <span className='inline-flex items-center gap-2'>
        <Loader2 className='h-4 w-4 animate-spin' /> Đang tải...
      </span>
    )
  } else if (isError) {
    content = <span className='text-destructive'>Không tải được dữ liệu. Vui lòng thử lại.</span>
  } else if (isEmpty) {
    content = emptyText
  }

  if (!content) return null

  return (
    <TableRow>
      <TableCell colSpan={colSpan} className='text-muted-foreground h-24 text-center'>
        {content}
      </TableCell>
    </TableRow>
  )
}
