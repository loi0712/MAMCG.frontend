import { useCallback, useState } from 'react'
import { Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AdminPagination } from '../../components/admin-pagination'
import { AdminTableState } from '../../components/admin-table-state'
import {
  AUDIT_ACTION_LABELS,
  type AuditAction,
  auditEntityLabel,
  useAuditEntityTypes,
  useAuditLogs,
} from '../../api/logs'
import { AuditActionBadge } from './audit-action-badge'
import { AuditLogDetailDialog } from './audit-log-detail-dialog'
import {
  type DateRange,
  DateRangeFilter,
  ExportButton,
  formatDateTime,
  LOG_PAGE_SIZE,
  LogFilterCard,
  LogSearchInput,
  LogTableCard,
  toRangeParams,
} from './log-shared'

type ActionFilter = 'all' | AuditAction

// Danh sách trường thay đổi: hiện tối đa 4 tên, còn lại gộp "+n"
const summarizeFields = (fields?: string | null) => {
  const list = (fields ?? '').split(',').filter(Boolean)
  if (list.length === 0) return '—'
  return list.length <= 4 ? list.join(', ') : `${list.slice(0, 4).join(', ')} +${list.length - 4}`
}

export function AuditLogsTab({ active }: { active: boolean }) {
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [user, setUser] = useState('')
  const [entityType, setEntityType] = useState('all')
  const [action, setAction] = useState<ActionFilter>('all')
  const [range, setRange] = useState<DateRange>({ from: '', to: '' })
  const [detailId, setDetailId] = useState<number | null>(null)

  const { data: entityTypes } = useAuditEntityTypes(active)
  // Bộ lọc dùng chung cho danh sách và xuất CSV
  const filters = {
    searchTerm,
    user,
    entityType: entityType === 'all' ? undefined : entityType,
    action: action === 'all' ? undefined : action,
    ...toRangeParams(range),
  }
  const { data, isLoading, isError } = useAuditLogs({ pageNumber: page, pageSize: LOG_PAGE_SIZE, ...filters }, active)
  const logs = data?.items ?? []

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term)
    setPage(1)
  }, [])

  const handleUser = useCallback((term: string) => {
    setUser(term)
    setPage(1)
  }, [])

  return (
    <div className='space-y-4'>
      <LogFilterCard>
        <LogSearchInput placeholder='Tìm theo đối tượng, id, trường thay đổi, IP...' onSearch={handleSearch} />
        <div className='w-56'>
          <LogSearchInput placeholder='Người thao tác' onSearch={handleUser} />
        </div>

        <Select
          value={entityType}
          onValueChange={(v) => {
            setEntityType(v)
            setPage(1)
          }}
        >
          <SelectTrigger className='bg-muted border-border text-foreground w-48' aria-label='Loại đối tượng'>
            <SelectValue placeholder='Loại đối tượng' />
          </SelectTrigger>
          <SelectContent className='bg-card border-border'>
            <SelectItem value='all'>Mọi đối tượng</SelectItem>
            {(entityTypes ?? []).map((t) => (
              <SelectItem key={`${t.module}:${t.entityType}`} value={t.entityType}>
                {auditEntityLabel(t.entityType)} ({t.count})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={action}
          onValueChange={(v) => {
            setAction(v as ActionFilter)
            setPage(1)
          }}
        >
          <SelectTrigger className='bg-muted border-border text-foreground w-36' aria-label='Thao tác'>
            <SelectValue placeholder='Thao tác' />
          </SelectTrigger>
          <SelectContent className='bg-card border-border'>
            <SelectItem value='all'>Mọi thao tác</SelectItem>
            {(Object.keys(AUDIT_ACTION_LABELS) as AuditAction[]).map((a) => (
              <SelectItem key={a} value={a}>
                {AUDIT_ACTION_LABELS[a]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <DateRangeFilter
          value={range}
          onChange={(v) => {
            setRange(v)
            setPage(1)
          }}
        />

        <ExportButton kind='audit' params={filters} disabled={logs.length === 0} />
      </LogFilterCard>

      <LogTableCard>
        <Table>
          <TableHeader className='bg-card sticky top-0 z-10'>
            <TableRow className='border-border hover:bg-card'>
              <TableHead className='text-muted-foreground w-40'>Thời gian</TableHead>
              <TableHead className='text-muted-foreground w-44'>Người thao tác</TableHead>
              <TableHead className='text-muted-foreground w-28'>Thao tác</TableHead>
              <TableHead className='text-muted-foreground w-48'>Đối tượng</TableHead>
              <TableHead className='text-muted-foreground'>Trường thay đổi</TableHead>
              <TableHead className='text-muted-foreground w-32'>IP</TableHead>
              <TableHead className='text-muted-foreground w-12' aria-label='Xem chi tiết' />
            </TableRow>
          </TableHeader>
          <TableBody>
            <AdminTableState
              colSpan={7}
              isLoading={isLoading}
              isError={isError}
              isEmpty={logs.length === 0}
              emptyText='Không có nhật ký kiểm toán'
            />
            {logs.map((log) => (
              <TableRow
                key={log.id}
                className='border-border hover:bg-accent cursor-pointer'
                onClick={() => setDetailId(log.id)}
              >
                <TableCell className='text-muted-foreground font-mono text-xs'>{formatDateTime(log.createdAt)}</TableCell>
                <TableCell className='text-foreground'>
                  <div className='flex flex-col'>
                    <span>{log.userFullName || log.userName || '—'}</span>
                    {log.userFullName && log.userName && (
                      <span className='text-muted-foreground text-[11px]'>{log.userName}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <AuditActionBadge action={log.action} />
                </TableCell>
                <TableCell className='text-foreground'>
                  <div className='flex flex-col'>
                    <span>{auditEntityLabel(log.entityType)}</span>
                    <span className='text-muted-foreground font-mono text-[11px]'>
                      {log.module} #{log.entityId ?? '—'}
                    </span>
                  </div>
                </TableCell>
                <TableCell className='text-muted-foreground font-mono text-xs break-all whitespace-normal'>
                  {summarizeFields(log.changedFields)}
                </TableCell>
                <TableCell className='text-muted-foreground font-mono text-xs'>{log.ipAddress || '—'}</TableCell>
                <TableCell className='text-right'>
                  <Button
                    variant='ghost'
                    size='sm'
                    aria-label='Xem chi tiết'
                    title='Xem trước/sau'
                    className='hover:bg-accent h-7 w-7 p-0'
                    onClick={(e) => {
                      e.stopPropagation()
                      setDetailId(log.id)
                    }}
                  >
                    <Eye className='h-4 w-4' />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </LogTableCard>

      <AdminPagination page={page} pageSize={LOG_PAGE_SIZE} totalCount={data?.totalCount ?? 0} onPageChange={setPage} />

      <AuditLogDetailDialog id={detailId} onOpenChange={(open) => !open && setDetailId(null)} />
    </div>
  )
}
