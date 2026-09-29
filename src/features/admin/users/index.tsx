import { useCallback, useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AdminListToolbar } from '../components/admin-list-toolbar'
import { AdminPagination } from '../components/admin-pagination'
import { AdminTableState } from '../components/admin-table-state'
import { type User, useDeleteUser, useUsers } from '../api/users'
import { UserFormDialog } from './components/user-form-dialog'

const PAGE_SIZE = 10

export function UsersView() {
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)
  const [deleting, setDeleting] = useState<User | null>(null)

  const { data, isLoading, isError } = useUsers({ pageNumber: page, pageSize: PAGE_SIZE, searchTerm })
  const deleteUser = useDeleteUser()
  const users = data?.users ?? []

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term)
    setPage(1)
  }, [])

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (user: User) => {
    setEditing(user)
    setFormOpen(true)
  }

  const confirmDelete = async () => {
    if (!deleting) return
    await deleteUser.mutateAsync(deleting.id)
    setDeleting(null)
  }

  return (
    <div className='space-y-4'>
      <AdminListToolbar
        placeholder='Tìm theo tên, tên đăng nhập, email...'
        onSearch={handleSearch}
        addLabel='Thêm người dùng'
        onAdd={openCreate}
      />

      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-12'>STT</TableHead>
              <TableHead>Họ tên</TableHead>
              <TableHead>Tên đăng nhập</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phòng ban</TableHead>
              <TableHead>Chức vụ</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className='w-24 text-right'>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AdminTableState colSpan={8} isLoading={isLoading} isError={isError} isEmpty={users.length === 0} />
            {users.map((user, index) => (
              <TableRow key={user.id}>
                <TableCell className='text-muted-foreground'>{(page - 1) * PAGE_SIZE + index + 1}</TableCell>
                <TableCell className='font-medium'>{user.fullName}</TableCell>
                <TableCell className='font-mono text-sm'>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.department?.name ?? '—'}</TableCell>
                <TableCell>{user.position?.name ?? '—'}</TableCell>
                <TableCell>
                  <Badge variant={user.isActive ? 'default' : 'secondary'}>
                    {user.isActive ? 'Hoạt động' : 'Ngừng hoạt động'}
                  </Badge>
                </TableCell>
                <TableCell className='text-right'>
                  <Button variant='ghost' size='icon' aria-label='Sửa' onClick={() => openEdit(user)}>
                    <Pencil className='h-4 w-4' />
                  </Button>
                  <Button variant='ghost' size='icon' aria-label='Xoá' onClick={() => setDeleting(user)}>
                    <Trash2 className='text-destructive h-4 w-4' />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AdminPagination page={page} pageSize={PAGE_SIZE} totalCount={data?.totalCount ?? 0} onPageChange={setPage} />

      <UserFormDialog open={formOpen} onOpenChange={setFormOpen} user={editing} />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title='Xoá người dùng'
        desc={`Xoá người dùng "${deleting?.fullName ?? deleting?.username}"?`}
        cancelBtnText='Huỷ'
        confirmText='Xoá'
        destructive
        isLoading={deleteUser.isPending}
        handleConfirm={confirmDelete}
      />
    </div>
  )
}
