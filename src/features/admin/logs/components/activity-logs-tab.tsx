import { useCallback, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { AdminPagination } from '../../components/admin-pagination'
import { AdminTableState } from '../../components/admin-table-state'
import { type ActivityLogParams, useActionTypes, useActivityLogs } from '../../api/logs'
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
  DeleteLogButton,
} from './log-shared'

type OutcomeFilter = 'all' | NonNullable<ActivityLogParams['outcome']>

const getBrowser = (ua: string) => {
  if (ua.includes('Edg/') || ua.includes('Edge')) return 'Edge'
  if (ua.includes('Firefox')) return 'Firefox'
  if (ua.includes('Chrome')) return 'Chrome'
  if (ua.includes('Safari')) return 'Safari'
  return ua.split(/[\s/]/)[0] || 'Khác'
}

const getOS = (ua: string) => {
  if (ua.includes('Windows NT')) return 'Windows'
  if (ua.includes('Mac OS X')) return 'macOS'
  if (ua.includes('Android')) return 'Android'
  if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS'
  if (ua.includes('Linux')) return 'Linux'
  return null
}

// Backend ghi "Success" hoặc "Failed (mã HTTP)"
function OutcomeBadge({ outcome }: { outcome?: string | null }) {
  if (!outcome) return <span className='text-muted-foreground'>—</span>
  const ok = outcome === 'Success'
  return (
    <Badge variant='outline' className={ok ? 'border-green-500 text-green-400' : 'border-red-500 text-red-400'}>
      {ok ? 'Thành công' : outcome.replace(/^Failed/, 'Thất bại')}
    </Badge>
  )
}

export function ActivityLogsTab({ active }: { active: boolean }) {
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [actionTypeId, setActionTypeId] = useState('all')
  const [outcome, setOutcome] = useState<OutcomeFilter>('all')
  const [range, setRange] = useState<DateRange>({ from: '', to: '' })

  const { data: actionTypes } = useActionTypes()
  // Bộ lọc dùng chung cho danh sách và xuất CSV
  const filters = {
    searchTerm,
    actionTypeId: actionTypeId === 'all' ? undefined : Number(actionTypeId),
    outcome: outcome === 'all' ? undefined : outcome,
    ...toRangeParams(range),
  }
  const { data, isLoading, isError } = useActivityLogs({ pageNumber: page, pageSize: LOG_PAGE_SIZE, ...filters }, active)
  const logs = data?.items ?? []

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term)
    setPage(1)
  }, [])

  return (
    <div className='space-y-4'>
      <LogFilterCard>
        <LogSearchInput placeholder='Tìm theo người dùng, thao tác, IP...' onSearch={handleSearch} />

        <Select
          value={actionTypeId}
          onValueChange={(v) => {
            setActionTypeId(v)
            setPage(1)
          }}
        >
          <SelectTrigger className='bg-muted border-border text-foreground w-40'>
            <SelectValue placeholder='Loại thao tác' />
          </SelectTrigger>
          <SelectContent className='bg-card border-border'>
            <SelectItem value='all'>Tất cả thao tác</SelectItem>
            {(actionTypes ?? []).map((t) => (
              <SelectItem key={t.id} value={String(t.id)}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={outcome}
          onValueChange={(v) => {
            setOutcome(v as OutcomeFilter)
            setPage(1)
          }}
        >
          <SelectTrigger className='bg-muted border-border text-foreground w-36'>
            <SelectValue placeholder='Kết quả' />
          </SelectTrigger>
          <SelectContent className='bg-card border-border'>
            <SelectItem value='all'>Mọi kết quả</SelectItem>
            <SelectItem value='success'>Thành công</SelectItem>
            <SelectItem value='failed'>Thất bại</SelectItem>
          </SelectContent>
        </Select>

        <DateRangeFilter
          value={range}
          onChange={(v) => {
            setRange(v)
            setPage(1)
          }}
        />

        <ExportButton kind='activities' params={filters} disabled={logs.length === 0} />
      </LogFilterCard>

      <LogTableCard>
        <Table>
          <TableHeader className='bg-card sticky top-0 z-10'>
            <TableRow className='border-border hover:bg-card'>
              <TableHead className='text-muted-foreground w-40'>Thời gian</TableHead>
              <TableHead className='text-muted-foreground w-36'>Người dùng</TableHead>
              <TableHead className='text-muted-foreground w-28'>Thao tác</TableHead>
              <TableHead className='text-muted-foreground'>Chi tiết</TableHead>
              <TableHead className='text-muted-foreground w-32'>Kết quả</TableHead>
              <TableHead className='text-muted-foreground w-24 text-right'>Thời lượng</TableHead>
              <TableHead className='text-muted-foreground w-32'>IP</TableHead>
              <TableHead className='text-muted-foreground w-32'>Thiết bị</TableHead>
              <TableHead className='text-muted-foreground w-12' aria-label='Thao tác' />
            </TableRow>
          </TableHeader>
          <TableBody>
            <AdminTableState
              colSpan={9}
              isLoading={isLoading}
              isError={isError}
              isEmpty={logs.length === 0}
              emptyText='Không có nhật ký hoạt động'
            />
            {logs.map((log) => (
              <TableRow key={log.id} className='border-border hover:bg-accent'>
                <TableCell className='text-muted-foreground font-mono text-xs'>{formatDateTime(log.createdAt)}</TableCell>
                <TableCell className='text-foreground'>{log.userName || '—'}</TableCell>
                <TableCell>
                  <Badge variant='outline' className='border-border text-muted-foreground'>
                    {log.actionTypeName ?? '—'}
                  </Badge>
                </TableCell>
                <TableCell className='text-foreground font-mono text-xs break-all whitespace-normal'>
                  {log.actionDetail || '—'}
                </TableCell>
                <TableCell>
                  <OutcomeBadge outcome={log.outcome} />
                </TableCell>
                <TableCell className='text-muted-foreground text-right text-xs'>
                  {log.durationMs !== null && log.durationMs !== undefined ? `${log.durationMs} ms` : '—'}
                </TableCell>
                <TableCell className='text-muted-foreground font-mono text-xs'>{log.ipAddress || '—'}</TableCell>
                <TableCell className='text-muted-foreground text-xs'>
                  {log.deviceInfo ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className='flex flex-col gap-1'>
                            <span className='text-foreground'>{getBrowser(log.deviceInfo)}</span>
                            {getOS(log.deviceInfo) && (
                              <span className='text-muted-foreground text-[10px]'>{getOS(log.deviceInfo)}</span>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className='bg-card border-border max-w-md'>
                          <p className='text-foreground text-xs break-all'>{log.deviceInfo}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    '—'
                  )}
                </TableCell>
                <TableCell className='text-right'>
                  <DeleteLogButton kind='activities' id={log.id} summary={`${formatDateTime(log.createdAt)} • ${log.userName ?? ''} • ${log.actionDetail ?? ''}`} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </LogTableCard>

      <AdminPagination page={page} pageSize={LOG_PAGE_SIZE} totalCount={data?.totalCount ?? 0} onPageChange={setPage} />
    </div>
  )
}
