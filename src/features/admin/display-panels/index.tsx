import { useCallback, useMemo, useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AdminListToolbar } from '../components/admin-list-toolbar'
import { AdminPagination } from '../components/admin-pagination'
import { AdminTableState } from '../components/admin-table-state'
import {
  type PanelDetail,
  type PanelListItem,
  useDeletePanel,
  usePanelDetails,
  usePanels,
} from '../api/panels'
import { PanelFormDialog } from './components/panel-form-dialog'

const PAGE_SIZE = 10

export function DisplayPanelsView() {
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<PanelDetail | null>(null)
  const [deleting, setDeleting] = useState<PanelListItem | null>(null)

  const { data, isLoading, isError } = usePanels({ pageNumber: page, pageSize: PAGE_SIZE, searchTerm })
  const panels = useMemo(() => data?.panels ?? [], [data])
  const detailQueries = usePanelDetails(panels.map((p) => p.id))
  const deletePanel = useDeletePanel()

  const details = useMemo(() => {
    const map = new Map<number, PanelDetail>()
    detailQueries.forEach((q) => q.data && map.set(q.data.id, q.data))
    return map
  }, [detailQueries])

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term)
    setPage(1)
  }, [])

  const openForm = (panel: PanelDetail | null) => {
    setEditing(panel)
    setFormOpen(true)
  }

  const confirmDelete = async () => {
    if (!deleting) return
    await deletePanel.mutateAsync(deleting.id)
    setDeleting(null)
  }

  return (
    <div className='space-y-4'>
      <AdminListToolbar
        placeholder='Tìm panel...'
        onSearch={handleSearch}
        addLabel='Thêm panel'
        onAdd={() => openForm(null)}
      />

      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-16'>ID</TableHead>
              <TableHead className='w-20'>Thứ tự</TableHead>
              <TableHead>Tên panel</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead>Trường hiển thị</TableHead>
              <TableHead className='w-24 text-right'>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AdminTableState colSpan={6} isLoading={isLoading} isError={isError} isEmpty={panels.length === 0} />
            {panels.map((item) => {
              const detail = details.get(item.id)
              return (
                <TableRow key={item.id}>
                  <TableCell className='text-muted-foreground font-mono text-xs'>{item.id}</TableCell>
                  <TableCell>{detail?.index ?? ''}</TableCell>
                  <TableCell className='font-medium'>{item.panelName}</TableCell>
                  {detail ? (
                    <>
                      <TableCell className='text-muted-foreground'>{detail.description || '—'}</TableCell>
                      <TableCell>
                        <div className='flex flex-wrap gap-1'>
                          {detail.fields.slice(0, 4).map((f) => (
                            <Badge key={f.id} variant='secondary'>
                              {f.displayName}
                            </Badge>
                          ))}
                          {detail.fields.length > 4 && <Badge variant='outline'>+{detail.fields.length - 4}</Badge>}
                          {detail.fields.length === 0 && <span className='text-muted-foreground'>—</span>}
                        </div>
                      </TableCell>
                    </>
                  ) : (
                    <TableCell colSpan={2}>
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

      <PanelFormDialog open={formOpen} onOpenChange={setFormOpen} panel={editing} />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title='Xoá panel hiển thị'
        desc={`Xoá panel "${deleting?.panelName}"?`}
        cancelBtnText='Huỷ'
        confirmText='Xoá'
        destructive
        isLoading={deletePanel.isPending}
        handleConfirm={confirmDelete}
      />
    </div>
  )
}
