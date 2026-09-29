import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AdminPagination } from '../../components/admin-pagination'
import { AdminTableState } from '../../components/admin-table-state'
import { useLdapSyncLogs } from '../../api/logs'
import {
  downloadCsv,
  ExpandableText,
  ExportButton,
  formatDateTime,
  LOG_PAGE_SIZE,
  LogFilterCard,
  LogTableCard,
} from './log-shared'

function StatusBadge({ status }: { status?: string | null }) {
  const s = (status ?? '').toLowerCase()
  const className = s.includes('success') || s.includes('thành công')
    ? 'border-green-500 text-green-400'
    : s.includes('fail') || s.includes('error') || s.includes('lỗi')
      ? 'border-red-500 text-red-400'
      : 'border-yellow-500 text-yellow-400'
  return (
    <Badge variant='outline' className={className}>
      {status || '—'}
    </Badge>
  )
}

export function LdapSyncLogsTab({ active }: { active: boolean }) {
  const [page, setPage] = useState(1)
  const { data, isLoading, isError } = useLdapSyncLogs({ pageNumber: page, pageSize: LOG_PAGE_SIZE }, active)
  const logs = data?.items ?? []

  const handleExport = () =>
    downloadCsv(
      'nhat-ky-dong-bo-ldap',
      ['Thời gian', 'Trạng thái', 'Người dùng', 'Nhóm', 'Nội dung'],
      logs.map((l) => [formatDateTime(l.syncTime), l.status, l.usersSynced, l.groupsSynced, l.message])
    )

  return (
    <div className='space-y-4'>
      <LogFilterCard>
        <p className='text-muted-foreground flex-1 text-sm'>Lịch sử các lần đồng bộ người dùng và nhóm từ LDAP.</p>
        <ExportButton disabled={logs.length === 0} onClick={handleExport} />
      </LogFilterCard>

      <LogTableCard>
        <Table>
          <TableHeader className='bg-card sticky top-0 z-10'>
            <TableRow className='border-border hover:bg-card'>
              <TableHead className='text-muted-foreground w-40'>Thời gian</TableHead>
              <TableHead className='text-muted-foreground w-32'>Trạng thái</TableHead>
              <TableHead className='text-muted-foreground w-28 text-right'>Người dùng</TableHead>
              <TableHead className='text-muted-foreground w-28 text-right'>Nhóm</TableHead>
              <TableHead className='text-muted-foreground'>Nội dung</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AdminTableState
              colSpan={5}
              isLoading={isLoading}
              isError={isError}
              isEmpty={logs.length === 0}
              emptyText='Chưa có lần đồng bộ LDAP nào'
            />
            {logs.map((log) => (
              <TableRow key={log.id} className='border-border hover:bg-accent'>
                <TableCell className='text-muted-foreground font-mono text-xs'>{formatDateTime(log.syncTime)}</TableCell>
                <TableCell>
                  <StatusBadge status={log.status} />
                </TableCell>
                <TableCell className='text-foreground text-right'>{log.usersSynced ?? '—'}</TableCell>
                <TableCell className='text-foreground text-right'>{log.groupsSynced ?? '—'}</TableCell>
                <TableCell className='text-foreground text-sm whitespace-normal'>
                  <ExpandableText text={log.message} />
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
