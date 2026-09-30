import { useState } from 'react'
import { AlertCircle, ArrowRight, Check, Loader2, Plus, Save, Trash2, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import {
  type WorkflowTransition,
  type WorkflowTransitionRequest,
  useAddWorkflowTransition,
  useCreateWorkflowAction,
  useUpdateWorkflowTransition,
  useWorkflowActions,
} from '../../api/workflows'
import { AssigneePicker, splitAssignees } from './assignee-picker'
import { type Connection, type NodeData, endpointStatus } from './flowchart-layout'

const MAX_DEADLINE_HOURS = 24 * 365

interface TransitionConfigPanelProps {
  workflowId: number
  connection: Connection
  fromNode: NodeData | undefined
  toNode: NodeData | undefined
  transition: WorkflowTransition | undefined
  // Gắn kết nối với bước chuyển vừa tạo/cập nhật
  onBind: (connectionId: string, transition: WorkflowTransition) => void
  onDelete: (connectionId: string) => void
}

// Tạo hành động mới ngay trong ô chọn
function InlineActionCreator({ onCreated }: { onCreated: (id: number) => void }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const createAction = useCreateWorkflowAction()

  if (!open) {
    return (
      <Button type='button' variant='link' size='sm' className='h-auto p-0 text-xs' onClick={() => setOpen(true)}>
        <Plus className='mr-1 h-3 w-3' /> Tạo hành động mới
      </Button>
    )
  }

  const submit = async () => {
    if (!name.trim()) return
    try {
      const created = await createAction.mutateAsync({ name: name.trim() })
      onCreated(created.id)
      setName('')
      setOpen(false)
    } catch {
      // Lỗi đã được thông báo chung
    }
  }

  return (
    <div className='flex gap-1'>
      <Input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            submit()
          }
        }}
        placeholder='Tên hành động, vd: Duyệt'
        className='bg-muted border-border h-8 text-xs'
      />
      <Button
        type='button'
        size='icon'
        className='h-8 w-8 shrink-0'
        aria-label='Tạo'
        disabled={!name.trim() || createAction.isPending}
        onClick={submit}
      >
        {createAction.isPending ? <Loader2 className='h-3.5 w-3.5 animate-spin' /> : <Check className='h-3.5 w-3.5' />}
      </Button>
      <Button
        type='button'
        variant='ghost'
        size='icon'
        className='h-8 w-8 shrink-0'
        aria-label='Huỷ'
        onClick={() => setOpen(false)}
      >
        <X className='h-3.5 w-3.5' />
      </Button>
    </div>
  )
}

type TransitionFormProps = Omit<TransitionConfigPanelProps, 'fromNode' | 'toNode' | 'onDelete'> & {
  fromStatusId: number | null
  toStatusId: number
}

function TransitionForm({ workflowId, connection, transition, fromStatusId, toStatusId, onBind }: TransitionFormProps) {
  const [actionId, setActionId] = useState(transition?.actionId != null ? String(transition.actionId) : '')
  const [deadline, setDeadline] = useState(transition?.deadlineHours != null ? String(transition.deadlineHours) : '')
  const [assignees, setAssignees] = useState(splitAssignees(transition?.assignedUserGroupId))
  const [requireUpload, setRequireUpload] = useState(transition?.requireUpload ?? false)
  const [error, setError] = useState('')
  const { data: actions, isLoading: actionsLoading, isError: actionsError } = useWorkflowActions()
  const addTransition = useAddWorkflowTransition()
  const updateTransition = useUpdateWorkflowTransition()
  const pending = addTransition.isPending || updateTransition.isPending

  const submit = async () => {
    if (!actionId) return setError('Vui lòng chọn hành động')
    if (deadline && (!/^\d+$/.test(deadline) || Number(deadline) > MAX_DEADLINE_HOURS))
      return setError(`Thời hạn phải là số giờ từ 0 đến ${MAX_DEADLINE_HOURS}`)
    setError('')
    const data: WorkflowTransitionRequest = {
      fromStatusId,
      toStatusId,
      actionId: Number(actionId),
      deadlineHours: deadline ? Number(deadline) : null,
      assignedUserGroupId: assignees.length ? assignees.join(',') : null,
      requireUpload,
      // Chưa có API danh mục loại thông báo: giữ nguyên giá trị hiện có
      notificationTypeId: transition?.notificationTypeId ?? null,
    }
    try {
      const saved = transition
        ? await updateTransition.mutateAsync({ id: transition.id, data })
        : await addTransition.mutateAsync({ workflowId, data })
      onBind(connection.id, saved)
    } catch {
      // Lỗi (trùng hành động, đã có bước khởi tạo...) đã được thông báo chung
    }
  }

  return (
    <div className='space-y-3'>
      <div>
        <Label className='text-foreground text-xs'>Hành động *</Label>
        <Select value={actionId} onValueChange={setActionId}>
          <SelectTrigger className='bg-muted border-border text-foreground mt-1 w-full'>
            <SelectValue placeholder={actionsLoading ? 'Đang tải...' : 'Chọn hành động'} />
          </SelectTrigger>
          <SelectContent>
            {actions?.map((a) => (
              <SelectItem key={a.id} value={String(a.id)}>
                <span className='inline-flex items-center gap-2'>
                  {a.color && <span className='h-2.5 w-2.5 rounded-full' style={{ backgroundColor: a.color }} />}
                  {a.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {actionsError && <p className='text-destructive mt-1 text-xs'>Không tải được danh sách hành động.</p>}
        <div className='mt-1.5'>
          <InlineActionCreator onCreated={(id) => setActionId(String(id))} />
        </div>
      </div>

      <div>
        <Label className='text-foreground text-xs'>Thời hạn xử lý (giờ)</Label>
        <Input
          type='number'
          min={0}
          max={MAX_DEADLINE_HOURS}
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          placeholder='Không giới hạn'
          className='bg-muted border-border text-foreground mt-1'
        />
      </div>

      <div>
        <Label className='text-foreground text-xs'>Người / nhóm được giao</Label>
        <div className='mt-1'>
          <AssigneePicker value={assignees} onChange={setAssignees} />
        </div>
      </div>

      <div className='bg-muted flex items-center justify-between rounded p-2'>
        <div>
          <Label className='text-foreground text-xs'>Yêu cầu tải file lên</Label>
          <p className='text-muted-foreground text-[10px]'>Phải đính kèm file khi thực hiện</p>
        </div>
        <Switch checked={requireUpload} onCheckedChange={setRequireUpload} />
      </div>

      {error && <p className='text-destructive text-xs'>{error}</p>}

      <Button onClick={submit} disabled={pending} className='w-full' size='sm'>
        {pending ? (
          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
        ) : transition ? (
          <Save className='mr-2 h-4 w-4' />
        ) : (
          <Plus className='mr-2 h-4 w-4' />
        )}
        {transition ? 'Lưu bước chuyển' : 'Tạo bước chuyển'}
      </Button>
    </div>
  )
}

export function TransitionConfigPanel(props: TransitionConfigPanelProps) {
  const { connection, fromNode, toNode, transition, onDelete } = props
  const fromStatusId = endpointStatus(fromNode)
  const toStatusId = endpointStatus(toNode)
  const isVisualOnly = toNode?.type === 'end'
  const canBind = fromStatusId !== undefined && toStatusId != null

  return (
    <ScrollArea className='h-full'>
      <div className='space-y-4 p-4 pb-6'>
        <div>
          <div className='mb-3 flex items-center justify-between'>
            <h3 className='text-primary text-sm'>Đường nối</h3>
            <Badge
              variant='outline'
              className={transition ? 'border-green-500 text-xs text-green-400' : 'border-border text-muted-foreground text-xs'}
            >
              {isVisualOnly ? 'Minh hoạ' : transition ? `Bước chuyển #${transition.id}` : 'Chưa lưu'}
            </Badge>
          </div>
          <div className='bg-muted flex items-center gap-2 rounded p-2 text-xs'>
            <span className='truncate'>{fromNode?.label || '—'}</span>
            <ArrowRight className='text-primary h-3.5 w-3.5 shrink-0' />
            <span className='truncate'>{toNode?.label || '—'}</span>
          </div>
          {fromStatusId === null && (
            <p className='text-muted-foreground mt-2 text-xs'>
              Bước khởi tạo: nội dung mới tạo sẽ vào trạng thái đích. Mỗi quy trình chỉ có một bước khởi tạo.
            </p>
          )}
        </div>

        <Separator className='bg-muted' />

        {isVisualOnly ? (
          <div className='bg-muted text-muted-foreground rounded p-2 text-xs'>
            Kết nối tới nút Kết thúc chỉ để minh hoạ, không tạo bước chuyển. Hãy bật "Trạng thái kết thúc" ở nút trạng
            thái nguồn.
          </div>
        ) : !canBind ? (
          <div className='flex gap-2 rounded border border-yellow-500/50 bg-yellow-900/20 p-2'>
            <AlertCircle className='mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-400' />
            <div className='text-xs text-yellow-300'>
              Cần gắn trạng thái cho cả hai nút trước khi cấu hình bước chuyển.
            </div>
          </div>
        ) : (
          <div>
            <h3 className='text-primary mb-3 text-sm'>Bước chuyển</h3>
            <TransitionForm
              key={`${connection.id}-${transition?.id ?? 'new'}`}
              {...props}
              fromStatusId={fromStatusId}
              toStatusId={toStatusId}
            />
          </div>
        )}

        <Separator className='bg-muted' />

        <Button
          variant='destructive'
          onClick={() => onDelete(connection.id)}
          className='w-full border border-red-500/50 bg-red-900/20 text-red-400 hover:bg-red-900/30'
        >
          <Trash2 className='mr-2 h-4 w-4' />
          {transition ? 'Xoá đường nối và bước chuyển' : 'Xoá đường nối'}
        </Button>
      </div>
    </ScrollArea>
  )
}
