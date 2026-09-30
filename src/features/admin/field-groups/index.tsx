import { Fragment, useCallback, useState } from 'react'
import { ChevronDown, ChevronRight, Loader2, Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AdminListToolbar } from '../components/admin-list-toolbar'
import { AdminPagination } from '../components/admin-pagination'
import { AdminTableState } from '../components/admin-table-state'
import { type FieldGroupListItem, useDeleteFieldGroup, useFieldGroup, useFieldGroups } from '../api/field-groups'
import { FieldGroupFormDialog } from './components/field-group-form-dialog'

const PAGE_SIZE = 10
const COLUMNS = 7

const DATA_TYPE_STYLES: Record<string, string> = {
  text: 'border-blue-500 text-blue-400',
  textarea: 'border-purple-500 text-purple-400',
  number: 'border-green-500 text-green-400',
  date: 'border-orange-500 text-orange-400',
  datetime: 'border-orange-500 text-orange-400',
  select: 'border-primary text-primary',
  dropdown: 'border-primary text-primary',
  multiselect: 'border-pink-500 text-pink-400',
  tags: 'border-yellow-500 text-yellow-400',
}

function DataTypeBadge({ name }: { name: string | null }) {
  if (!name) return <span className='text-muted-foreground text-xs'>-</span>
  const className = DATA_TYPE_STYLES[name.toLowerCase()] ?? 'border-border text-muted-foreground'
  return (
    <Badge variant='outline' className={`${className} text-[10px]`}>
      {name}
    </Badge>
  )
}

function YesNo({ value, className }: { value: boolean; className: string }) {
  return value ? (
    <Badge variant='outline' className={`${className} text-[10px]`}>
      Có
    </Badge>
  ) : (
    <span className='text-muted-foreground text-xs'>-</span>
  )
}

// Danh sách trường của nhóm: chỉ tải chi tiết khi mở rộng hàng
function GroupFieldsRow({ groupId }: { groupId: number }) {
  const { data, isLoading, isError } = useFieldGroup(groupId)
  const fields = data?.fields ?? []

  return (
    <tr>
      <td colSpan={COLUMNS} className='p-0'>
        <div className='bg-muted border-border border-t p-4'>
          {isLoading ? (
            <div className='text-muted-foreground flex items-center gap-2 text-sm'>
              <Loader2 className='h-4 w-4 animate-spin' /> Đang tải danh sách trường...
            </div>
          ) : isError ? (
            <div className='text-destructive text-sm'>Không tải được danh sách trường.</div>
          ) : fields.length === 0 ? (
            <div className='text-muted-foreground text-sm'>Nhóm chưa có trường nào.</div>
          ) : (
            <>
              <div className='text-primary mb-2 text-xs'>Danh sách trường dữ liệu ({fields.length})</div>
              <Table>
                <TableHeader>
                  <TableRow className='border-border hover:bg-accent'>
                    <TableHead className='text-muted-foreground w-12 text-xs'>#</TableHead>
                    <TableHead className='text-muted-foreground w-48 text-xs'>Tên trường</TableHead>
                    <TableHead className='text-muted-foreground w-40 text-xs'>Mã trường</TableHead>
                    <TableHead className='text-muted-foreground w-32 text-xs'>Kiểu dữ liệu</TableHead>
                    <TableHead className='text-muted-foreground w-24 text-center text-xs'>Bắt buộc</TableHead>
                    <TableHead className='text-muted-foreground w-24 text-center text-xs'>Hệ thống</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => (
                    <TableRow key={field.id} className='border-border hover:bg-accent'>
                      <TableCell className='text-muted-foreground text-xs'>{index + 1}</TableCell>
                      <TableCell className='text-foreground text-sm'>{field.displayName}</TableCell>
                      <TableCell className='text-muted-foreground font-mono text-xs'>{field.fieldName}</TableCell>
                      <TableCell>
                        <DataTypeBadge name={field.dataTypeName} />
                      </TableCell>
                      <TableCell className='text-center'>
                        <YesNo value={field.isRequired} className='border-red-500 text-red-400' />
                      </TableCell>
                      <TableCell className='text-center'>
                        <YesNo value={field.isSystemField} className='border-green-500 text-green-400' />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
        </div>
      </td>
    </tr>
  )
}

export function FieldGroupsView() {
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [expanded, setExpanded] = useState<Set<number>>(new Set())
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState<FieldGroupListItem | null>(null)

  const { data, isLoading, isError } = useFieldGroups({ pageNumber: page, pageSize: PAGE_SIZE, searchTerm })
  const groups = data?.items ?? []
  const deleteGroup = useDeleteFieldGroup()

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term)
    setPage(1)
  }, [])

  const setExpandedFor = (id: number, open: boolean) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      if (open) next.add(id)
      else next.delete(id)
      return next
    })

  const openForm = (id: number | null) => {
    setEditingId(id)
    setFormOpen(true)
  }

  const confirmDelete = async () => {
    if (!deleting) return
    try {
      await deleteGroup.mutateAsync(deleting.id)
      setExpandedFor(deleting.id, false)
    } catch {
      // Lỗi đã được thông báo chung
    }
    setDeleting(null)
  }

  const nextOrder = Math.max(0, ...groups.map((g) => g.displayOrder)) + 1

  return (
    <div className='space-y-4'>
      <AdminListToolbar
        placeholder='Tìm kiếm nhóm trường...'
        onSearch={handleSearch}
        addLabel='Thêm nhóm trường'
        onAdd={() => openForm(null)}
      />

      <div className='border-border overflow-hidden rounded-lg border'>
        <Table>
          <TableHeader>
            <TableRow className='bg-card border-border hover:bg-card'>
              <TableHead className='text-muted-foreground w-12'></TableHead>
              <TableHead className='text-muted-foreground w-16'>Thứ tự</TableHead>
              <TableHead className='text-muted-foreground'>Tên nhóm</TableHead>
              <TableHead className='text-muted-foreground'>Mô tả</TableHead>
              <TableHead className='text-muted-foreground w-32 text-center'>Số trường</TableHead>
              <TableHead className='text-muted-foreground w-32 text-center'>Trạng thái</TableHead>
              <TableHead className='text-muted-foreground w-32 text-center'>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AdminTableState
              colSpan={COLUMNS}
              isLoading={isLoading}
              isError={isError}
              isEmpty={groups.length === 0}
              emptyText='Chưa có nhóm trường nào'
            />
            {groups.map((group) => {
              const isExpanded = expanded.has(group.id)
              return (
                <Fragment key={group.id}>
                  <TableRow className='border-border hover:bg-accent'>
                    <TableCell>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='h-auto p-0 hover:bg-transparent'
                        aria-expanded={isExpanded}
                        aria-label={isExpanded ? 'Thu gọn' : 'Xem các trường'}
                        onClick={() => setExpandedFor(group.id, !isExpanded)}
                      >
                        {isExpanded ? (
                          <ChevronDown className='text-primary h-4 w-4' />
                        ) : (
                          <ChevronRight className='text-muted-foreground h-4 w-4' />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className='text-muted-foreground'>{group.displayOrder}</TableCell>
                    <TableCell className='text-foreground'>{group.name}</TableCell>
                    <TableCell className='text-muted-foreground text-sm'>{group.description ?? '—'}</TableCell>
                    <TableCell className='text-center'>
                      <Badge
                        variant='outline'
                        className={
                          group.fieldCount > 0
                            ? 'border-primary text-primary hover:bg-primary/10 cursor-pointer'
                            : 'border-border text-muted-foreground'
                        }
                        onClick={() => setExpandedFor(group.id, !isExpanded)}
                      >
                        {group.fieldCount}
                      </Badge>
                    </TableCell>
                    <TableCell className='text-center'>
                      <Badge
                        variant='outline'
                        className={group.isActive ? 'border-green-500 text-green-400' : 'border-border text-muted-foreground'}
                      >
                        {group.isActive ? 'Hoạt động' : 'Tạm dừng'}
                      </Badge>
                    </TableCell>
                    <TableCell className='text-center'>
                      <div className='flex items-center justify-center gap-2'>
                        <Button
                          variant='ghost'
                          size='sm'
                          aria-label='Sửa'
                          onClick={() => openForm(group.id)}
                          className='text-primary hover:text-primary/80 hover:bg-primary/10'
                        >
                          <Pencil className='h-4 w-4' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          aria-label='Xoá'
                          onClick={() => setDeleting(group)}
                          className='text-red-400 hover:bg-red-900/20 hover:text-red-300'
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  {isExpanded && <GroupFieldsRow groupId={group.id} />}
                </Fragment>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <AdminPagination page={page} pageSize={PAGE_SIZE} totalCount={data?.totalCount ?? 0} onPageChange={setPage} />

      {/* Info Card */}
      <div className='bg-card border-border rounded-lg border p-4'>
        <div className='text-muted-foreground text-sm'>
          <strong className='text-primary'>Lưu ý:</strong> Nhóm trường được sử dụng để tổ chức các trường dữ liệu
          thành các nhóm logic. Click vào số lượng trường hoặc icon mũi tên để xem chi tiết các trường trong nhóm. Thứ
          tự các trường trong nhóm được điều chỉnh bằng nút lên/xuống trong hộp thoại chỉnh sửa.
        </div>
      </div>

      <FieldGroupFormDialog open={formOpen} onOpenChange={setFormOpen} groupId={editingId} nextOrder={nextOrder} />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title='Xác nhận xoá nhóm trường'
        desc={`Xoá nhóm trường "${deleting?.name}"? Các trường dữ liệu không bị xoá, chỉ gỡ khỏi nhóm.`}
        cancelBtnText='Huỷ'
        confirmText='Xoá'
        destructive
        isLoading={deleteGroup.isPending}
        handleConfirm={confirmDelete}
      />
    </div>
  )
}
