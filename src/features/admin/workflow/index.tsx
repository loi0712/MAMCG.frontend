import { useCallback, useState } from 'react'
import { Copy, Pencil, Settings2, Trash2, Workflow as WorkflowIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AdminListToolbar } from '../components/admin-list-toolbar'
import { AdminPagination } from '../components/admin-pagination'
import { AdminTableState } from '../components/admin-table-state'
import {
  type WorkflowListItem,
  useCloneWorkflow,
  useDeleteWorkflow,
  useUpdateWorkflow,
  useWorkflows,
} from '../api/workflows'
import { WorkflowFormDialog } from './components/workflow-form-dialog'

const PAGE_SIZE = 10
const COLUMNS = 8

const formatDate = (value: string) => {
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('vi-VN')
}

interface WorkflowViewProps {
  onEditWorkflow?: (workflowId: string) => void
}

function StatCard({ label, value, className }: { label: string; value: number | undefined; className: string }) {
  return (
    <div className='bg-card border-border rounded-lg border p-4'>
      <div className='text-muted-foreground text-sm'>{label}</div>
      <div className={`mt-2 text-2xl ${className}`}>{value ?? '—'}</div>
    </div>
  )
}

export function WorkflowView({ onEditWorkflow }: WorkflowViewProps) {
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<WorkflowListItem | null>(null)
  const [deleting, setDeleting] = useState<WorkflowListItem | null>(null)

  const { data, isLoading, isError } = useWorkflows({ pageNumber: page, pageSize: PAGE_SIZE, searchTerm })
  const workflows = data?.items ?? []
  // Thống kê theo toàn bộ quy trình (không phụ thuộc ô tìm kiếm)
  const { data: allData } = useWorkflows({ pageNumber: 1, pageSize: 1 })
  const { data: activeData } = useWorkflows({ pageNumber: 1, pageSize: 1, isActive: true })
  const { data: inactiveData } = useWorkflows({ pageNumber: 1, pageSize: 1, isActive: false })

  const updateWorkflow = useUpdateWorkflow()
  const cloneWorkflow = useCloneWorkflow()
  const deleteWorkflow = useDeleteWorkflow()

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term)
    setPage(1)
  }, [])

  const openForm = (workflow: WorkflowListItem | null) => {
    setEditing(workflow)
    setFormOpen(true)
  }

  const toggleActive = (wf: WorkflowListItem, isActive: boolean) =>
    updateWorkflow.mutate({ id: wf.id, data: { name: wf.name, description: wf.description, isActive } })

  const confirmDelete = async () => {
    if (!deleting) return
    try {
      await deleteWorkflow.mutateAsync(deleting.id)
    } catch {
      // 409 (còn nội dung đang xử lý) đã được thông báo chung
    }
    setDeleting(null)
  }

  return (
    <div className='space-y-4'>
      <AdminListToolbar
        placeholder='Tìm kiếm workflow...'
        onSearch={handleSearch}
        addLabel='Tạo workflow mới'
        onAdd={() => openForm(null)}
      />

      {/* Statistics */}
      <div className='grid grid-cols-3 gap-4'>
        <StatCard label='Tổng workflow' value={allData?.totalCount} className='text-foreground' />
        <StatCard label='Đang hoạt động' value={activeData?.totalCount} className='text-green-400' />
        <StatCard label='Tạm dừng' value={inactiveData?.totalCount} className='text-muted-foreground' />
      </div>

      {/* Workflows Table */}
      <div className='border-border bg-card overflow-hidden rounded-lg border'>
        <ScrollArea className='w-full'>
          <div className='min-w-[1100px]'>
            <Table>
              <TableHeader>
                <TableRow className='bg-card border-border hover:bg-card'>
                  <TableHead className='text-muted-foreground w-12'>STT</TableHead>
                  <TableHead className='text-muted-foreground min-w-[200px]'>Tên workflow</TableHead>
                  <TableHead className='text-muted-foreground min-w-[260px]'>Mô tả</TableHead>
                  <TableHead className='text-muted-foreground w-28 text-center'>Trạng thái / Bước chuyển</TableHead>
                  <TableHead className='text-muted-foreground w-28 text-center'>Nội dung đang xử lý</TableHead>
                  <TableHead className='text-muted-foreground w-36 text-center'>Kích hoạt</TableHead>
                  <TableHead className='text-muted-foreground w-28'>Cập nhật</TableHead>
                  <TableHead className='text-muted-foreground w-44 text-center'>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AdminTableState
                  colSpan={COLUMNS}
                  isLoading={isLoading}
                  isError={isError}
                  isEmpty={workflows.length === 0}
                  emptyText='Chưa có workflow nào'
                />
                {workflows.map((workflow, index) => (
                  <TableRow key={workflow.id} className='border-border hover:bg-accent'>
                    <TableCell className='text-muted-foreground'>{(page - 1) * PAGE_SIZE + index + 1}</TableCell>
                    <TableCell>
                      <div className='text-foreground'>{workflow.name}</div>
                      <div className='text-muted-foreground mt-1 text-xs'>Tạo: {formatDate(workflow.createdAt)}</div>
                    </TableCell>
                    <TableCell className='text-muted-foreground text-sm'>{workflow.description ?? '—'}</TableCell>
                    <TableCell className='text-center'>
                      <Badge variant='outline' className='border-primary text-primary'>
                        {workflow.statusCount} / {workflow.transitionCount}
                      </Badge>
                    </TableCell>
                    <TableCell className='text-center'>
                      <Badge
                        variant='outline'
                        className={
                          workflow.activeItemCount > 0 ? 'border-yellow-500 text-yellow-400' : 'border-border text-muted-foreground'
                        }
                      >
                        {workflow.activeItemCount}
                      </Badge>
                    </TableCell>
                    <TableCell className='text-center'>
                      <div className='flex items-center justify-center gap-2'>
                        <Switch
                          checked={workflow.isActive}
                          disabled={updateWorkflow.isPending}
                          onCheckedChange={(v) => toggleActive(workflow, v)}
                          aria-label='Kích hoạt'
                        />
                        <Badge
                          variant='outline'
                          className={
                            workflow.isActive ? 'border-green-500 text-green-400' : 'border-border text-muted-foreground'
                          }
                        >
                          {workflow.isActive ? 'Hoạt động' : 'Tạm dừng'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className='text-muted-foreground text-xs'>{formatDate(workflow.modifiedAt)}</TableCell>
                    <TableCell className='text-center'>
                      <div className='flex items-center justify-center gap-1'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => onEditWorkflow?.(String(workflow.id))}
                          title='Thiết kế sơ đồ'
                          className='text-green-400 hover:bg-green-900/20 hover:text-green-300'
                        >
                          <WorkflowIcon className='h-4 w-4' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => openForm(workflow)}
                          title='Sửa thông tin'
                          className='text-primary hover:text-primary/80 hover:bg-primary/10'
                        >
                          <Pencil className='h-4 w-4' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => cloneWorkflow.mutate({ id: workflow.id })}
                          disabled={cloneWorkflow.isPending}
                          title='Nhân bản'
                          className='text-blue-400 hover:bg-blue-900/20 hover:text-blue-300'
                        >
                          <Copy className='h-4 w-4' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => setDeleting(workflow)}
                          title='Xoá'
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
          <ScrollBar orientation='horizontal' />
        </ScrollArea>
      </div>

      <AdminPagination page={page} pageSize={PAGE_SIZE} totalCount={data?.totalCount ?? 0} onPageChange={setPage} />

      {/* Info Card */}
      <div className='bg-card border-border rounded-lg border p-4'>
        <div className='text-muted-foreground flex gap-2 text-sm'>
          <Settings2 className='text-primary mt-0.5 h-4 w-4 shrink-0' />
          <div>
            <strong className='text-primary'>Lưu ý:</strong> Workflow định nghĩa các trạng thái của nội dung và bước
            chuyển giữa chúng (hành động, người được giao, thời hạn). Mở sơ đồ để thiết kế. Bản sao tạo ra ở trạng thái
            tạm dừng; không thể xoá workflow còn nội dung đang xử lý — hãy tắt kích hoạt thay vì xoá.
          </div>
        </div>
      </div>

      <WorkflowFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        workflow={editing}
        onCreated={(created) => onEditWorkflow?.(String(created.id))}
      />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title='Xoá workflow'
        desc={`Xoá workflow "${deleting?.name}"? Các trạng thái và bước chuyển của workflow cũng bị xoá.`}
        cancelBtnText='Huỷ'
        confirmText='Xoá'
        destructive
        isLoading={deleteWorkflow.isPending}
        handleConfirm={confirmDelete}
      />
    </div>
  )
}
