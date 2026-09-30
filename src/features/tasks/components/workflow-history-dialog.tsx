import { useEffect, useMemo, useState } from 'react'
import { AxiosError } from 'axios'
import { ArrowRight, Clock, GitCompare, History, Loader2, ShieldAlert } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/shared/lib/utils'
import { getServerErrorMessage } from '@/utils/handle-server-error'
import {
  type WorkflowHistoryEntry,
  useWorkflowItemHistory,
  useWorkflowItemVersion,
  useWorkflowItemVersions,
} from '../api/tasks'
import { type DiffKind, diffSnapshots, parseSnapshot } from '../snapshot-diff'
import { formatDateTime } from '../utils'

type WorkflowHistoryDialogProps = {
  // Id nội dung trong quy trình (workflowItem.id của tài sản / cảnh CG)
  itemId: number | undefined
  title?: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

const isForbidden = (error: unknown) => error instanceof AxiosError && error.response?.status === 403

function ErrorState({ error, fallback }: { error: unknown; fallback: string }) {
  return (
    <div className='text-muted-foreground flex flex-col items-center gap-2 py-10 text-center text-sm'>
      {isForbidden(error) && <ShieldAlert className='text-destructive h-6 w-6' />}
      <span className={cn(!isForbidden(error) && 'text-destructive')}>
        {isForbidden(error) ? 'Bạn không có quyền xem lịch sử của nội dung này.' : getServerErrorMessage(error, fallback)}
      </span>
    </div>
  )
}

function StatusChip({ name, color }: { name: string | null; color: string | null }) {
  if (!name) return <span className='text-muted-foreground'>Khởi tạo</span>
  return (
    <Badge variant='outline' style={color ? { borderColor: color, color } : undefined}>
      {name}
    </Badge>
  )
}

function Timeline({ entries }: { entries: WorkflowHistoryEntry[] }) {
  if (entries.length === 0)
    return <p className='text-muted-foreground py-10 text-center text-sm'>Chưa có lịch sử xử lý</p>

  // Mới nhất lên đầu; hạn chỉ còn ý nghĩa ở bước hiện tại
  const ordered = [...entries].reverse()
  return (
    <ol className='relative ms-3 border-s'>
      {ordered.map((h, index) => {
        const current = index === 0
        const overdue = current && !!h.deadline && new Date(h.deadline).getTime() < Date.now()
        return (
          <li key={h.id} className='ms-5 pb-5 last:pb-0'>
            <span
              className='bg-background absolute -start-[7px] mt-1.5 h-3.5 w-3.5 rounded-full border-2'
              style={{ borderColor: h.toStatusColor ?? 'var(--border)' }}
              aria-hidden
            />
            <div className='flex flex-wrap items-center gap-2 text-sm'>
              <span className='font-medium'>{h.actorName ?? h.actorId ?? 'Hệ thống'}</span>
              {h.actionName && (
                <Badge
                  className='text-white'
                  style={{ backgroundColor: h.actionColor ?? undefined }}
                  variant={h.actionColor ? 'default' : 'secondary'}
                >
                  {h.actionName}
                </Badge>
              )}
              <span className='text-muted-foreground ms-auto text-xs'>{formatDateTime(h.actionTime)}</span>
            </div>
            <div className='mt-1 flex flex-wrap items-center gap-1.5 text-xs'>
              <StatusChip name={h.fromStatusName} color={h.fromStatusColor} />
              <ArrowRight className='text-muted-foreground h-3 w-3' />
              <StatusChip name={h.toStatusName} color={h.toStatusColor} />
              {h.assignedToNames && <span className='text-muted-foreground'>· Giao cho: {h.assignedToNames}</span>}
            </div>
            {h.comment?.trim() && (
              <p className='bg-muted mt-1.5 rounded px-2 py-1 text-xs break-words whitespace-pre-line'>{h.comment}</p>
            )}
            {h.deadline && (
              <p className={cn('mt-1 inline-flex items-center gap-1 text-xs', overdue ? 'text-destructive font-medium' : 'text-muted-foreground')}>
                <Clock className='h-3 w-3' />
                Hạn xử lý: {formatDateTime(h.deadline)}
                {overdue && ' (quá hạn)'}
              </p>
            )}
          </li>
        )
      })}
    </ol>
  )
}

const ROW_CLASS: Record<DiffKind, string> = {
  changed: 'bg-amber-500/10',
  added: 'bg-green-500/10',
  removed: 'bg-red-500/10',
  same: '',
}

const KIND_LABEL: Record<Exclude<DiffKind, 'same'>, string> = {
  changed: 'Sửa',
  added: 'Thêm',
  removed: 'Xoá',
}

function VersionCompare({ itemId, enabled }: { itemId: number | undefined; enabled: boolean }) {
  const versions = useWorkflowItemVersions(itemId, enabled)
  const list = useMemo(() => versions.data ?? [], [versions.data])
  const [left, setLeft] = useState<number>()
  const [right, setRight] = useState<number>()
  const [changedOnly, setChangedOnly] = useState(true)

  // Mặc định: so phiên bản mới nhất với phiên bản ngay trước
  useEffect(() => {
    if (list.length === 0) return
    setRight((v) => v ?? list[0].versionNumber)
    setLeft((v) => v ?? (list[1] ?? list[0]).versionNumber)
  }, [list])

  const a = useWorkflowItemVersion(itemId, left)
  const b = useWorkflowItemVersion(itemId, right)
  const before = useMemo(() => parseSnapshot(a.data?.contentSnapshot), [a.data])
  const after = useMemo(() => parseSnapshot(b.data?.contentSnapshot), [b.data])
  const rows = useMemo(() => (before && after ? diffSnapshots(before, after) : []), [before, after])
  const changedCount = rows.filter((r) => r.kind !== 'same').length
  const visible = changedOnly ? rows.filter((r) => r.kind !== 'same') : rows

  if (versions.isLoading) return <Loader2 className='text-muted-foreground mx-auto my-10 h-6 w-6 animate-spin' />
  if (versions.isError) return <ErrorState error={versions.error} fallback='Không tải được danh sách phiên bản.' />
  if (list.length === 0) return <p className='text-muted-foreground py-10 text-center text-sm'>Chưa có phiên bản nào</p>

  const versionSelect = (value: number | undefined, onChange: (v: number) => void, label: string) => (
    <div className='flex items-center gap-2'>
      <Label className='text-muted-foreground text-xs'>{label}</Label>
      <Select value={value ? String(value) : ''} onValueChange={(v) => onChange(Number(v))}>
        <SelectTrigger className='h-8 w-52' aria-label={label}>
          <SelectValue placeholder='Chọn phiên bản' />
        </SelectTrigger>
        <SelectContent>
          {list.map((v) => (
            <SelectItem key={v.id} value={String(v.versionNumber)}>
              v{v.versionNumber} · {formatDateTime(v.createdAt)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )

  const loading = a.isLoading || b.isLoading
  const error = a.error ?? b.error

  return (
    <div className='space-y-3'>
      <div className='flex flex-wrap items-center gap-3'>
        {versionSelect(left, setLeft, 'Từ')}
        <ArrowRight className='text-muted-foreground h-4 w-4' />
        {versionSelect(right, setRight, 'Đến')}
        <div className='ms-auto flex items-center gap-2'>
          <Switch id='changed-only' checked={changedOnly} onCheckedChange={setChangedOnly} />
          <Label htmlFor='changed-only' className='text-xs'>
            Chỉ trường thay đổi ({changedCount})
          </Label>
        </div>
      </div>

      {loading ? (
        <Loader2 className='text-muted-foreground mx-auto my-10 h-6 w-6 animate-spin' />
      ) : error ? (
        <ErrorState error={error} fallback='Không tải được phiên bản.' />
      ) : !before || !after ? (
        <p className='text-destructive py-6 text-center text-sm'>Snapshot không phải JSON hợp lệ, không so sánh được.</p>
      ) : visible.length === 0 ? (
        <p className='text-muted-foreground py-10 text-center text-sm'>
          {left === right ? 'Hãy chọn hai phiên bản khác nhau' : 'Hai phiên bản giống nhau'}
        </p>
      ) : (
        <div className='rounded-md border'>
          <table className='w-full table-fixed text-xs'>
            <thead className='bg-muted/50'>
              <tr className='text-left'>
                <th className='w-[34%] px-2 py-1.5 font-medium'>Trường</th>
                <th className='px-2 py-1.5 font-medium'>v{left}</th>
                <th className='px-2 py-1.5 font-medium'>v{right}</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((r) => (
                <tr key={r.path} className={cn('border-t align-top', ROW_CLASS[r.kind])}>
                  <td className='px-2 py-1.5 break-words'>
                    {r.path}
                    {r.kind !== 'same' && (
                      <Badge variant='outline' className='ms-1.5 px-1 py-0 text-[10px]'>
                        {KIND_LABEL[r.kind]}
                      </Badge>
                    )}
                  </td>
                  <td
                    className={cn('px-2 py-1.5 break-all', r.kind !== 'same' && 'text-muted-foreground line-through decoration-red-400/70')}
                    title={r.before}
                  >
                    {r.before === undefined ? '—' : r.before || <i className='text-muted-foreground'>(trống)</i>}
                  </td>
                  <td className={cn('px-2 py-1.5 break-all', r.kind !== 'same' && 'font-medium')} title={r.after}>
                    {r.after === undefined ? '—' : r.after || <i className='text-muted-foreground'>(trống)</i>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

/** Lịch sử xử lý (dòng thời gian) và so sánh phiên bản snapshot của nội dung trong quy trình. */
export function WorkflowHistoryDialog({ itemId, title, open, onOpenChange }: WorkflowHistoryDialogProps) {
  const [tab, setTab] = useState('timeline')
  const history = useWorkflowItemHistory(itemId, open)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-3xl'>
        <DialogHeader>
          <DialogTitle>Lịch sử & phiên bản</DialogTitle>
          <DialogDescription>{title ? `Nội dung: ${title}` : 'Các bước xử lý và thay đổi giữa các phiên bản'}</DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value='timeline'>
              <History className='h-4 w-4' />
              Dòng thời gian
            </TabsTrigger>
            <TabsTrigger value='compare'>
              <GitCompare className='h-4 w-4' />
              So sánh phiên bản
            </TabsTrigger>
          </TabsList>

          <ScrollArea className='mt-2 h-[60vh] pe-3'>
            <TabsContent value='timeline' className='pt-2'>
              {history.isLoading ? (
                <Loader2 className='text-muted-foreground mx-auto my-10 h-6 w-6 animate-spin' />
              ) : history.isError ? (
                <ErrorState error={history.error} fallback='Không tải được lịch sử.' />
              ) : (
                <Timeline entries={history.data ?? []} />
              )}
            </TabsContent>
            <TabsContent value='compare' className='pt-2'>
              <VersionCompare itemId={itemId} enabled={open && tab === 'compare'} />
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

/** Nút mở hộp thoại lịch sử — gắn vào trang chi tiết tài sản / cảnh CG. */
export function WorkflowHistoryButton({ itemId, title, className }: { itemId: number | undefined; title?: string; className?: string }) {
  const [open, setOpen] = useState(false)
  if (!itemId) return null
  return (
    <>
      <Button type='button' variant='outline' size='sm' className={cn('h-7 text-xs', className)} onClick={() => setOpen(true)}>
        <History className='h-3.5 w-3.5' />
        Lịch sử & phiên bản
      </Button>
      <WorkflowHistoryDialog itemId={itemId} title={title} open={open} onOpenChange={setOpen} />
    </>
  )
}
