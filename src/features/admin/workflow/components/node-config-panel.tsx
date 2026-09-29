import { useState } from 'react'
import { AlertCircle, Link2, Loader2, Plus, Save, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  type WorkflowStatus,
  type WorkflowStatusRequest,
  useAddWorkflowStatus,
  useUpdateWorkflowStatus,
} from '../../api/workflows'
import { DEFAULT_STATUS_COLOR, type NodeData } from './flowchart-layout'
import { type FlowchartShapeType } from './flowchart-shapes'

// Các hình dùng cho nút trạng thái
export const STATUS_SHAPES: { value: FlowchartShapeType; label: string }[] = [
  { value: 'process', label: 'Xử lý' },
  { value: 'predefinedProcess', label: 'Xử lý tự động' },
  { value: 'manualOperation', label: 'Thao tác thủ công' },
  { value: 'decision', label: 'Duyệt / quyết định' },
  { value: 'delay', label: 'Chờ' },
  { value: 'document', label: 'Tài liệu' },
  { value: 'database', label: 'Lưu trữ' },
  { value: 'display', label: 'Hiển thị' },
]

const KIND_LABEL: Record<NodeData['type'], string> = {
  start: 'Bắt đầu',
  end: 'Kết thúc',
  status: 'Trạng thái',
}

interface NodeConfigPanelProps {
  workflowId: number
  node: NodeData | null
  statuses: WorkflowStatus[]
  // Trạng thái đã gắn với một nút trên sơ đồ (không cho gắn lần hai)
  boundStatusIds: Set<number>
  onUpdate: (nodeId: string, updates: Partial<NodeData>) => void
  onDelete: (nodeId: string) => void
}

const isHexColor = (v: string) => /^#[0-9a-fA-F]{6}$/.test(v)

type StatusFormProps = {
  workflowId: number
  node: NodeData
  status: WorkflowStatus | undefined
  onUpdate: NodeConfigPanelProps['onUpdate']
}

// Tạo mới hoặc sửa trạng thái backend gắn với nút (PUT thay toàn bộ các trường)
function StatusForm({ workflowId, node, status, onUpdate }: StatusFormProps) {
  const [name, setName] = useState(status?.name ?? node.label)
  const [color, setColor] = useState(status?.color ?? (isHexColor(node.color) ? node.color : DEFAULT_STATUS_COLOR))
  const [description, setDescription] = useState(status?.description ?? '')
  const [displayOrder, setDisplayOrder] = useState(status?.displayOrder != null ? String(status.displayOrder) : '')
  const [isInitial, setIsInitial] = useState(status?.isInitial ?? false)
  const [isFinal, setIsFinal] = useState(status?.isFinal ?? false)
  const [error, setError] = useState('')
  const addStatus = useAddWorkflowStatus()
  const updateStatus = useUpdateWorkflowStatus()
  const pending = addStatus.isPending || updateStatus.isPending

  const readOnly = status != null && status.workflowId == null

  const submit = async () => {
    const trimmed = name.trim()
    if (!trimmed) return setError('Vui lòng nhập tên trạng thái')
    if (displayOrder && !/^\d+$/.test(displayOrder)) return setError('Thứ tự phải là số nguyên không âm')
    setError('')
    const data: WorkflowStatusRequest = {
      name: trimmed,
      color: color.trim() || null,
      description: description.trim() || null,
      displayOrder: displayOrder ? Number(displayOrder) : null,
      isInitial,
      isFinal,
    }
    try {
      const saved = status
        ? await updateStatus.mutateAsync({ id: status.id, data })
        : await addStatus.mutateAsync({ workflowId, data })
      onUpdate(node.id, {
        label: saved.name,
        description: saved.description ?? undefined,
        color: saved.color || node.color,
        config: { statusId: saved.id },
      })
    } catch {
      // Lỗi (trùng tên...) đã được thông báo chung
    }
  }

  return (
    <div className='space-y-3'>
      {readOnly && (
        <div className='bg-muted text-muted-foreground rounded p-2 text-xs'>
          Trạng thái dùng chung giữa các quy trình, không sửa được tại đây.
        </div>
      )}
      <div>
        <Label className='text-foreground text-xs'>Tên trạng thái *</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={readOnly}
          placeholder='vd: Chờ duyệt'
          className='bg-muted border-border text-foreground mt-1'
        />
      </div>
      <div className='grid grid-cols-[1fr_90px] gap-2'>
        <div>
          <Label className='text-foreground text-xs'>Màu</Label>
          <div className='mt-1 flex gap-2'>
            <input
              type='color'
              aria-label='Chọn màu'
              value={isHexColor(color) ? color : DEFAULT_STATUS_COLOR}
              onChange={(e) => setColor(e.target.value)}
              disabled={readOnly}
              className='border-border h-9 w-10 cursor-pointer rounded border bg-transparent'
            />
            <Input
              value={color}
              onChange={(e) => setColor(e.target.value)}
              disabled={readOnly}
              className='bg-muted border-border text-foreground font-mono text-xs'
            />
          </div>
        </div>
        <div>
          <Label className='text-foreground text-xs'>Thứ tự</Label>
          <Input
            type='number'
            min={0}
            value={displayOrder}
            onChange={(e) => setDisplayOrder(e.target.value)}
            disabled={readOnly}
            className='bg-muted border-border text-foreground mt-1'
          />
        </div>
      </div>
      <div>
        <Label className='text-foreground text-xs'>Mô tả</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={readOnly}
          className='bg-muted border-border text-foreground mt-1 min-h-14'
        />
      </div>
      <div className='bg-muted flex items-center justify-between rounded p-2'>
        <div>
          <Label className='text-foreground text-xs'>Trạng thái bắt đầu</Label>
          <p className='text-muted-foreground text-[10px]'>Chỉ một trạng thái trong quy trình</p>
        </div>
        <Switch
          checked={isInitial}
          disabled={readOnly}
          onCheckedChange={(v) => {
            setIsInitial(v)
            if (v) setIsFinal(false)
          }}
        />
      </div>
      <div className='bg-muted flex items-center justify-between rounded p-2'>
        <div>
          <Label className='text-foreground text-xs'>Trạng thái kết thúc</Label>
          <p className='text-muted-foreground text-[10px]'>Nội dung tới đây được coi là hoàn thành</p>
        </div>
        <Switch
          checked={isFinal}
          disabled={readOnly}
          onCheckedChange={(v) => {
            setIsFinal(v)
            if (v) setIsInitial(false)
          }}
        />
      </div>
      {error && <p className='text-destructive text-xs'>{error}</p>}
      {!readOnly && (
        <Button onClick={submit} disabled={pending} className='w-full' size='sm'>
          {pending ? (
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
          ) : status ? (
            <Save className='mr-2 h-4 w-4' />
          ) : (
            <Plus className='mr-2 h-4 w-4' />
          )}
          {status ? 'Lưu trạng thái' : 'Tạo trạng thái'}
        </Button>
      )}
    </div>
  )
}

export function NodeConfigPanel({ workflowId, node, statuses, boundStatusIds, onUpdate, onDelete }: NodeConfigPanelProps) {
  if (!node) {
    return (
      <div className='flex h-full items-center justify-center p-8'>
        <div className='text-muted-foreground text-center'>
          <div className='mb-3 text-4xl'>⚙️</div>
          <div className='text-sm'>Chọn một nút hoặc đường nối để cấu hình</div>
          <div className='text-muted-foreground mt-2 text-xs'>Click vào nút / đường nối trên canvas</div>
        </div>
      </div>
    )
  }

  const statusId = node.config?.statusId
  const status = statusId !== undefined ? statuses.find((s) => s.id === statusId) : undefined
  const selectable = statuses.filter((s) => !boundStatusIds.has(s.id))

  const bindExisting = (value: string) => {
    const s = statuses.find((x) => String(x.id) === value)
    if (!s) return
    onUpdate(node.id, {
      label: s.name,
      description: s.description ?? undefined,
      color: s.color || node.color,
      config: { statusId: s.id },
    })
  }

  return (
    <ScrollArea className='h-full'>
      <div className='space-y-4 p-4 pb-6'>
        {/* Node Info */}
        <div>
          <div className='mb-3 flex items-center justify-between'>
            <h3 className='text-primary text-sm'>Thông tin nút</h3>
            <Badge variant='outline' className='border-border text-muted-foreground text-xs'>
              {KIND_LABEL[node.type]}
            </Badge>
          </div>

          {node.type === 'status' ? (
            <div className='space-y-3'>
              <div>
                <Label className='text-foreground text-xs'>Hình dạng</Label>
                <Select
                  value={node.shapeType}
                  onValueChange={(v) => onUpdate(node.id, { shapeType: v as FlowchartShapeType })}
                >
                  <SelectTrigger className='bg-muted border-border text-foreground mt-1 w-full'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_SHAPES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {status && (
                <div className='text-muted-foreground flex items-center gap-2 text-xs'>
                  <Link2 className='text-primary h-3.5 w-3.5' />
                  Gắn với trạng thái #{status.id}
                  <Badge variant='outline' className='border-border ml-auto text-[10px]'>
                    {status.itemCount} nội dung
                  </Badge>
                </div>
              )}
            </div>
          ) : (
            <div className='space-y-3'>
              <div>
                <Label className='text-foreground text-xs'>Tên hiển thị</Label>
                <Input
                  value={node.label}
                  onChange={(e) => onUpdate(node.id, { label: e.target.value })}
                  className='bg-muted border-border text-foreground mt-1'
                />
              </div>
              <div className='bg-muted text-muted-foreground rounded p-2 text-xs'>
                {node.type === 'start'
                  ? 'Nối nút Bắt đầu tới trạng thái đầu tiên để tạo bước khởi tạo: nội dung mới tạo sẽ vào trạng thái đó. Mỗi quy trình chỉ có một bước khởi tạo.'
                  : 'Nút Kết thúc chỉ để minh hoạ. Để đánh dấu hoàn thành, bật "Trạng thái kết thúc" ở nút trạng thái tương ứng.'}
              </div>
            </div>
          )}
        </div>

        {node.type === 'status' && (
          <>
            <Separator className='bg-muted' />
            <div>
              <h3 className='text-primary mb-3 text-sm'>Trạng thái</h3>
              {!status && (
                <div className='mb-3 space-y-3'>
                  <div className='flex gap-2 rounded border border-yellow-500/50 bg-yellow-900/20 p-2'>
                    <AlertCircle className='mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-400' />
                    <div className='text-xs text-yellow-300'>
                      Nút chưa gắn trạng thái. Chọn trạng thái có sẵn hoặc tạo mới.
                    </div>
                  </div>
                  {selectable.length > 0 && (
                    <div>
                      <Label className='text-foreground text-xs'>Chọn trạng thái có sẵn</Label>
                      <Select value='' onValueChange={bindExisting}>
                        <SelectTrigger className='bg-muted border-border text-foreground mt-1 w-full'>
                          <SelectValue placeholder='Chọn trạng thái...' />
                        </SelectTrigger>
                        <SelectContent>
                          {selectable.map((s) => (
                            <SelectItem key={s.id} value={String(s.id)}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className='text-muted-foreground text-xs'>Hoặc tạo trạng thái mới:</div>
                </div>
              )}
              <StatusForm
                key={`${node.id}-${status?.id ?? 'new'}`}
                workflowId={workflowId}
                node={node}
                status={status}
                onUpdate={onUpdate}
              />
            </div>
          </>
        )}

        <Separator className='bg-muted' />

        {/* Position & Size */}
        <div>
          <h3 className='text-primary mb-3 text-sm'>Vị trí & Kích thước</h3>
          <div className='grid grid-cols-2 gap-2'>
            <div>
              <Label className='text-foreground text-xs'>X</Label>
              <Input
                type='number'
                value={Math.round(node.x)}
                onChange={(e) => onUpdate(node.id, { x: parseFloat(e.target.value) || 0 })}
                className='bg-muted border-border text-foreground mt-1'
              />
            </div>
            <div>
              <Label className='text-foreground text-xs'>Y</Label>
              <Input
                type='number'
                value={Math.round(node.y)}
                onChange={(e) => onUpdate(node.id, { y: parseFloat(e.target.value) || 0 })}
                className='bg-muted border-border text-foreground mt-1'
              />
            </div>
            <div>
              <Label className='text-foreground text-xs'>Rộng</Label>
              <Input
                type='number'
                value={node.width}
                onChange={(e) => onUpdate(node.id, { width: parseFloat(e.target.value) || 100 })}
                className='bg-muted border-border text-foreground mt-1'
              />
            </div>
            <div>
              <Label className='text-foreground text-xs'>Cao</Label>
              <Input
                type='number'
                value={node.height}
                onChange={(e) => onUpdate(node.id, { height: parseFloat(e.target.value) || 60 })}
                className='bg-muted border-border text-foreground mt-1'
              />
            </div>
          </div>
        </div>

        <Separator className='bg-muted' />

        <Button
          variant='destructive'
          onClick={() => onDelete(node.id)}
          className='w-full border border-red-500/50 bg-red-900/20 text-red-400 hover:bg-red-900/30'
        >
          <Trash2 className='mr-2 h-4 w-4' />
          {status ? 'Xoá nút và trạng thái' : 'Xoá nút'}
        </Button>
      </div>
    </ScrollArea>
  )
}
