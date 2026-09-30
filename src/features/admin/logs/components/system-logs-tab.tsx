import { useCallback, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AdminPagination } from '../../components/admin-pagination'
import { AdminTableState } from '../../components/admin-table-state'
import { SYSTEM_LOG_LEVELS, useSystemLogs } from '../../api/logs'
import {
  type DateRange,
  DateRangeFilter,
  downloadCsv,
  ExpandableText,
  ExportButton,
  formatDateTime,
  LOG_PAGE_SIZE,
  LogFilterCard,
  LogSearchInput,
  LogTableCard,
  toRangeParams,
  DeleteLogButton,
} from './log-shared'

const LEVEL_STYLE: Record<string, string> = {
  Information: 'border-blue-500 text-blue-400',
  Warning: 'border-yellow-500 text-yellow-400',
  Error: 'border-red-500 text-red-400',
  Critical: 'border-red-700 bg-red-900/20 text-red-400',
}

export function LevelBadge({ level }: { level?: string | null }) {
  return (
    <Badge variant='outline' className={LEVEL_STYLE[level ?? ''] ?? 'border-border text-muted-foreground'}>
      {level ?? '—'}
    </Badge>
  )
}

export function SystemLogsTab({ active }: { active: boolean }) {
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [level, setLevel] = useState('all')
  const [range, setRange] = useState<DateRange>({ from: '', to: '' })

  const { data, isLoading, isError } = useSystemLogs(
    {
      pageNumber: page,
      pageSize: LOG_PAGE_SIZE,
      searchTerm,
      logLevel: level === 'all' ? undefined : level,
      ...toRangeParams(range),
    },
    active
  )
  const logs = data?.items ?? []

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term)
    setPage(1)
  }, [])

  const handleExport = () =>
    downloadCsv(
      'nhat-ky-he-thong',
      ['Thời gian', 'Mức độ', 'Dịch vụ', 'Nguồn', 'Nội dung'],
      logs.map((l) => [formatDateTime(l.createdAt), l.logLevel, l.serviceName, l.source, l.message])
    )

  return (
    <div className='space-y-4'>
      <LogFilterCard>
        <LogSearchInput placeholder='Tìm trong nội dung, nguồn log...' onSearch={handleSearch} />

        <Select
          value={level}
          onValueChange={(v) => {
            setLevel(v)
            setPage(1)
          }}
        >
          <SelectTrigger className='bg-muted border-border text-foreground w-40'>
            <SelectValue placeholder='Mức độ' />
          </SelectTrigger>
          <SelectContent className='bg-card border-border'>
            <SelectItem value='all'>Mọi mức độ</SelectItem>
            {SYSTEM_LOG_LEVELS.map((l) => (
              <SelectItem key={l} value={l}>
                {l}
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

        <ExportButton disabled={logs.length === 0} onClick={handleExport} />
      </LogFilterCard>

      <LogTableCard>
        <Table>
          <TableHeader className='bg-card sticky top-0 z-10'>
            <TableRow className='border-border hover:bg-card'>
              <TableHead className='text-muted-foreground w-40'>Thời gian</TableHead>
              <TableHead className='text-muted-foreground w-24'>Mức độ</TableHead>
              <TableHead className='text-muted-foreground w-36'>Dịch vụ</TableHead>
              <TableHead className='text-muted-foreground w-56'>Nguồn</TableHead>
              <TableHead className='text-muted-foreground'>Nội dung</TableHead>
              <TableHead className='text-muted-foreground w-12' aria-label='Thao tác' />
            </TableRow>
          </TableHeader>
          <TableBody>
            <AdminTableState
              colSpan={6}
              isLoading={isLoading}
              isError={isError}
              isEmpty={logs.length === 0}
              emptyText='Không có nhật ký hệ thống'
            />
            {logs.map((log) => (
              <TableRow key={log.id} className='border-border hover:bg-accent align-top'>
                <TableCell className='text-muted-foreground font-mono text-xs'>{formatDateTime(log.createdAt)}</TableCell>
                <TableCell>
                  <LevelBadge level={log.logLevel} />
                </TableCell>
                <TableCell className='text-muted-foreground text-xs'>{log.serviceName || '—'}</TableCell>
                <TableCell className='text-muted-foreground font-mono text-xs break-all whitespace-normal'>
                  {log.source || '—'}
                </TableCell>
                <TableCell className='text-foreground max-w-xl text-sm whitespace-normal'>
                  <ExpandableText text={log.message} />
                </TableCell>
                <TableCell className='text-right'>
                  <DeleteLogButton kind='system' id={log.id} summary={`${formatDateTime(log.createdAt)} • ${log.message ?? ''}`} />
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
