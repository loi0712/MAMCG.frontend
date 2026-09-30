import { useCallback, useMemo, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AdminPagination } from '../../components/admin-pagination'
import { AdminTableState } from '../../components/admin-table-state'
import {
  type DateRange,
  DateRangeFilter,
  ExpandableText,
  LogFilterCard,
  LogSearchInput,
  LogTableCard,
  toRangeParams,
} from '../../logs/components/log-shared'
import {
  EMAIL_LOG_STATUS_LABEL,
  EMAIL_LOG_STATUSES,
  type EmailLogStatus,
  useEmailLogs,
  useSystemEvents,
} from '../../api/email-templates'
import { formatDateTime } from '../../api/settings'
import { EmailLogPurgeDialog } from './email-log-purge-dialog'

const PAGE_SIZE = 20
const ALL = 'all'

const STATUS_CLASS: Record<string, string> = {
  Sent: 'border-green-500 text-green-400',
  Failed: 'border-red-500 text-red-400',
  Skipped: 'border-yellow-500 text-yellow-500',
}

export function EmailLogList() {
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [status, setStatus] = useState<string>(ALL)
  const [eventCode, setEventCode] = useState<string>(ALL)
  const [range, setRange] = useState<DateRange>({ from: '', to: '' })
  const [purgeOpen, setPurgeOpen] = useState(false)

  const { data: events = [] } = useSystemEvents()
  const eventNames = useMemo(() => new Map(events.map((e) => [e.code ?? '', e.name ?? ''])), [events])

  const { data, isLoading, isError } = useEmailLogs({
    pageNumber: page,
    pageSize: PAGE_SIZE,
    searchTerm,
    status: status === ALL ? undefined : (status as EmailLogStatus),
    eventCode: eventCode === ALL ? undefined : eventCode,
    ...toRangeParams(range),
  })
  const logs = data?.items ?? []

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term)
    setPage(1)
  }, [])

  const selectClass = 'bg-muted border-border text-foreground'

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-primary'>Nhật ký email</h2>
          <p className='text-sm text-muted-foreground mt-1'>Các email hệ thống đã gửi, gửi lỗi hoặc bị bỏ qua</p>
        </div>
        <Button
          variant='outline'
          className='border-border text-red-400 hover:text-red-300 hover:bg-accent'
          onClick={() => setPurgeOpen(true)}
        >
          <Trash2 className='w-4 h-4' />
          Xoá nhật ký cũ
        </Button>
      </div>

      <LogFilterCard>
        <LogSearchInput placeholder='Tìm theo tiêu đề, người nhận...' onSearch={handleSearch} />

        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v)
            setPage(1)
          }}
        >
          <SelectTrigger className={`${selectClass} w-36`}>
            <SelectValue placeholder='Trạng thái' />
          </SelectTrigger>
          <SelectContent className='bg-card border-border'>
            <SelectItem value={ALL}>Mọi trạng thái</SelectItem>
            {EMAIL_LOG_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {EMAIL_LOG_STATUS_LABEL[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={eventCode}
          onValueChange={(v) => {
            setEventCode(v)
            setPage(1)
          }}
        >
          <SelectTrigger className={`${selectClass} w-56`}>
            <SelectValue placeholder='Sự kiện' />
          </SelectTrigger>
          <SelectContent className='bg-card border-border max-h-80'>
            <SelectItem value={ALL}>Mọi sự kiện</SelectItem>
            {events
              .filter((e) => e.code)
              .map((e) => (
                <SelectItem key={e.code} value={e.code as string}>
                  {e.name}
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
      </LogFilterCard>

      <LogTableCard>
        <Table>
          <TableHeader className='bg-card sticky top-0 z-10'>
            <TableRow className='border-border hover:bg-card'>
              <TableHead className='text-muted-foreground w-40'>Thời gian</TableHead>
              <TableHead className='text-muted-foreground w-24'>Trạng thái</TableHead>
              <TableHead className='text-muted-foreground w-48'>Sự kiện / mẫu</TableHead>
              <TableHead className='text-muted-foreground w-56'>Người nhận</TableHead>
              <TableHead className='text-muted-foreground'>Tiêu đề</TableHead>
              <TableHead className='text-muted-foreground w-64'>Lỗi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AdminTableState
              colSpan={6}
              isLoading={isLoading}
              isError={isError}
              isEmpty={logs.length === 0}
              emptyText='Không có nhật ký email'
            />
            {logs.map((log) => (
              <TableRow key={log.id} className='border-border hover:bg-accent align-top'>
                <TableCell className='text-muted-foreground font-mono text-xs'>{formatDateTime(log.createdAt)}</TableCell>
                <TableCell>
                  <Badge
                    variant='outline'
                    className={STATUS_CLASS[log.status ?? ''] ?? 'border-border text-muted-foreground'}
                  >
                    {EMAIL_LOG_STATUS_LABEL[log.status ?? ''] ?? log.status ?? '—'}
                  </Badge>
                </TableCell>
                <TableCell className='text-sm whitespace-normal'>
                  {log.eventCode ? (
                    <div className='text-foreground'>{eventNames.get(log.eventCode) || log.eventCode}</div>
                  ) : (
                    <div className='text-muted-foreground'>Gửi thử mẫu</div>
                  )}
                  {log.templateCode && (
                    <div className='text-muted-foreground font-mono text-xs'>mẫu: {log.templateCode}</div>
                  )}
                </TableCell>
                <TableCell className='text-xs whitespace-normal break-all'>
                  <div className='text-foreground'>{log.toAddresses || '—'}</div>
                  {log.ccAddresses && <div className='text-muted-foreground'>CC: {log.ccAddresses}</div>}
                </TableCell>
                <TableCell className='text-foreground max-w-md text-sm whitespace-normal break-words'>
                  {log.subject || '—'}
                </TableCell>
                <TableCell className='text-red-400 max-w-xs text-xs whitespace-normal'>
                  <ExpandableText text={log.error} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </LogTableCard>

      <AdminPagination page={page} pageSize={PAGE_SIZE} totalCount={data?.totalCount ?? 0} onPageChange={setPage} />

      <EmailLogPurgeDialog open={purgeOpen} onOpenChange={setPurgeOpen} />
    </div>
  )
}
