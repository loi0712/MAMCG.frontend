import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

type AdminPaginationProps = {
  page: number
  pageSize: number
  totalCount: number
  onPageChange: (page: number) => void
}

export function AdminPagination({ page, pageSize, totalCount, onPageChange }: AdminPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  return (
    <div className='text-muted-foreground flex items-center justify-between text-sm'>
      <span>Tổng: {totalCount}</span>
      <div className='flex items-center gap-2'>
        <Button
          variant='outline'
          size='icon'
          className='h-8 w-8'
          aria-label='Trang trước'
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className='h-4 w-4' />
        </Button>
        <span>
          Trang {page} / {totalPages}
        </span>
        <Button
          variant='outline'
          size='icon'
          className='h-8 w-8'
          aria-label='Trang sau'
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight className='h-4 w-4' />
        </Button>
      </div>
    </div>
  )
}
