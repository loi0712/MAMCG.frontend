import { useCallback, useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AdminListToolbar } from '../components/admin-list-toolbar'
import { AdminPagination } from '../components/admin-pagination'
import { AdminTableState } from '../components/admin-table-state'
import { type Group, useDeleteGroup, useGroups } from '../api/groups'
import { GroupFormDialog } from './components/group-form-dialog'

const PAGE_SIZE = 10

export function RoleGroupsView() {
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Group | null>(null)
  const [deleting, setDeleting] = useState<Group | null>(null)

  const { data, isLoading, isError } = useGroups({ pageNumber: page, pageSize: PAGE_SIZE, searchTerm })
  const deleteGroup = useDeleteGroup()
  const groups = data?.groups ?? []

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term)
    setPage(1)
  }, [])

  const openForm = (group: Group | null) => {
    setEditing(group)
    setFormOpen(true)
  }

  const confirmDelete = async () => {
    if (!deleting) return
    await deleteGroup.mutateAsync(deleting.id)
    setDeleting(null)
  }

  return (
    <div className='space-y-4'>
      <AdminListToolbar
        placeholder='Tìm nhóm quyền...'
        onSearch={handleSearch}
        addLabel='Thêm nhóm quyền'
        onAdd={() => openForm(null)}
      />

      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-12'>STT</TableHead>
              <TableHead>Tên nhóm</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead>Thành viên</TableHead>
              <TableHead className='w-24 text-right'>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AdminTableState colSpan={5} isLoading={isLoading} isError={isError} isEmpty={groups.length === 0} />
            {groups.map((group, index) => (
              <TableRow key={group.id}>
                <TableCell className='text-muted-foreground'>{(page - 1) * PAGE_SIZE + index + 1}</TableCell>
                <TableCell className='font-medium'>{group.name}</TableCell>
                <TableCell className='text-muted-foreground'>{group.description || '—'}</TableCell>
                <TableCell>
                  <div className='flex flex-wrap gap-1'>
                    {(group.users ?? []).slice(0, 3).map((u) => (
                      <Badge key={u.id} variant='secondary'>
                        {u.fullName}
                      </Badge>
                    ))}
                    {(group.users?.length ?? 0) > 3 && (
                      <Badge variant='outline'>+{(group.users?.length ?? 0) - 3}</Badge>
                    )}
                    {!group.users?.length && <span className='text-muted-foreground'>—</span>}
                  </div>
                </TableCell>
                <TableCell className='text-right'>
                  <Button variant='ghost' size='icon' aria-label='Sửa' onClick={() => openForm(group)}>
                    <Pencil className='h-4 w-4' />
                  </Button>
                  <Button variant='ghost' size='icon' aria-label='Xoá' onClick={() => setDeleting(group)}>
                    <Trash2 className='text-destructive h-4 w-4' />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AdminPagination page={page} pageSize={PAGE_SIZE} totalCount={data?.totalCount ?? 0} onPageChange={setPage} />

      <GroupFormDialog open={formOpen} onOpenChange={setFormOpen} group={editing} />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title='Xoá nhóm quyền'
        desc={`Xoá nhóm "${deleting?.name}"? Người dùng trong nhóm sẽ mất các quyền của nhóm.`}
        cancelBtnText='Huỷ'
        confirmText='Xoá'
        destructive
        isLoading={deleteGroup.isPending}
        handleConfirm={confirmDelete}
      />
    </div>
  )
}
