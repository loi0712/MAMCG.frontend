import { useMemo, useState } from 'react'
import { Server } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AdminPagination } from '../../components/admin-pagination'
import { AdminTableState } from '../../components/admin-table-state'
import { ALL_ITEMS } from '../../api/common'
import { useCGServers } from '../../api/cg-servers'
import { useCGServerLogs } from '../../api/logs'
import {
  type DateRange,
  DateRangeFilter,
  downloadCsv,
  ExpandableText,
  ExportButton,
  formatDateTime,
  LOG_PAGE_SIZE,
  LogFilterCard,
  LogTableCard,
  toRangeParams,
  DeleteLogButton,
} from './log-shared'

// Backend ghi "[OK] ..." khi kết nối được, "[LỖI] ..." khi không
function ResultBadge({ message }: { message?: string | null }) {
  if (message?.startsWith('[OK]')) {
    return (
      <Badge variant='outline' className='border-green-500 text-green-400'>
        Kết nối được
      </Badge>
    )
  }
  if (message?.startsWith('[LỖI]')) {
    return (
      <Badge variant='outline' className='border-red-500 text-red-400'>
        Lỗi
      </Badge>
    )
  }
  return (
    <Badge variant='outline' className='border-blue-500 text-blue-400'>
      Thông tin
    </Badge>
  )
}

const stripPrefix = (message?: string | null) => message?.replace(/^\[(OK|LỖI)\]\s*/, '') ?? null

export function CGServerLogsTab({ active }: { active: boolean }) {
  const [page, setPage] = useState(1)
  const [serverId, setServerId] = useState('all')
  const [range, setRange] = useState<DateRange>({ from: '', to: '' })

  const { data: serversData } = useCGServers(ALL_ITEMS)
  const servers = useMemo(() => serversData?.items ?? [], [serversData])
  const serverName = (id?: number) => servers.find((s) => s.id === id)?.serverName ?? `Server #${id ?? '?'}`

  const { data, isLoading, isError } = useCGServerLogs(
    {
      pageNumber: page,
      pageSize: LOG_PAGE_SIZE,
      serverId: serverId === 'all' ? undefined : Number(serverId),
      ...toRangeParams(range),
    },
    active
  )
  const logs = data?.items ?? []

  const handleExport = () =>
    downloadCsv(
      'nhat-ky-cg-server',
      ['Thời gian', 'Server', 'Nội dung'],
      logs.map((l) => [formatDateTime(l.createdAt), serverName(l.serverId), l.message])
    )

  return (
    <div className='space-y-4'>
      <LogFilterCard>
        <Select
          value={serverId}
          onValueChange={(v) => {
            setServerId(v)
            setPage(1)
          }}
        >
          <SelectTrigger className='bg-muted border-border text-foreground w-56'>
            <SelectValue placeholder='Server' />
          </SelectTrigger>
          <SelectContent className='bg-card border-border'>
            <SelectItem value='all'>Tất cả server</SelectItem>
            {servers.map((s) => (
              <SelectItem key={s.id} value={String(s.id)}>
                {s.serverName}
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

        <div className='flex-1' />
        <ExportButton disabled={logs.length === 0} onClick={handleExport} />
      </LogFilterCard>

      <LogTableCard>
        <Table>
          <TableHeader className='bg-card sticky top-0 z-10'>
            <TableRow className='border-border hover:bg-card'>
              <TableHead className='text-muted-foreground w-40'>Thời gian</TableHead>
              <TableHead className='text-muted-foreground w-32'>Kết quả</TableHead>
              <TableHead className='text-muted-foreground w-56'>Server</TableHead>
              <TableHead className='text-muted-foreground'>Nội dung</TableHead>
              <TableHead className='text-muted-foreground w-12' aria-label='Thao tác' />
            </TableRow>
          </TableHeader>
          <TableBody>
            <AdminTableState
              colSpan={5}
              isLoading={isLoading}
              isError={isError}
              isEmpty={logs.length === 0}
              emptyText='Chưa có nhật ký kiểm tra CG server'
            />
            {logs.map((log) => (
              <TableRow key={log.id} className='border-border hover:bg-accent'>
                <TableCell className='text-muted-foreground font-mono text-xs'>{formatDateTime(log.createdAt)}</TableCell>
                <TableCell>
                  <ResultBadge message={log.message} />
                </TableCell>
                <TableCell className='text-foreground'>
                  <div className='flex items-center gap-2'>
                    <Server className='text-primary h-3 w-3' />
                    {serverName(log.serverId)}
                  </div>
                </TableCell>
                <TableCell className='text-foreground text-sm whitespace-normal'>
                  <ExpandableText text={stripPrefix(log.message)} />
                </TableCell>
                <TableCell className='text-right'>
                  <DeleteLogButton kind='cg-server' id={log.id} summary={`${formatDateTime(log.createdAt)} • ${serverName(log.serverId)} • ${stripPrefix(log.message) ?? ''}`} />
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
