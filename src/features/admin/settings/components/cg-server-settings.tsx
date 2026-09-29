import { useState } from 'react'
import { Pencil, Plus, RefreshCw, TestTube, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { AdminTableState } from '../../components/admin-table-state'
import { ALL_ITEMS } from '../../api/common'
import {
  CG_SERVER_STATUS,
  type CGServer,
  useCGServers,
  useCheckCGServer,
  useDeleteCGServer,
} from '../../api/cg-servers'
import { formatDateTime } from '../../api/settings'
import { CGServerFormDialog } from './cg-server-form-dialog'

const STATUS_CLASS: Record<number, string> = {
  [CG_SERVER_STATUS.online]: 'border-green-500 text-green-400',
  [CG_SERVER_STATUS.offline]: 'border-border text-muted-foreground',
  [CG_SERVER_STATUS.maintenance]: 'border-yellow-500 text-yellow-500',
}

export function CGServerSettings() {
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<CGServer | null>(null)
  const [deleting, setDeleting] = useState<CGServer | null>(null)

  // Số CG server ít: tải toàn bộ để thống kê theo trạng thái
  const { data, isLoading, isError } = useCGServers(ALL_ITEMS)
  const servers = data?.items ?? []
  const deleteServer = useDeleteCGServer()
  const checkServer = useCheckCGServer()
  const checkingId = checkServer.isPending ? checkServer.variables : undefined

  const countBy = (statusId: number) => servers.filter((s) => s.statusId === statusId).length

  const openForm = (server: CGServer | null) => {
    setEditing(server)
    setFormOpen(true)
  }

  const confirmDelete = async () => {
    if (!deleting?.id) return
    await deleteServer.mutateAsync(deleting.id)
    setDeleting(null)
  }

  return (
    <div className='space-y-4'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-primary'>Danh sách CG Server</h2>
          <p className='text-sm text-muted-foreground mt-1'>Quản lý kết nối với các CG Server</p>
        </div>
        <Button
          className='bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2'
          onClick={() => openForm(null)}
        >
          <Plus className='w-4 h-4' />
          Thêm Server
        </Button>
      </div>

      {/* Statistics */}
      <div className='grid grid-cols-4 gap-4'>
        <div className='bg-card border border-border rounded-lg p-4'>
          <div className='text-sm text-muted-foreground'>Tổng số Server</div>
          <div className='text-2xl text-foreground mt-2'>{data?.totalCount ?? '—'}</div>
        </div>
        <div className='bg-card border border-border rounded-lg p-4'>
          <div className='text-sm text-muted-foreground'>Đang hoạt động</div>
          <div className='text-2xl text-green-400 mt-2'>{data ? countBy(CG_SERVER_STATUS.online) : '—'}</div>
        </div>
        <div className='bg-card border border-border rounded-lg p-4'>
          <div className='text-sm text-muted-foreground'>Ngắt kết nối</div>
          <div className='text-2xl text-muted-foreground mt-2'>
            {data ? countBy(CG_SERVER_STATUS.offline) : '—'}
          </div>
        </div>
        <div className='bg-card border border-border rounded-lg p-4'>
          <div className='text-sm text-muted-foreground'>Bảo trì</div>
          <div className='text-2xl text-yellow-500 mt-2'>
            {data ? countBy(CG_SERVER_STATUS.maintenance) : '—'}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className='border border-border rounded-lg overflow-hidden'>
        <Table>
          <TableHeader>
            <TableRow className='bg-card border-border hover:bg-card'>
              <TableHead className='text-muted-foreground w-16'>STT</TableHead>
              <TableHead className='text-muted-foreground'>Tên Server</TableHead>
              <TableHead className='text-muted-foreground'>Vị trí đặt Server</TableHead>
              <TableHead className='text-muted-foreground'>Địa chỉ IP</TableHead>
              <TableHead className='text-muted-foreground'>Port</TableHead>
              <TableHead className='text-muted-foreground'>Phiên bản</TableHead>
              <TableHead className='text-muted-foreground'>Trạng thái</TableHead>
              <TableHead className='text-muted-foreground'>Kiểm tra gần nhất</TableHead>
              <TableHead className='text-muted-foreground text-right'>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AdminTableState
              colSpan={9}
              isLoading={isLoading}
              isError={isError}
              isEmpty={servers.length === 0}
              emptyText='Chưa có CG server nào'
            />
            {servers.map((server, index) => (
              <TableRow key={server.id} className='border-border hover:bg-accent'>
                <TableCell className='text-muted-foreground'>{index + 1}</TableCell>
                <TableCell className='text-foreground'>
                  <div className='flex items-center gap-2'>
                    {server.serverName}
                    {server.isBackupServer && (
                      <Badge variant='outline' className='border-border text-muted-foreground text-xs'>
                        Dự phòng
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className='text-foreground'>{server.location}</TableCell>
                <TableCell className='text-foreground font-mono'>{server.ipAddress}</TableCell>
                <TableCell className='text-foreground font-mono'>{server.port ?? '—'}</TableCell>
                <TableCell className='text-foreground'>{server.version || '—'}</TableCell>
                <TableCell>
                  <Badge
                    variant='outline'
                    className={STATUS_CLASS[server.statusId ?? 0] ?? 'border-border text-muted-foreground'}
                  >
                    {server.statusName ?? '—'}
                  </Badge>
                </TableCell>
                <TableCell className='text-muted-foreground text-sm'>{formatDateTime(server.lastChecked)}</TableCell>
                <TableCell>
                  <div className='flex gap-2 justify-end'>
                    <Button
                      variant='ghost'
                      size='sm'
                      aria-label='Kiểm tra kết nối'
                      title='Kiểm tra kết nối'
                      className='text-primary hover:text-primary/80 hover:bg-accent'
                      disabled={checkingId === server.id}
                      onClick={() => server.id && checkServer.mutate(server.id)}
                    >
                      {checkingId === server.id ? (
                        <RefreshCw className='w-4 h-4 animate-spin' />
                      ) : (
                        <TestTube className='w-4 h-4' />
                      )}
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      aria-label='Sửa'
                      className='text-primary hover:text-primary/80 hover:bg-accent'
                      onClick={() => openForm(server)}
                    >
                      <Pencil className='w-4 h-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      aria-label='Xoá'
                      className='text-red-400 hover:text-red-300 hover:bg-accent'
                      onClick={() => setDeleting(server)}
                    >
                      <Trash2 className='w-4 h-4' />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <CGServerFormDialog open={formOpen} onOpenChange={setFormOpen} server={editing} />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title='Xóa Server'
        desc={`Bạn có chắc chắn muốn xóa server "${deleting?.serverName}" không? Hành động này không thể hoàn tác.`}
        cancelBtnText='Hủy'
        confirmText='Xóa Server'
        destructive
        isLoading={deleteServer.isPending}
        handleConfirm={confirmDelete}
      />
    </div>
  )
}
