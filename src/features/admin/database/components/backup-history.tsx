import { useState } from 'react'
import { Calendar, FileArchive, Loader2, RefreshCw, Trash2, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { AdminPagination } from '../../components/admin-pagination'
import { AdminTableState } from '../../components/admin-table-state'
import { formatBytes } from '../../api/configuration'
import {
  type BackupDatabase,
  type BackupHistoryItem,
  type BackupHistoryStatus,
  formatBackupTime,
  formatDuration,
  useBackupHistory,
  useDeleteBackup,
} from '../../api/backup'

const PAGE_SIZE = 10
const ALL = 'all'

const STATUS: Record<BackupHistoryStatus, { label: string; className: string }> = {
  Running: { label: 'Đang chạy', className: 'border-blue-500 text-blue-400' },
  Success: {
    label: 'Thành công',
    className: 'border-green-500 text-green-400',
  },
  Failed: { label: 'Thất bại', className: 'border-red-500 text-red-400' },
  Deleted: {
    label: 'Đã xoá file',
    className: 'border-border text-muted-foreground',
  },
}

const isStatus = (value: string | null | undefined): value is BackupHistoryStatus => !!value && value in STATUS

function StatusBadge({ status }: { status: string | null | undefined }) {
  const info = isStatus(status) ? STATUS[status] : null
  return (
    <Badge variant='outline' className={info?.className ?? 'border-border text-muted-foreground'}>
      {status === 'Running' && <Loader2 className='mr-1 h-3 w-3 animate-spin' />}
      {info?.label ?? status ?? '—'}
    </Badge>
  )
}

const fileNameOf = (path: string | null | undefined) => (path ? path.split(/[\\/]/).pop() || path : '')

type BackupHistoryProps = {
  databases: BackupDatabase[]
  polling: boolean
}

export function BackupHistory({ databases, polling }: BackupHistoryProps) {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<BackupHistoryStatus | ''>('')
  const [connectionName, setConnectionName] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [batchId, setBatchId] = useState('')
  const [deleting, setDeleting] = useState<BackupHistoryItem | null>(null)

  const { data, isLoading, isError, isFetching, refetch } = useBackupHistory(
    {
      pageNumber: page,
      pageSize: PAGE_SIZE,
      status,
      connectionName,
      batchId,
      from: from ? `${from}T00:00:00` : undefined,
      to: to ? `${to}T23:59:59.999` : undefined,
    },
    polling
  )
  const items = data?.items ?? []
  const deleteBackup = useDeleteBackup()

  // Đổi bộ lọc thì quay về trang 1
  const withReset =
    <T,>(setter: (value: T) => void) =>
    (value: T) => {
      setter(value)
      setPage(1)
    }

  const hasFilter = !!(status || connectionName || from || to || batchId)
  const clearFilters = () => {
    setStatus('')
    setConnectionName('')
    setFrom('')
    setTo('')
    setBatchId('')
    setPage(1)
  }

  const confirmDelete = async () => {
    if (deleting?.id == null) return
    await deleteBackup.mutateAsync(deleting.id)
    setDeleting(null)
  }

  const deleteDesc =
    deleting?.status === 'Success'
      ? `Xoá file "${fileNameOf(deleting.filePath)}" của ${deleting.connectionName ?? ''} trên máy chủ SQL Server? Bản ghi vẫn được giữ trong lịch sử với trạng thái "Đã xoá file".`
      : `Gỡ bản ghi backup ${deleting?.connectionName ?? ''} (${formatBackupTime(deleting?.startedAt)}) khỏi lịch sử?`

  return (
    <Card className='bg-card border-border gap-0 p-6'>
      <div className='mb-4 flex flex-wrap items-center justify-between gap-2'>
        <h3 className='text-primary flex items-center gap-2'>
          <Calendar className='h-5 w-5' />
          Lịch sử backup
        </h3>
        <Button
          variant='ghost'
          size='sm'
          className='text-muted-foreground hover:text-foreground'
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          Làm mới
        </Button>
      </div>

      {/* Bộ lọc */}
      <div className='mb-4 flex flex-wrap items-center gap-2'>
        <Select
          value={status || ALL}
          onValueChange={withReset((v: string) => setStatus(v === ALL || !isStatus(v) ? '' : v))}
        >
          <SelectTrigger className='bg-muted border-border text-foreground w-40'>
            <SelectValue placeholder='Trạng thái' />
          </SelectTrigger>
          <SelectContent className='bg-card border-border'>
            <SelectItem value={ALL}>Mọi trạng thái</SelectItem>
            {(Object.keys(STATUS) as BackupHistoryStatus[]).map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS[s].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={connectionName || ALL}
          onValueChange={withReset((v: string) => setConnectionName(v === ALL ? '' : v))}
        >
          <SelectTrigger className='bg-muted border-border text-foreground w-44'>
            <SelectValue placeholder='CSDL' />
          </SelectTrigger>
          <SelectContent className='bg-card border-border'>
            <SelectItem value={ALL}>Tất cả CSDL</SelectItem>
            {databases.map((db) => (
              <SelectItem key={db.connectionName} value={db.connectionName ?? ''}>
                {db.connectionName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className='flex items-center gap-2'>
          <Input
            type='date'
            aria-label='Từ ngày'
            title='Từ ngày'
            value={from}
            max={to || undefined}
            onChange={(e) => withReset(setFrom)(e.target.value)}
            className='bg-muted border-border text-foreground w-40'
          />
          <span className='text-muted-foreground text-sm'>→</span>
          <Input
            type='date'
            aria-label='Đến ngày'
            title='Đến ngày'
            value={to}
            min={from || undefined}
            onChange={(e) => withReset(setTo)(e.target.value)}
            className='bg-muted border-border text-foreground w-40'
          />
        </div>

        {batchId && (
          <Badge variant='outline' className='border-primary text-primary gap-1 py-1'>
            Lượt: {batchId.slice(0, 8)}
            <button
              type='button'
              aria-label='Bỏ lọc lượt backup'
              className='hover:text-foreground'
              onClick={() => withReset(setBatchId)('')}
            >
              <X className='h-3 w-3' />
            </button>
          </Badge>
        )}

        {hasFilter && (
          <Button variant='ghost' size='sm' className='text-muted-foreground' onClick={clearFilters}>
            <X className='mr-1 h-4 w-4' />
            Xoá lọc
          </Button>
        )}
      </div>

      <div className='border-border overflow-hidden rounded-lg border'>
        <TooltipProvider>
          <Table>
            <TableHeader>
              <TableRow className='bg-card border-border hover:bg-card'>
                <TableHead className='text-muted-foreground'>Bắt đầu</TableHead>
                <TableHead className='text-muted-foreground'>CSDL</TableHead>
                <TableHead className='text-muted-foreground'>Trạng thái</TableHead>
                <TableHead className='text-muted-foreground text-right'>Dung lượng</TableHead>
                <TableHead className='text-muted-foreground text-right'>Thời lượng</TableHead>
                <TableHead className='text-muted-foreground'>Nguồn</TableHead>
                <TableHead className='text-muted-foreground'>File / thông báo</TableHead>
                <TableHead className='text-muted-foreground text-right'>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AdminTableState
                colSpan={8}
                isLoading={isLoading}
                isError={isError}
                isEmpty={items.length === 0}
                emptyText={hasFilter ? 'Không có bản backup phù hợp bộ lọc' : 'Chưa có bản backup nào'}
              />
              {items.map((row) => {
                const fileName = fileNameOf(row.filePath)
                const failed = row.status === 'Failed'
                return (
                  <TableRow key={row.id} className='border-border hover:bg-accent'>
                    <TableCell className='text-foreground text-sm whitespace-nowrap'>
                      <div>{formatBackupTime(row.startedAt)}</div>
                      {row.batchId && (
                        <button
                          type='button'
                          title='Lọc theo lượt backup này'
                          className='text-muted-foreground hover:text-primary font-mono text-xs'
                          onClick={() => withReset(setBatchId)(row.batchId ?? '')}
                        >
                          #{row.batchId.slice(0, 8)}
                        </button>
                      )}
                    </TableCell>
                    <TableCell className='text-foreground'>
                      <div>{row.connectionName ?? '—'}</div>
                      <div className='text-muted-foreground font-mono text-xs'>{row.databaseName ?? ''}</div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={row.status} />
                    </TableCell>
                    <TableCell className='text-foreground text-right text-sm whitespace-nowrap'>
                      {formatBytes(row.sizeBytes)}
                      {row.compressed && row.sizeBytes != null && (
                        <div className='text-muted-foreground text-xs'>đã nén</div>
                      )}
                    </TableCell>
                    <TableCell className='text-muted-foreground text-right text-sm whitespace-nowrap'>
                      {formatDuration(row.durationMs)}
                    </TableCell>
                    <TableCell className='text-sm whitespace-nowrap'>
                      <div className='text-foreground'>{row.trigger === 'schedule' ? 'Theo lịch' : 'Thủ công'}</div>
                      {row.triggeredBy && <div className='text-muted-foreground text-xs'>{row.triggeredBy}</div>}
                    </TableCell>
                    <TableCell className='max-w-xs'>
                      {fileName && (
                        <div
                          className='text-foreground flex items-center gap-1 truncate font-mono text-xs'
                          title={row.filePath ?? undefined}
                        >
                          <FileArchive className='text-muted-foreground h-3.5 w-3.5 shrink-0' />
                          <span className='truncate'>{fileName}</span>
                        </div>
                      )}
                      {row.message ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className={`cursor-help truncate text-xs ${failed ? 'text-red-400' : 'text-muted-foreground'}`}
                            >
                              {row.message}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className='bg-card border-border max-w-md border'>
                            <p className='text-foreground text-xs break-all whitespace-pre-wrap'>{row.message}</p>
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        !fileName && <span className='text-muted-foreground'>—</span>
                      )}
                    </TableCell>
                    <TableCell className='text-right'>
                      {row.status !== 'Running' && (
                        <Button
                          variant='ghost'
                          size='sm'
                          aria-label={row.status === 'Success' ? 'Xoá file backup' : 'Gỡ khỏi lịch sử'}
                          title={row.status === 'Success' ? 'Xoá file backup' : 'Gỡ khỏi lịch sử'}
                          className='h-8 w-8 p-0 text-red-400 hover:bg-red-900/20 hover:text-red-300'
                          onClick={() => setDeleting(row)}
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TooltipProvider>
      </div>

      <div className='mt-4'>
        <AdminPagination page={page} pageSize={PAGE_SIZE} totalCount={data?.totalCount ?? 0} onPageChange={setPage} />
      </div>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={deleting?.status === 'Success' ? 'Xoá file backup' : 'Gỡ khỏi lịch sử'}
        desc={deleteDesc}
        cancelBtnText='Huỷ'
        confirmText='Xoá'
        destructive
        isLoading={deleteBackup.isPending}
        handleConfirm={confirmDelete}
      />
    </Card>
  )
}
