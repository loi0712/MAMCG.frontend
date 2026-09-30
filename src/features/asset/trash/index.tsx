import { useCallback, useState } from 'react'
import { AlertTriangle, ImageOff, Loader2, RotateCcw, ShieldAlert, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Main } from '@/components/layout/Main'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { AdminListToolbar } from '@/features/admin/components/admin-list-toolbar'
import { AdminPagination } from '@/features/admin/components/admin-pagination'
import { AdminTableState } from '@/features/admin/components/admin-table-state'
import { useMyAccess } from '@/features/admin/api/permissions'
import { mediaUrl } from '@/utils/media-url'
import { type TrashAsset, usePurgeAsset, useRestoreAsset, useTrash } from '../api/trash'

const PAGE_SIZE = 20
const COLUMNS = 7

const formatSize = (bytes: number) => {
  if (!bytes) return '—'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let value = bytes
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit++
  }
  return `${value.toFixed(unit === 0 ? 0 : 1)} ${units[unit]}`
}

const formatDate = (value: string) => {
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? value : d.toLocaleString('vi-VN')
}

function Thumbnail({ asset }: { asset: TrashAsset }) {
  const [failed, setFailed] = useState(false)
  if (!asset.thumbnail || failed) {
    return (
      <div className='bg-muted text-muted-foreground flex h-10 w-14 items-center justify-center rounded'>
        <ImageOff className='h-4 w-4' />
      </div>
    )
  }
  return (
    <img
      src={mediaUrl(asset.thumbnail)}
      alt={asset.name}
      className='h-10 w-14 rounded object-cover'
      loading='lazy'
      onError={() => setFailed(true)}
    />
  )
}

// Thùng rác thiết kế (quản trị): khôi phục hoặc xoá vĩnh viễn thiết kế đã xoá
export function AssetTrashPage() {
  const access = useMyAccess()
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [restoring, setRestoring] = useState<TrashAsset | null>(null)
  const [purging, setPurging] = useState<TrashAsset | null>(null)

  const isAdmin = access.data?.isAdmin === true
  const { data, isLoading, isError } = useTrash({ pageNumber: page, pageSize: PAGE_SIZE, searchTerm }, isAdmin)
  const restore = useRestoreAsset()
  const purge = usePurgeAsset()
  const assets = data?.assets ?? []

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term)
    setPage(1)
  }, [])

  const confirmRestore = async () => {
    if (!restoring) return
    try {
      await restore.mutateAsync(restoring.id)
    } catch {
      // Lỗi (vd. trùng mã → 409) đã được thông báo chung
    }
    setRestoring(null)
  }

  const confirmPurge = async () => {
    if (!purging) return
    try {
      await purge.mutateAsync(purging.id)
    } catch {
      // Lỗi đã được thông báo chung
    }
    setPurging(null)
  }

  if (access.isLoading) {
    return (
      <Main>
        <div className='text-muted-foreground flex h-40 items-center justify-center gap-2 text-sm'>
          <Loader2 className='h-4 w-4 animate-spin' /> Đang kiểm tra quyền...
        </div>
      </Main>
    )
  }

  if (!isAdmin) {
    return (
      <Main>
        <div className='text-muted-foreground flex h-60 flex-col items-center justify-center gap-3 text-sm'>
          <ShieldAlert className='h-10 w-10' />
          <p>Chỉ quản trị viên mới được xem và xử lý thùng rác.</p>
        </div>
      </Main>
    )
  }

  const label = (a: TrashAsset | null) => (a ? [a.code, a.name].filter(Boolean).join(' – ') : '')

  return (
    <Main>
      <div className='space-y-4 py-2'>
        <div className='flex items-center gap-2'>
          <Trash2 className='text-muted-foreground h-5 w-5' />
          <h1 className='text-lg font-semibold'>Thùng rác</h1>
          <span className='text-muted-foreground text-sm'>({data?.totalCount ?? 0})</span>
        </div>
        <p className='text-muted-foreground text-sm'>
          {data && data.retentionDays > 0
            ? `Thiết kế nằm trong thùng rác quá ${data.retentionDays} ngày sẽ tự động bị xoá vĩnh viễn (kể cả file gốc).`
            : 'Thiết kế trong thùng rác được giữ cho tới khi quản trị viên xoá vĩnh viễn.'}
        </p>

        <AdminListToolbar placeholder='Tìm theo mã hoặc tên thiết kế...' onSearch={handleSearch} />

        <div className='overflow-hidden rounded-lg border'>
          <Table>
            <TableHeader>
              <TableRow className='bg-card hover:bg-card'>
                <TableHead className='text-muted-foreground w-20'></TableHead>
                <TableHead className='text-muted-foreground w-40'>Mã</TableHead>
                <TableHead className='text-muted-foreground'>Tên thiết kế</TableHead>
                <TableHead className='text-muted-foreground w-24'>Định dạng</TableHead>
                <TableHead className='text-muted-foreground w-28 text-right'>Dung lượng</TableHead>
                <TableHead className='text-muted-foreground w-44'>Ngày xoá</TableHead>
                <TableHead className='text-muted-foreground w-32 text-center'>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AdminTableState
                colSpan={COLUMNS}
                isLoading={isLoading}
                isError={isError}
                isEmpty={assets.length === 0}
                emptyText='Thùng rác trống'
              />
              {assets.map((asset) => (
                <TableRow key={asset.id} className='hover:bg-accent'>
                  <TableCell>
                    <Thumbnail asset={asset} />
                  </TableCell>
                  <TableCell className='font-mono text-xs'>
                    <div className='flex items-center gap-1'>
                      {asset.code ?? '—'}
                      {asset.codeConflict && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <AlertTriangle className='h-3.5 w-3.5 text-amber-500' aria-label='Trùng mã' />
                          </TooltipTrigger>
                          <TooltipContent>Mã đã được thiết kế khác sử dụng, không thể khôi phục</TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{asset.name}</TableCell>
                  <TableCell>
                    {asset.extension ? (
                      <Badge variant='outline' className='text-[10px] uppercase'>
                        {asset.extension.replace(/^\./, '')}
                      </Badge>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell className='text-muted-foreground text-right text-sm'>{formatSize(asset.size)}</TableCell>
                  <TableCell className='text-muted-foreground text-sm'>{formatDate(asset.deletedAt)}</TableCell>
                  <TableCell className='text-center'>
                    <div className='flex items-center justify-center gap-2'>
                      <Button
                        variant='ghost'
                        size='sm'
                        aria-label='Khôi phục'
                        title={asset.codeConflict ? 'Mã đã được thiết kế khác sử dụng' : 'Khôi phục'}
                        disabled={asset.codeConflict}
                        onClick={() => setRestoring(asset)}
                        className='text-primary hover:text-primary/80 hover:bg-primary/10'
                      >
                        <RotateCcw className='h-4 w-4' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        aria-label='Xoá vĩnh viễn'
                        title='Xoá vĩnh viễn'
                        onClick={() => setPurging(asset)}
                        className='text-red-400 hover:bg-red-900/20 hover:text-red-300'
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <AdminPagination page={page} pageSize={PAGE_SIZE} totalCount={data?.totalCount ?? 0} onPageChange={setPage} />
      </div>

      <ConfirmDialog
        open={!!restoring}
        onOpenChange={(open) => !open && setRestoring(null)}
        title='Khôi phục thiết kế'
        desc={`Khôi phục thiết kế "${label(restoring)}" về danh sách thiết kế?`}
        cancelBtnText='Huỷ'
        confirmText='Khôi phục'
        isLoading={restore.isPending}
        handleConfirm={confirmRestore}
      />

      <ConfirmDialog
        open={!!purging}
        onOpenChange={(open) => !open && setPurging(null)}
        title={
          <span className='text-destructive flex items-center gap-2'>
            <AlertTriangle className='h-5 w-5' /> Xoá vĩnh viễn
          </span>
        }
        desc={`Xoá vĩnh viễn thiết kế "${label(purging)}" và file gốc trên kho lưu trữ? Thao tác này không thể hoàn tác.`}
        cancelBtnText='Huỷ'
        confirmText='Xoá vĩnh viễn'
        destructive
        isLoading={purge.isPending}
        handleConfirm={confirmPurge}
      />
    </Main>
  )
}
