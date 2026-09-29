import { useCallback, useMemo, useState } from 'react'
import { Check, Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AdminListToolbar } from '../components/admin-list-toolbar'
import { AdminPagination } from '../components/admin-pagination'
import { AdminTableState } from '../components/admin-table-state'
import {
  type FieldDetail,
  type FieldListItem,
  useDataTypes,
  useDeleteField,
  useFieldDetails,
  useFields,
} from '../api/fields'
import { FieldFormDialog } from './components/field-form-dialog'

const PAGE_SIZE = 10

export function DataFieldsView() {
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<FieldDetail | null>(null)
  const [deleting, setDeleting] = useState<FieldListItem | null>(null)

  const { data, isLoading, isError } = useFields({ pageNumber: page, pageSize: PAGE_SIZE, searchTerm })
  const fields = useMemo(() => data?.fields ?? [], [data])
  const detailQueries = useFieldDetails(fields.map((f) => f.id))
  const deleteField = useDeleteField()

  const details = useMemo(() => {
    const map = new Map<number, FieldDetail>()
    detailQueries.forEach((q) => q.data && map.set(q.data.id, q.data))
    return map
  }, [detailQueries])

  const { data: dataTypeList } = useDataTypes()
  const dataTypes = useMemo(
    () => [...(dataTypeList ?? [])].sort((a, b) => a.name.localeCompare(b.name)),
    [dataTypeList]
  )

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term)
    setPage(1)
  }, [])

  const openForm = (field: FieldDetail | null) => {
    setEditing(field)
    setFormOpen(true)
  }

  const confirmDelete = async () => {
    if (!deleting) return
    await deleteField.mutateAsync(deleting.id)
    setDeleting(null)
  }

  return (
    <div className='space-y-4'>
      <AdminListToolbar
        placeholder='Tìm trường dữ liệu...'
        onSearch={handleSearch}
        addLabel='Thêm trường'
        onAdd={() => openForm(null)}
      />

      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-16'>ID</TableHead>
              <TableHead>Tên hiển thị</TableHead>
              <TableHead>Mã trường</TableHead>
              <TableHead>Kiểu dữ liệu</TableHead>
              <TableHead className='text-center'>Bắt buộc</TableHead>
              <TableHead className='text-center'>Cho phép sửa</TableHead>
              <TableHead className='w-24 text-right'>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AdminTableState colSpan={7} isLoading={isLoading} isError={isError} isEmpty={fields.length === 0} />
            {fields.map((item) => {
              const detail = details.get(item.id)
              return (
                <TableRow key={item.id}>
                  <TableCell className='text-muted-foreground font-mono text-xs'>{item.id}</TableCell>
                  <TableCell className='font-medium'>{detail?.displayName ?? item.name}</TableCell>
                  {detail ? (
                    <>
                      <TableCell className='font-mono text-sm'>{detail.fieldName}</TableCell>
                      <TableCell>
                        {detail.dataType ? <Badge variant='outline'>{detail.dataType.name}</Badge> : '—'}
                      </TableCell>
                      <TableCell className='text-center'>
                        {detail.isRequired && <Check className='mx-auto h-4 w-4' aria-label='Có' />}
                      </TableCell>
                      <TableCell className='text-center'>
                        {detail.editable && <Check className='mx-auto h-4 w-4' aria-label='Có' />}
                      </TableCell>
                    </>
                  ) : (
                    <TableCell colSpan={4}>
                      <Skeleton className='h-4 w-2/3' />
                    </TableCell>
                  )}
                  <TableCell className='text-right'>
                    <Button
                      variant='ghost'
                      size='icon'
                      aria-label='Sửa'
                      disabled={!detail}
                      onClick={() => detail && openForm(detail)}
                    >
                      <Pencil className='h-4 w-4' />
                    </Button>
                    <Button variant='ghost' size='icon' aria-label='Xoá' onClick={() => setDeleting(item)}>
                      <Trash2 className='text-destructive h-4 w-4' />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <AdminPagination page={page} pageSize={PAGE_SIZE} totalCount={data?.totalCount ?? 0} onPageChange={setPage} />

      <FieldFormDialog open={formOpen} onOpenChange={setFormOpen} field={editing} dataTypes={dataTypes} />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title='Xoá trường dữ liệu'
        desc={`Xoá trường "${deleting?.name}"? Trường sẽ bị gỡ khỏi các panel hiển thị.`}
        cancelBtnText='Huỷ'
        confirmText='Xoá'
        destructive
        isLoading={deleteField.isPending}
        handleConfirm={confirmDelete}
      />
    </div>
  )
}
