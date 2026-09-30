import { useCallback, useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AdminListToolbar } from '../../components/admin-list-toolbar'
import { AdminPagination } from '../../components/admin-pagination'
import { AdminTableState } from '../../components/admin-table-state'
import {
  type NotificationTypeListItem,
  useDeleteNotificationType,
  useNotificationTypes,
} from '../../api/notification-types'
import { NotificationTypeFormDialog } from './notification-type-form-dialog'

const PAGE_SIZE = 10

/** Danh mục loại thông báo (dùng cho bước chuyển quy trình và gửi thông báo). */
export function NotificationTypesTab() {
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<NotificationTypeListItem | null>(null)
  const [deleting, setDeleting] = useState<NotificationTypeListItem | null>(null)

  const { data, isLoading, isError } = useNotificationTypes({ pageNumber: page, pageSize: PAGE_SIZE, searchTerm })
  const types = data?.notificationTypes ?? []
  const deleteType = useDeleteNotificationType()

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term)
    setPage(1)
  }, [])

  const openForm = (type: NotificationTypeListItem | null) => {
    setEditing(type)
    setFormOpen(true)
  }

  const confirmDelete = async () => {
    if (!deleting) return
    try {
      await deleteType.mutateAsync(deleting.id)
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className='space-y-4'>
      <AdminListToolbar
        placeholder='Tìm loại thông báo...'
        onSearch={handleSearch}
        addLabel='Thêm loại thông báo'
        onAdd={() => openForm(null)}
      />

      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-16'>ID</TableHead>
              <TableHead>Tên</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead className='w-44'>Bước chuyển đang dùng</TableHead>
              <TableHead className='w-24 text-right'>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AdminTableState colSpan={5} isLoading={isLoading} isError={isError} isEmpty={types.length === 0} />
            {types.map((item) => (
              <TableRow key={item.id}>
                <TableCell className='text-muted-foreground font-mono text-xs'>{item.id}</TableCell>
                <TableCell className='font-medium'>{item.name}</TableCell>
                <TableCell className='text-muted-foreground'>{item.description || '—'}</TableCell>
                <TableCell>
                  {item.transitionCount > 0 ? (
                    <Badge variant='secondary'>{item.transitionCount} bước chuyển</Badge>
                  ) : (
                    <span className='text-muted-foreground text-sm'>Chưa dùng</span>
                  )}
                </TableCell>
                <TableCell className='text-right'>
                  <Button variant='ghost' size='icon' aria-label='Sửa' onClick={() => openForm(item)}>
                    <Pencil className='h-4 w-4' />
                  </Button>
                  <Button
                    variant='ghost'
                    size='icon'
                    aria-label='Xoá'
                    disabled={item.transitionCount > 0}
                    title={item.transitionCount > 0 ? 'Đang được dùng ở bước chuyển quy trình' : undefined}
                    onClick={() => setDeleting(item)}
                  >
                    <Trash2 className='text-destructive h-4 w-4' />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AdminPagination page={page} pageSize={PAGE_SIZE} totalCount={data?.totalCount ?? 0} onPageChange={setPage} />

      <NotificationTypeFormDialog open={formOpen} onOpenChange={setFormOpen} type={editing} />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title='Xoá loại thông báo'
        desc={`Xoá loại thông báo "${deleting?.name}"? Thông báo đã gửi vẫn được giữ.`}
        cancelBtnText='Huỷ'
        confirmText='Xoá'
        destructive
        isLoading={deleteType.isPending}
        handleConfirm={confirmDelete}
      />
    </div>
  )
}
