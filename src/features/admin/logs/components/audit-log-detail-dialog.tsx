import { useMemo, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/shared/lib/utils'
import { type AuditAction, auditEntityLabel, useAuditLog } from '../../api/logs'
import { formatDateTime } from './log-shared'
import { AuditActionBadge } from './audit-action-badge'

type Snapshot = Record<string, unknown>

const parse = (json?: string | null): Snapshot | null => {
  if (!json) return null
  try {
    const value = JSON.parse(json)
    return value && typeof value === 'object' ? (value as Snapshot) : null
  } catch {
    return null
  }
}

const display = (value: unknown) => {
  if (value === undefined) return ''
  if (value === null) return 'null'
  if (typeof value === 'string') return value
  return JSON.stringify(value)
}

interface DiffRow {
  field: string
  before: unknown
  after: unknown
  changed: boolean
}

// Hợp các thuộc tính của trước/sau; "thay đổi" theo changedFields (update) hoặc giá trị khác nhau
const buildRows = (before: Snapshot | null, after: Snapshot | null, changedFields?: string | null): DiffRow[] => {
  const changed = new Set((changedFields ?? '').split(',').map((s) => s.trim()).filter(Boolean))
  const keys = Array.from(new Set([...Object.keys(before ?? {}), ...Object.keys(after ?? {})]))
  return keys.map((field) => {
    const b = before?.[field]
    const a = after?.[field]
    return {
      field,
      before: b,
      after: a,
      changed: changed.has(field) || (before != null && after != null && display(b) !== display(a)),
    }
  })
}

interface AuditLogDetailDialogProps {
  id: number | null
  onOpenChange: (open: boolean) => void
}

export function AuditLogDetailDialog({ id, onOpenChange }: AuditLogDetailDialogProps) {
  const { data, isLoading, isError } = useAuditLog(id)
  const [onlyChanged, setOnlyChanged] = useState(true)

  const rows = useMemo(
    () => (data ? buildRows(parse(data.before), parse(data.after), data.changedFields) : []),
    [data]
  )
  const isUpdate = data?.action === 'update' || (data?.before != null && data?.after != null)
  const visible = isUpdate && onlyChanged ? rows.filter((r) => r.changed) : rows

  return (
    <Dialog open={id != null} onOpenChange={onOpenChange}>
      <DialogContent className='bg-card border-border max-h-[90vh] overflow-hidden sm:max-w-4xl'>
        <DialogHeader>
          <DialogTitle className='text-primary'>Chi tiết thay đổi #{id}</DialogTitle>
          <DialogDescription>So sánh giá trị trước và sau khi thay đổi. Trường nhạy cảm (mật khẩu, khoá bí mật) được che.</DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className='text-muted-foreground flex items-center gap-2 py-8 text-sm'>
            <Loader2 className='h-4 w-4 animate-spin' /> Đang tải...
          </div>
        )}
        {isError && <p className='text-destructive py-8 text-sm'>Không tải được chi tiết nhật ký.</p>}

        {data && (
          <div className='min-h-0 space-y-4 overflow-auto'>
            <dl className='grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2'>
              <div className='flex gap-2'>
                <dt className='text-muted-foreground w-28 shrink-0'>Thời gian</dt>
                <dd className='text-foreground'>{formatDateTime(data.createdAt)}</dd>
              </div>
              <div className='flex gap-2'>
                <dt className='text-muted-foreground w-28 shrink-0'>Thao tác</dt>
                <dd>
                  <AuditActionBadge action={data.action as AuditAction} />
                </dd>
              </div>
              <div className='flex gap-2'>
                <dt className='text-muted-foreground w-28 shrink-0'>Người thao tác</dt>
                <dd className='text-foreground break-all'>
                  {data.userFullName || data.userName || '—'}
                  {data.userFullName && data.userName && <span className='text-muted-foreground'> ({data.userName})</span>}
                </dd>
              </div>
              <div className='flex gap-2'>
                <dt className='text-muted-foreground w-28 shrink-0'>IP</dt>
                <dd className='text-foreground font-mono text-xs leading-5'>{data.ipAddress || '—'}</dd>
              </div>
              <div className='flex gap-2'>
                <dt className='text-muted-foreground w-28 shrink-0'>Đối tượng</dt>
                <dd className='text-foreground'>
                  {auditEntityLabel(data.entityType)} <span className='text-muted-foreground'>#{data.entityId ?? '—'}</span>
                </dd>
              </div>
              <div className='flex gap-2'>
                <dt className='text-muted-foreground w-28 shrink-0'>Module</dt>
                <dd className='text-foreground'>{data.module}</dd>
              </div>
            </dl>

            {isUpdate && (
              <div className='flex items-center gap-2'>
                <Switch id='audit-only-changed' checked={onlyChanged} onCheckedChange={setOnlyChanged} />
                <Label htmlFor='audit-only-changed' className='text-sm'>
                  Chỉ hiện trường thay đổi
                </Label>
              </div>
            )}

            {/* Bảng thường (không dùng <Table>: khung cao cố định 75vh) */}
            <div className='border-border overflow-x-auto rounded-md border'>
              <table className='w-full caption-bottom text-sm'>
                <TableHeader>
                  <TableRow className='border-border hover:bg-card'>
                    <TableHead className='text-muted-foreground w-48'>Trường</TableHead>
                    <TableHead className='text-muted-foreground'>Trước</TableHead>
                    <TableHead className='text-muted-foreground'>Sau</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visible.length === 0 && (
                    <TableRow className='border-border hover:bg-card'>
                      <TableCell colSpan={3} className='text-muted-foreground py-6 text-center'>
                        Không có dữ liệu để so sánh
                      </TableCell>
                    </TableRow>
                  )}
                  {visible.map((r) => (
                    <TableRow key={r.field} className={cn('border-border', r.changed && isUpdate && 'bg-yellow-500/10')}>
                      <TableCell className='text-foreground align-top font-mono text-xs'>
                        {r.field}
                        {r.changed && isUpdate && (
                          <Badge variant='outline' className='ml-2 border-yellow-500 px-1 py-0 text-[10px] text-yellow-500'>
                            đổi
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell
                        className={cn(
                          'align-top font-mono text-xs break-all whitespace-pre-wrap',
                          r.changed && isUpdate ? 'text-red-400 line-through decoration-red-400/40' : 'text-muted-foreground'
                        )}
                      >
                        {data.before == null ? <span className='text-muted-foreground'>—</span> : display(r.before)}
                      </TableCell>
                      <TableCell
                        className={cn(
                          'align-top font-mono text-xs break-all whitespace-pre-wrap',
                          r.changed && isUpdate ? 'text-green-400' : 'text-foreground'
                        )}
                      >
                        {data.after == null ? <span className='text-muted-foreground'>—</span> : display(r.after)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </table>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
