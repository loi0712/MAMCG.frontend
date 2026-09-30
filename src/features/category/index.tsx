import { useCallback, useState } from 'react'
import { FolderTree, Pencil, Tags, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Main } from '@/components/layout/Main'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AdminListToolbar } from '@/features/admin/components/admin-list-toolbar'
import { AdminPagination } from '@/features/admin/components/admin-pagination'
import { AdminTableState } from '@/features/admin/components/admin-table-state'
import {
  type CategoryGroupListItem,
  type CategoryListItem,
  useCategoryGroupList,
  useCategoryList,
  useDeleteCategory,
  useDeleteCategoryGroup,
} from './api/manage'
import { CategoryFormDialog } from './components/category-form-dialog'
import { CategoryGroupFormDialog } from './components/category-group-form-dialog'

const PAGE_SIZE = 10

function CategoriesTab() {
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [groupId, setGroupId] = useState<number | undefined>(undefined)
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState<CategoryListItem | null>(null)

  const { data, isLoading, isError } = useCategoryList({ pageNumber: page, pageSize: PAGE_SIZE, groupId, searchTerm })
  const groups = useCategoryGroupList({ pageNumber: 1, pageSize: 200 })
  const deleteCategory = useDeleteCategory()
  const categories = data?.categories ?? []

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term)
    setPage(1)
  }, [])

  const openForm = (id: number | null) => {
    setEditingId(id)
    setFormOpen(true)
  }

  const confirmDelete = async () => {
    if (!deleting) return
    try {
      await deleteCategory.mutateAsync(deleting.id)
    } catch {
      // Đang được dùng (409) → thông báo chung hiển thị lý do
    }
    setDeleting(null)
  }

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-center gap-3'>
        <div className='min-w-0 flex-1'>
          <AdminListToolbar
            placeholder='Tìm theo tên, mã, mô tả...'
            onSearch={handleSearch}
            addLabel='Thêm chuyên mục'
            onAdd={() => openForm(null)}
          />
        </div>
        <Select
          value={groupId ? String(groupId) : 'all'}
          onValueChange={(v) => {
            setGroupId(v === 'all' ? undefined : Number(v))
            setPage(1)
          }}
        >
          <SelectTrigger className='w-56' aria-label='Lọc theo nhóm'>
            <SelectValue placeholder='Tất cả nhóm' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>Tất cả nhóm</SelectItem>
            {(groups.data?.categoryGroups ?? []).map((g) => (
              <SelectItem key={g.id} value={String(g.id)}>
                {g.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className='overflow-hidden rounded-lg border'>
        <Table>
          <TableHeader>
            <TableRow className='bg-card hover:bg-card'>
              <TableHead className='text-muted-foreground w-32'>Mã</TableHead>
              <TableHead className='text-muted-foreground'>Tên chuyên mục</TableHead>
              <TableHead className='text-muted-foreground w-56'>Nhóm</TableHead>
              <TableHead className='text-muted-foreground'>Mô tả</TableHead>
              <TableHead className='text-muted-foreground w-28 text-center'>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AdminTableState
              colSpan={5}
              isLoading={isLoading}
              isError={isError}
              isEmpty={categories.length === 0}
              emptyText='Chưa có chuyên mục nào'
            />
            {categories.map((c) => (
              <TableRow key={c.id} className='hover:bg-accent'>
                <TableCell>
                  <Badge variant='outline' className='font-mono text-xs'>
                    {c.code ?? '—'}
                  </Badge>
                </TableCell>
                <TableCell>{c.name}</TableCell>
                <TableCell className='text-muted-foreground text-sm'>{c.groupName ?? '—'}</TableCell>
                <TableCell className='text-muted-foreground text-sm'>{c.description || '—'}</TableCell>
                <TableCell className='text-center'>
                  <div className='flex items-center justify-center gap-2'>
                    <Button
                      variant='ghost'
                      size='sm'
                      aria-label='Sửa'
                      onClick={() => openForm(c.id)}
                      className='text-primary hover:text-primary/80 hover:bg-primary/10'
                    >
                      <Pencil className='h-4 w-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      aria-label='Xoá'
                      onClick={() => setDeleting(c)}
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

      <CategoryFormDialog open={formOpen} onOpenChange={setFormOpen} categoryId={editingId} defaultGroupId={groupId} />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title='Xác nhận xoá chuyên mục'
        desc={`Xoá chuyên mục "${deleting?.name}"? Chuyên mục đang được thiết kế, CG scene hoặc thư mục thông minh sử dụng sẽ không xoá được.`}
        cancelBtnText='Huỷ'
        confirmText='Xoá'
        destructive
        isLoading={deleteCategory.isPending}
        handleConfirm={confirmDelete}
      />
    </div>
  )
}

function CategoryGroupsTab() {
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<CategoryGroupListItem | null>(null)
  const [deleting, setDeleting] = useState<CategoryGroupListItem | null>(null)

  const { data, isLoading, isError } = useCategoryGroupList({ pageNumber: page, pageSize: PAGE_SIZE, searchTerm })
  const deleteGroup = useDeleteCategoryGroup()
  const groups = data?.categoryGroups ?? []

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term)
    setPage(1)
  }, [])

  const openForm = (group: CategoryGroupListItem | null) => {
    setEditing(group)
    setFormOpen(true)
  }

  const confirmDelete = async () => {
    if (!deleting) return
    try {
      await deleteGroup.mutateAsync(deleting.id)
    } catch {
      // Đang được dùng (409) → thông báo chung hiển thị lý do
    }
    setDeleting(null)
  }

  return (
    <div className='space-y-4'>
      <AdminListToolbar
        placeholder='Tìm nhóm chuyên mục...'
        onSearch={handleSearch}
        addLabel='Thêm nhóm'
        onAdd={() => openForm(null)}
      />

      <div className='overflow-hidden rounded-lg border'>
        <Table>
          <TableHeader>
            <TableRow className='bg-card hover:bg-card'>
              <TableHead className='text-muted-foreground'>Tên nhóm</TableHead>
              <TableHead className='text-muted-foreground'>Mô tả</TableHead>
              <TableHead className='text-muted-foreground w-36 text-center'>Số chuyên mục</TableHead>
              <TableHead className='text-muted-foreground w-28 text-center'>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AdminTableState
              colSpan={4}
              isLoading={isLoading}
              isError={isError}
              isEmpty={groups.length === 0}
              emptyText='Chưa có nhóm chuyên mục nào'
            />
            {groups.map((g) => (
              <TableRow key={g.id} className='hover:bg-accent'>
                <TableCell>{g.name}</TableCell>
                <TableCell className='text-muted-foreground text-sm'>{g.description || '—'}</TableCell>
                <TableCell className='text-center'>
                  <Badge variant='outline' className={g.categoryCount > 0 ? 'border-primary text-primary' : ''}>
                    {g.categoryCount}
                  </Badge>
                </TableCell>
                <TableCell className='text-center'>
                  <div className='flex items-center justify-center gap-2'>
                    <Button
                      variant='ghost'
                      size='sm'
                      aria-label='Sửa'
                      onClick={() => openForm(g)}
                      className='text-primary hover:text-primary/80 hover:bg-primary/10'
                    >
                      <Pencil className='h-4 w-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      aria-label='Xoá'
                      onClick={() => setDeleting(g)}
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

      <CategoryGroupFormDialog open={formOpen} onOpenChange={setFormOpen} group={editing} />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title='Xác nhận xoá nhóm chuyên mục'
        desc={`Xoá nhóm "${deleting?.name}"? Nhóm còn chuyên mục hoặc đang được thiết kế sử dụng sẽ không xoá được.`}
        cancelBtnText='Huỷ'
        confirmText='Xoá'
        destructive
        isLoading={deleteGroup.isPending}
        handleConfirm={confirmDelete}
      />
    </div>
  )
}

export function CategoryPage() {
  return (
    <Main>
      <div className='space-y-4 py-2'>
        <h1 className='text-lg font-semibold'>Quản lý chuyên mục</h1>
        <Tabs defaultValue='categories'>
          <TabsList>
            <TabsTrigger value='categories'>
              <Tags className='h-4 w-4' /> Chuyên mục
            </TabsTrigger>
            <TabsTrigger value='groups'>
              <FolderTree className='h-4 w-4' /> Nhóm chuyên mục
            </TabsTrigger>
          </TabsList>
          <TabsContent value='categories' className='pt-2'>
            <CategoriesTab />
          </TabsContent>
          <TabsContent value='groups' className='pt-2'>
            <CategoryGroupsTab />
          </TabsContent>
        </Tabs>
      </div>
    </Main>
  )
}
