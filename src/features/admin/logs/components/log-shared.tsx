import { useEffect, useState } from 'react'
import { Download, Search, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { LOG_KIND_LABELS, type LogKind, useDeleteLog } from '../../api/logs'

export const LOG_PAGE_SIZE = 20

// Thời gian backend trả về không kèm múi giờ: hiển thị theo giờ vi-VN
export const formatDateTime = (value?: string | null) => (value ? new Date(value).toLocaleString('vi-VN') : '—')

export interface DateRange {
  from: string
  to: string
}

// Ngày (yyyy-mm-dd) → mốc đầu/cuối ngày, không kèm múi giờ như dữ liệu phía backend
export const toRangeParams = ({ from, to }: DateRange) => ({
  from: from ? `${from}T00:00:00` : undefined,
  to: to ? `${to}T23:59:59.999` : undefined,
})

// Ô tìm kiếm trễ 300ms trước khi báo thay đổi
export function LogSearchInput({ placeholder, onSearch }: { placeholder: string; onSearch: (term: string) => void }) {
  const [term, setTerm] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => onSearch(term.trim()), 300)
    return () => clearTimeout(timer)
  }, [term, onSearch])

  return (
    <div className='relative min-w-56 flex-1'>
      <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
      <Input
        placeholder={placeholder}
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        className='bg-muted border-border text-foreground pl-10'
      />
    </div>
  )
}

export function DateRangeFilter({ value, onChange }: { value: DateRange; onChange: (value: DateRange) => void }) {
  return (
    <div className='flex items-center gap-2'>
      <Input
        type='date'
        aria-label='Từ ngày'
        value={value.from}
        max={value.to || undefined}
        onChange={(e) => onChange({ ...value, from: e.target.value })}
        className='bg-muted border-border text-foreground w-40'
      />
      <span className='text-muted-foreground text-sm'>đến</span>
      <Input
        type='date'
        aria-label='Đến ngày'
        value={value.to}
        min={value.from || undefined}
        onChange={(e) => onChange({ ...value, to: e.target.value })}
        className='bg-muted border-border text-foreground w-40'
      />
    </div>
  )
}

export function LogFilterCard({ children }: { children: React.ReactNode }) {
  return (
    <Card className='bg-card border-border p-4'>
      <div className='flex flex-wrap items-center gap-4'>{children}</div>
    </Card>
  )
}

export function LogTableCard({ children }: { children: React.ReactNode }) {
  return (
    <Card className='bg-card border-border py-0'>
      <div className='max-h-[600px] overflow-auto'>{children}</div>
    </Card>
  )
}

// Nội dung dài (vd. stack trace): thu gọn 2 dòng, bấm để xem đầy đủ
export function ExpandableText({ text, className = '' }: { text?: string | null; className?: string }) {
  const [expanded, setExpanded] = useState(false)
  if (!text) return <span className='text-muted-foreground'>—</span>
  const long = text.length > 160 || text.includes('\n')
  if (!long) return <span className={`break-words ${className}`}>{text}</span>
  return (
    <button
      type='button'
      onClick={() => setExpanded((v) => !v)}
      title={expanded ? 'Thu gọn' : 'Xem đầy đủ'}
      className={`w-full cursor-pointer text-left break-words whitespace-pre-wrap ${expanded ? '' : 'line-clamp-2'} ${className}`}
    >
      {text}
    </button>
  )
}

// ===========================================
// EXPORT CSV (trang hiện tại)
// ===========================================

type CsvValue = string | number | boolean | null | undefined

const csvCell = (value: CsvValue) => {
  const s = value === null || value === undefined ? '' : String(value)
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function downloadCsv(fileName: string, headers: string[], rows: CsvValue[][]) {
  const csv = [headers, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n')
  // BOM để Excel đọc đúng tiếng Việt
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${fileName}_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  URL.revokeObjectURL(url)
  toast.success('Đã xuất file nhật ký', { description: `${rows.length} dòng của trang hiện tại` })
}

export function ExportButton({ disabled, onClick }: { disabled?: boolean; onClick: () => void }) {
  return (
    <Button
      className='bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2'
      disabled={disabled}
      onClick={onClick}
    >
      <Download className='h-4 w-4' />
      Xuất CSV
    </Button>
  )
}

// ===========================================
// XOÁ MỘT DÒNG NHẬT KÝ
// ===========================================

export function DeleteLogButton({ kind, id, summary }: { kind: LogKind; id?: number; summary?: string }) {
  const [open, setOpen] = useState(false)
  const deleteLog = useDeleteLog()

  const handleConfirm = async () => {
    if (id == null) return
    try {
      await deleteLog.mutateAsync({ kind, id })
      setOpen(false)
    } catch {
      // Lỗi đã được toast toàn cục
    }
  }

  return (
    <>
      <Button
        variant='ghost'
        size='sm'
        aria-label='Xoá dòng nhật ký'
        title='Xoá dòng nhật ký'
        className='text-red-400 hover:text-red-300 hover:bg-accent h-7 w-7 p-0'
        disabled={id == null}
        onClick={() => setOpen(true)}
      >
        <Trash2 className='h-4 w-4' />
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={(v) => !deleteLog.isPending && setOpen(v)}
        title='Xoá dòng nhật ký'
        desc={
          <div className='space-y-2'>
            <p>
              Xoá dòng nhật ký {LOG_KIND_LABELS[kind]} #{id}? Hành động này không thể hoàn tác.
            </p>
            {summary && <p className='text-foreground line-clamp-3 break-words text-xs'>{summary}</p>}
          </div>
        }
        cancelBtnText='Huỷ'
        confirmText='Xoá'
        destructive
        isLoading={deleteLog.isPending}
        handleConfirm={handleConfirm}
      />
    </>
  )
}
