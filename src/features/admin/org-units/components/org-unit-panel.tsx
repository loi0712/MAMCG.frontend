import { useCallback, useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AdminListToolbar } from '../../components/admin-list-toolbar'
import { AdminPagination } from '../../components/admin-pagination'
import { AdminTableState } from '../../components/admin-table-state'
import { type PagedParams } from '../../api/common'
import { type OrgUnitRequest } from '../../api/lookups'
import { OrgUnitFormDialog } from './org-unit-form-dialog'

const PAGE_SIZE = 10

export interface OrgUnit {
  id: number
  name: string
  description: string | null
  userCount?: number | null
}

type MutationLike<TVariables> = {
  mutateAsync: (variables: TVariables) => Promise<unknown>
  isPending: boolean
}

type OrgUnitPanelProps = {
  title: string
  // "phòng ban" | "chức vụ"
  label: string
  useList: (params: PagedParams) => { data?: { items: OrgUnit[]; totalCount: number }; isLoading: boolean; isError: boolean }
  create: MutationLike<OrgUnitRequest>
  update: MutationLike<{ id: number; data: OrgUnitRequest }>
  remove: MutationLike<number>
}

// Bảng quản trị phòng ban hoặc chức vụ: tìm kiếm, thêm, sửa, xoá (máy chủ chặn xoá khi còn người dùng)
export function OrgUnitPanel({ title, label, useList, create, update, remove }: OrgUnitPanelProps) {
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<OrgUnit | null>(null)
  const [deleting, setDeleting] = useState<OrgUnit | null>(null)

  const { data, isLoading, isError } = useList({ pageNumber: page, pageSize: PAGE_SIZE, searchTerm })
  const items = data?.items ?? []

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term)
    setPage(1)
  }, [])

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const inUse = (deleting?.userCount ?? 0) > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <AdminListToolbar
          placeholder={`Tìm ${label}...`}
          onSearch={handleSearch}
          addLabel={`Thêm ${label}`}
          onAdd={openCreate}
        />
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-12'>STT</TableHead>
                <TableHead>Tên</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead className='w-28 text-center'>Người dùng</TableHead>
                <TableHead className='w-24 text-right'>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AdminTableState colSpan={5} isLoading={isLoading} isError={isError} isEmpty={items.length === 0} />
              {items.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell className='text-muted-foreground'>{(page - 1) * PAGE_SIZE + index + 1}</TableCell>
                  <TableCell className='font-medium'>{item.name}</TableCell>
                  <TableCell className='text-muted-foreground max-w-64 truncate' title={item.description ?? undefined}>
                    {item.description || '—'}
                  </TableCell>
                  <TableCell className='text-center'>
                    <Badge variant={item.userCount ? 'secondary' : 'outline'}>{item.userCount ?? 0}</Badge>
                  </TableCell>
                  <TableCell className='text-right'>
                    <Button
                      variant='ghost'
                      size='icon'
                      aria-label='Sửa'
                      onClick={() => {
                        setEditing(item)
                        setFormOpen(true)
                      }}
                    >
                      <Pencil className='h-4 w-4' />
                    </Button>
                    <Button variant='ghost' size='icon' aria-label='Xoá' onClick={() => setDeleting(item)}>
                      <Trash2 className='text-destructive h-4 w-4' />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <AdminPagination page={page} pageSize={PAGE_SIZE} totalCount={data?.totalCount ?? 0} onPageChange={setPage} />
      </CardContent>

      <OrgUnitFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        label={label}
        item={editing}
        isPending={create.isPending || update.isPending}
        onSubmit={(data) => (editing ? update.mutateAsync({ id: editing.id, data }) : create.mutateAsync(data))}
      />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Xoá ${label}`}
        desc={
          inUse
            ? `"${deleting?.name}" đang có ${deleting?.userCount} người dùng nên không xoá được. Hãy chuyển họ sang ${label} khác trước.`
            : `Xoá ${label} "${deleting?.name}"?`
        }
        cancelBtnText={inUse ? 'Đóng' : 'Huỷ'}
        confirmText='Xoá'
        destructive
        disabled={inUse}
        isLoading={remove.isPending}
        handleConfirm={async () => {
          if (!deleting) return
          try {
            await remove.mutateAsync(deleting.id)
            setDeleting(null)
          } catch {
            // 409 (đang có người dùng) đã được báo qua toast
          }
        }}
      />
    </Card>
  )
}
