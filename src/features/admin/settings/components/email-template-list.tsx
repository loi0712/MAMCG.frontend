import { useCallback, useState } from 'react'
import { Pencil, RotateCcw, Send, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { AdminListToolbar } from '../../components/admin-list-toolbar'
import { AdminPagination } from '../../components/admin-pagination'
import { AdminTableState } from '../../components/admin-table-state'
import {
  type EmailTemplate,
  useDeleteEmailTemplate,
  useEmailTemplates,
  useResetEmailTemplate,
  useUpdateEmailTemplate,
} from '../../api/email-templates'
import { formatDateTime } from '../../api/settings'
import { EmailTemplateEditorDialog } from './email-template-editor-dialog'
import { EmailTemplateTestDialog } from './email-template-test-dialog'

const PAGE_SIZE = 20

export function EmailTemplateList() {
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [editorOpen, setEditorOpen] = useState(false)
  const [editing, setEditing] = useState<EmailTemplate | null>(null)
  const [testing, setTesting] = useState<EmailTemplate | null>(null)
  const [resetting, setResetting] = useState<EmailTemplate | null>(null)
  const [deleting, setDeleting] = useState<EmailTemplate | null>(null)

  const { data, isLoading, isError } = useEmailTemplates({ pageNumber: page, pageSize: PAGE_SIZE, searchTerm })
  const templates = data?.items ?? []
  const updateTemplate = useUpdateEmailTemplate()
  const resetTemplate = useResetEmailTemplate()
  const deleteTemplate = useDeleteEmailTemplate()
  const togglingId = updateTemplate.isPending ? updateTemplate.variables?.id : undefined

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term)
    setPage(1)
  }, [])

  const openEditor = (template: EmailTemplate | null) => {
    setEditing(template)
    setEditorOpen(true)
  }

  // Bật/tắt nhanh: gửi lại toàn bộ nội dung mẫu với isActive mới
  const toggleActive = (t: EmailTemplate, isActive: boolean) => {
    if (!t.id) return
    updateTemplate.mutate({
      id: t.id,
      data: {
        code: t.code,
        name: t.name,
        subject: t.subject,
        body: t.body,
        isHtml: t.isHtml,
        description: t.description,
        isActive,
      },
    })
  }

  const confirmReset = async () => {
    if (!resetting?.id) return
    await resetTemplate.mutateAsync(resetting.id)
    setResetting(null)
  }

  const confirmDelete = async () => {
    if (!deleting?.id) return
    await deleteTemplate.mutateAsync(deleting.id)
    setDeleting(null)
  }

  return (
    <div className='space-y-4'>
      <div>
        <h2 className='text-primary'>Mẫu email</h2>
        <p className='text-sm text-muted-foreground mt-1'>
          Nội dung email gửi khi có sự kiện hệ thống. Mẫu hệ thống có thể sửa, tắt hoặc khôi phục mặc định nhưng không
          xoá được; mẫu bị tắt thì sự kiện dùng nội dung mặc định.
        </p>
      </div>

      <AdminListToolbar
        placeholder='Tìm theo mã, tên, tiêu đề...'
        onSearch={handleSearch}
        addLabel='Thêm mẫu'
        onAdd={() => openEditor(null)}
      />

      <div className='border border-border rounded-lg overflow-hidden'>
        <Table>
          <TableHeader>
            <TableRow className='bg-card border-border hover:bg-card'>
              <TableHead className='text-muted-foreground'>Mã</TableHead>
              <TableHead className='text-muted-foreground'>Tên mẫu</TableHead>
              <TableHead className='text-muted-foreground'>Sự kiện</TableHead>
              <TableHead className='text-muted-foreground'>Tiêu đề</TableHead>
              <TableHead className='text-muted-foreground w-24'>Kích hoạt</TableHead>
              <TableHead className='text-muted-foreground'>Cập nhật</TableHead>
              <TableHead className='text-muted-foreground text-right'>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AdminTableState
              colSpan={7}
              isLoading={isLoading}
              isError={isError}
              isEmpty={templates.length === 0}
              emptyText='Chưa có mẫu email nào'
            />
            {templates.map((t) => (
              <TableRow key={t.id} className='border-border hover:bg-accent'>
                <TableCell className='text-foreground font-mono text-xs'>
                  <div className='flex items-center gap-2'>
                    {t.code}
                    {t.isSystem && (
                      <Badge variant='outline' className='border-primary/50 text-primary text-[10px]'>
                        Hệ thống
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className='text-foreground'>{t.name}</TableCell>
                <TableCell className='text-muted-foreground text-sm'>{t.eventName || '—'}</TableCell>
                <TableCell className='text-muted-foreground max-w-xs truncate text-sm' title={t.subject ?? ''}>
                  {t.subject}
                </TableCell>
                <TableCell>
                  <Switch
                    checked={t.isActive ?? false}
                    disabled={togglingId === t.id}
                    onCheckedChange={(v) => toggleActive(t, v)}
                    aria-label='Kích hoạt'
                    className='data-[state=checked]:bg-primary'
                  />
                </TableCell>
                <TableCell className='text-muted-foreground text-sm'>{formatDateTime(t.modifiedAt)}</TableCell>
                <TableCell>
                  <div className='flex gap-1 justify-end'>
                    <Button
                      variant='ghost'
                      size='sm'
                      aria-label='Gửi thử'
                      title='Gửi thử'
                      className='text-primary hover:text-primary/80 hover:bg-accent'
                      onClick={() => setTesting(t)}
                    >
                      <Send className='w-4 h-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      aria-label='Sửa'
                      title='Sửa'
                      className='text-primary hover:text-primary/80 hover:bg-accent'
                      onClick={() => openEditor(t)}
                    >
                      <Pencil className='w-4 h-4' />
                    </Button>
                    {t.isSystem ? (
                      <Button
                        variant='ghost'
                        size='sm'
                        aria-label='Khôi phục mặc định'
                        title='Khôi phục mặc định'
                        className='text-yellow-500 hover:text-yellow-400 hover:bg-accent'
                        onClick={() => setResetting(t)}
                      >
                        <RotateCcw className='w-4 h-4' />
                      </Button>
                    ) : (
                      <Button
                        variant='ghost'
                        size='sm'
                        aria-label='Xoá'
                        title='Xoá'
                        className='text-red-400 hover:text-red-300 hover:bg-accent'
                        onClick={() => setDeleting(t)}
                      >
                        <Trash2 className='w-4 h-4' />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AdminPagination page={page} pageSize={PAGE_SIZE} totalCount={data?.totalCount ?? 0} onPageChange={setPage} />

      <EmailTemplateEditorDialog open={editorOpen} onOpenChange={setEditorOpen} template={editing} />

      <EmailTemplateTestDialog open={!!testing} onOpenChange={(open) => !open && setTesting(null)} template={testing} />

      <ConfirmDialog
        open={!!resetting}
        onOpenChange={(open) => !open && setResetting(null)}
        title='Khôi phục mẫu mặc định'
        desc={`Tiêu đề và nội dung của mẫu "${resetting?.name}" sẽ được thay bằng nội dung mặc định. Tiếp tục?`}
        cancelBtnText='Hủy'
        confirmText='Khôi phục'
        isLoading={resetTemplate.isPending}
        handleConfirm={confirmReset}
      />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title='Xóa mẫu email'
        desc={`Bạn có chắc chắn muốn xóa mẫu "${deleting?.name}" không? Hành động này không thể hoàn tác.`}
        cancelBtnText='Hủy'
        confirmText='Xóa mẫu'
        destructive
        isLoading={deleteTemplate.isPending}
        handleConfirm={confirmDelete}
      />
    </div>
  )
}
