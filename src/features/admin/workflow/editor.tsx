import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertCircle,
  ArrowLeft,
  Download,
  Grid3x3,
  Loader2,
  Maximize2,
  MousePointer2,
  Move,
  Redo2,
  Save,
  Undo2,
  Upload,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { ConfirmDialog } from '@/components/confirm-dialog'
import {
  type WorkflowTransition,
  useDeleteWorkflowStatus,
  useDeleteWorkflowTransition,
  useSaveWorkflowLayout,
  useUpdateWorkflow,
  useWorkflow,
} from '../api/workflows'
import { FlowchartNode, type NodeTag } from './components/flowchart-node'
import {
  type Connection,
  type NodeData,
  type NodeKind,
  LAYOUT_VERSION,
  connectionPath,
  newId,
  parseLayout,
  reconcileLayout,
  serializeLayout,
} from './components/flowchart-layout'
import { type FlowchartShapeType } from './components/flowchart-shapes'
import { NodeConfigPanel } from './components/node-config-panel'
import { TransitionConfigPanel } from './components/transition-config-panel'

interface NodeTemplate {
  id: string
  type: NodeKind
  label: string
  description: string
  category: string
  shapeType: FlowchartShapeType
  color: string
  strokeColor: string
  defaultWidth: number
  defaultHeight: number
}

// Nút "Trạng thái" gắn với trạng thái backend; các hình khác nhau chỉ khác cách hiển thị
const nodeTemplates: NodeTemplate[] = [
  { id: 'start', type: 'start', label: 'Bắt đầu', description: 'Điểm vào: nối tới trạng thái đầu tiên', category: 'Bắt đầu / Kết thúc', shapeType: 'oval', color: '#ec4899', strokeColor: '#be185d', defaultWidth: 120, defaultHeight: 60 },
  { id: 'end', type: 'end', label: 'Kết thúc', description: 'Điểm kết thúc (minh hoạ)', category: 'Bắt đầu / Kết thúc', shapeType: 'oval', color: '#ef4444', strokeColor: '#b91c1c', defaultWidth: 120, defaultHeight: 60 },

  { id: 'status', type: 'status', label: 'Trạng thái', description: 'Bước xử lý của nội dung', category: 'Trạng thái', shapeType: 'process', color: '#fbbf24', strokeColor: '#d97706', defaultWidth: 140, defaultHeight: 70 },
  { id: 'status_review', type: 'status', label: 'Chờ duyệt', description: 'Bước duyệt / quyết định', category: 'Trạng thái', shapeType: 'decision', color: '#fb923c', strokeColor: '#ea580c', defaultWidth: 140, defaultHeight: 90 },
  { id: 'status_auto', type: 'status', label: 'Xử lý tự động', description: 'Hệ thống tự xử lý', category: 'Trạng thái', shapeType: 'predefinedProcess', color: '#818cf8', strokeColor: '#4f46e5', defaultWidth: 140, defaultHeight: 70 },
  { id: 'status_manual', type: 'status', label: 'Thao tác thủ công', description: 'Cần người thực hiện', category: 'Trạng thái', shapeType: 'manualOperation', color: '#f472b6', strokeColor: '#db2777', defaultWidth: 140, defaultHeight: 70 },
  { id: 'status_wait', type: 'status', label: 'Chờ', description: 'Chờ / tạm hoãn', category: 'Trạng thái', shapeType: 'delay', color: '#fcd34d', strokeColor: '#f59e0b', defaultWidth: 130, defaultHeight: 70 },
  { id: 'status_document', type: 'status', label: 'Tài liệu', description: 'Soạn / bổ sung tài liệu', category: 'Trạng thái', shapeType: 'document', color: '#a78bfa', strokeColor: '#7c3aed', defaultWidth: 130, defaultHeight: 80 },
  { id: 'status_archive', type: 'status', label: 'Lưu trữ', description: 'Đã lưu trữ', category: 'Trạng thái', shapeType: 'database', color: '#34d399', strokeColor: '#059669', defaultWidth: 110, defaultHeight: 90 },
  { id: 'status_publish', type: 'status', label: 'Phát sóng', description: 'Hiển thị / phát sóng', category: 'Trạng thái', shapeType: 'display', color: '#5eead4', strokeColor: '#14b8a6', defaultWidth: 130, defaultHeight: 80 },
]

const categories = Array.from(new Set(nodeTemplates.map((n) => n.category)))

type Snapshot = { nodes: NodeData[]; connections: Connection[] }
type PendingDelete = { kind: 'node' | 'connection'; id: string } | null

const HISTORY_LIMIT = 50

const CONNECTION_COLORS = {
  bound: '#06b6d4',
  pending: '#f97316',
  visual: '#94a3b8',
  selected: '#facc15',
} as const

interface WorkflowEditorViewProps {
  workflowId?: string
  onBack?: () => void
}

export function WorkflowEditorView({ workflowId, onBack }: WorkflowEditorViewProps) {
  const parsedId = Number(workflowId)
  const id = Number.isInteger(parsedId) && parsedId > 0 ? parsedId : null
  const detailQuery = useWorkflow(id)
  const detail = detailQuery.data

  const updateWorkflow = useUpdateWorkflow()
  const saveLayout = useSaveWorkflowLayout()
  const deleteStatus = useDeleteWorkflowStatus()
  const deleteTransition = useDeleteWorkflowTransition()

  const [workflowName, setWorkflowName] = useState('')
  const [nodes, setNodes] = useState<NodeData[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null)
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null)
  const [scale, setScale] = useState(1)
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [showGrid, setShowGrid] = useState(true)
  const [tool, setTool] = useState<'select' | 'pan'>('select')
  const [history, setHistory] = useState<{ stack: Snapshot[]; index: number }>({ stack: [], index: -1 })
  const [dirty, setDirty] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<PendingDelete>(null)
  const [leaveOpen, setLeaveOpen] = useState(false)
  const [initializedFor, setInitializedFor] = useState<number | null>(null)

  const canvasRef = useRef<HTMLDivElement>(null)
  const importRef = useRef<HTMLInputElement>(null)
  const dragNodeRef = useRef<{ nodeId: string; offsetX: number; offsetY: number } | null>(null)
  // Giá trị mới nhất cho các callback chạy sau await / sự kiện chuột toàn cục
  const nodesRef = useRef(nodes)
  const connectionsRef = useRef(connections)
  useEffect(() => {
    nodesRef.current = nodes
    connectionsRef.current = connections
  }, [nodes, connections])

  // Lần đầu có dữ liệu: dựng sơ đồ từ layoutJson, bổ sung trạng thái/bước chuyển chưa có trên sơ đồ
  if (detail && initializedFor !== detail.id) {
    const layout = reconcileLayout(parseLayout(detail.layoutJson), detail, true)
    setInitializedFor(detail.id)
    setWorkflowName(detail.name)
    setNodes(layout.nodes)
    setConnections(layout.connections)
    setHistory({ stack: [layout], index: 0 })
    setDirty(false)
  }

  const statusById = useMemo(() => new Map((detail?.statuses ?? []).map((s) => [s.id, s])), [detail])
  const transitionById = useMemo(() => new Map((detail?.transitions ?? []).map((t) => [t.id, t])), [detail])
  const nodeById = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes])
  const boundStatusIds = useMemo(
    () => new Set(nodes.flatMap((n) => (n.config?.statusId !== undefined ? [n.config.statusId] : []))),
    [nodes]
  )

  const unboundCount =
    nodes.filter((n) => n.type === 'status' && !statusById.has(n.config?.statusId ?? -1)).length +
    connections.filter((c) => c.transitionId === undefined && nodeById.get(c.to)?.type !== 'end').length

  // ---------- Lịch sử (undo/redo) ----------

  const commit = (nextNodes: NodeData[], nextConnections: Connection[]) => {
    nodesRef.current = nextNodes
    connectionsRef.current = nextConnections
    setNodes(nextNodes)
    setConnections(nextConnections)
    setDirty(true)
    setHistory((h) => {
      const stack = [...h.stack.slice(0, h.index + 1), { nodes: nextNodes, connections: nextConnections }].slice(
        -HISTORY_LIMIT
      )
      return { stack, index: stack.length - 1 }
    })
  }

  const restore = (index: number) => {
    const snap = history.stack[index]
    if (!snap) return
    // Liên kết tới trạng thái/bước chuyển đã bị xoá ở máy chủ sẽ được gỡ bỏ
    const state = detail ? reconcileLayout(snap, detail, false) : snap
    setNodes(state.nodes)
    setConnections(state.connections)
    setHistory((h) => ({ ...h, index }))
    setSelectedNodeId(null)
    setSelectedConnectionId(null)
    setDirty(true)
  }

  // ---------- Kéo thả từ thư viện ----------

  const handleDragStart = (e: React.DragEvent, template: NodeTemplate) => {
    e.dataTransfer.setData('nodeTemplate', template.id)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const template = nodeTemplates.find((t) => t.id === e.dataTransfer.getData('nodeTemplate'))
    if (!template || !canvasRef.current) return
    if (template.type === 'start' && nodes.some((n) => n.type === 'start')) {
      toast.error('Sơ đồ chỉ có một nút Bắt đầu')
      return
    }

    const rect = canvasRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left - canvasOffset.x) / scale
    const y = (e.clientY - rect.top - canvasOffset.y) / scale
    const newNode: NodeData = {
      id: newId('node'),
      type: template.type,
      label: template.label,
      description: template.description,
      shapeType: template.shapeType,
      color: template.color,
      strokeColor: template.strokeColor,
      x: showGrid ? Math.round(x / 20) * 20 : x,
      y: showGrid ? Math.round(y / 20) * 20 : y,
      width: template.defaultWidth,
      height: template.defaultHeight,
      config: {},
    }
    commit([...nodes, newNode], connections)
    setSelectedConnectionId(null)
    setSelectedNodeId(newNode.id)
    if (newNode.type === 'status') toast.info('Đã thêm nút — hãy tạo hoặc chọn trạng thái ở bảng bên phải')
  }

  // ---------- Di chuyển nút ----------

  const handleNodeDragStart = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation()
    const node = nodes.find((n) => n.id === nodeId)
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!node || !rect) return

    dragNodeRef.current = {
      nodeId,
      offsetX: (e.clientX - rect.left - canvasOffset.x) / scale - node.x,
      offsetY: (e.clientY - rect.top - canvasOffset.y) / scale - node.y,
    }
    let last: { x: number; y: number } | null = null

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const drag = dragNodeRef.current
      if (!drag || !canvasRef.current) return
      const r = canvasRef.current.getBoundingClientRect()
      const x = (moveEvent.clientX - r.left - canvasOffset.x) / scale - drag.offsetX
      const y = (moveEvent.clientY - r.top - canvasOffset.y) / scale - drag.offsetY
      const pos = { x: showGrid ? Math.round(x / 20) * 20 : x, y: showGrid ? Math.round(y / 20) * 20 : y }
      last = pos
      setNodes((prev) => prev.map((n) => (n.id === drag.nodeId ? { ...n, ...pos } : n)))
    }

    const handleMouseUp = () => {
      dragNodeRef.current = null
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      // Ghi vị trí cuối vào lịch sử
      const pos = last
      if (pos) commit(nodesRef.current.map((n) => (n.id === nodeId ? { ...n, ...pos } : n)), connectionsRef.current)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  // ---------- Canvas: kéo, thu phóng ----------

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((tool === 'pan' || e.button === 1) && e.target === e.currentTarget) {
      e.preventDefault()
      setIsPanning(true)
      setPanStart({ x: e.clientX - canvasOffset.x, y: e.clientY - canvasOffset.y })
    } else if (tool === 'select' && e.target === e.currentTarget) {
      setSelectedNodeId(null)
      setSelectedConnectionId(null)
    }
  }

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (isPanning) setCanvasOffset({ x: e.clientX - panStart.x, y: e.clientY - panStart.y })
  }

  const handleCanvasMouseUp = () => setIsPanning(false)
  const handleZoomIn = () => setScale(Math.min(scale * 1.2, 3))
  const handleZoomOut = () => setScale(Math.max(scale / 1.2, 0.3))
  const handleZoomReset = () => {
    setScale(1)
    setCanvasOffset({ x: 0, y: 0 })
  }

  // ---------- Nút & đường nối ----------

  const selectConnection = (connectionId: string) => {
    setSelectedNodeId(null)
    setSelectedConnectionId(connectionId)
  }

  const handleNodeClick = (nodeId: string) => {
    if (connectingFrom === null) {
      setSelectedConnectionId(null)
      setSelectedNodeId(nodeId)
      return
    }
    const from = nodeById.get(connectingFrom)
    const to = nodeById.get(nodeId)
    setConnectingFrom(null)
    if (!from || !to || from.id === to.id) return

    if (to.type === 'start') return void toast.error('Không thể nối vào nút Bắt đầu')
    if (from.type === 'end') return void toast.error('Không thể nối từ nút Kết thúc')
    if (from.type === 'start' && to.type === 'end') return void toast.error('Nút Bắt đầu phải nối tới một trạng thái')
    if (from.type === 'start' && connections.some((c) => c.from === from.id))
      return void toast.error('Quy trình chỉ có một bước khởi tạo (một đường nối từ nút Bắt đầu)')

    const connection: Connection = { id: newId('conn'), from: from.id, to: to.id }
    commit(nodes, [...connections, connection])
    selectConnection(connection.id)
    toast.success(
      to.type === 'end' ? 'Đã tạo đường nối minh hoạ' : 'Đã tạo đường nối — chọn hành động để lưu bước chuyển'
    )
  }

  const handleStartConnection = (nodeId: string) => {
    setConnectingFrom(nodeId)
    setSelectedNodeId(null)
    setSelectedConnectionId(null)
  }

  const handleDuplicateNode = (nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId)
    if (!node) return
    if (node.type === 'start') return void toast.error('Sơ đồ chỉ có một nút Bắt đầu')
    // Bản sao không gắn trạng thái (mỗi trạng thái chỉ có một nút)
    const copy: NodeData = {
      ...node,
      id: newId('node'),
      x: node.x + 20,
      y: node.y + 20,
      label: `${node.label} (bản sao)`,
      config: {},
    }
    commit([...nodes, copy], connections)
    setSelectedNodeId(copy.id)
  }

  const handleUpdateNode = (nodeId: string, updates: Partial<NodeData>) => {
    commit(
      nodesRef.current.map((n) => (n.id === nodeId ? { ...n, ...updates } : n)),
      connectionsRef.current
    )
  }

  const handleBindTransition = (connectionId: string, transition: WorkflowTransition) => {
    commit(
      nodesRef.current,
      connectionsRef.current.map((c) =>
        c.id === connectionId
          ? {
              ...c,
              transitionId: transition.id,
              actionId: transition.actionId ?? undefined,
              label: transition.actionName ?? undefined,
            }
          : c
      )
    )
  }

  const removeLocally = (kind: 'node' | 'connection', targetId: string) => {
    if (kind === 'node') {
      commit(
        nodesRef.current.filter((n) => n.id !== targetId),
        connectionsRef.current.filter((c) => c.from !== targetId && c.to !== targetId)
      )
      if (selectedNodeId === targetId) setSelectedNodeId(null)
    } else {
      commit(nodesRef.current, connectionsRef.current.filter((c) => c.id !== targetId))
      if (selectedConnectionId === targetId) setSelectedConnectionId(null)
    }
  }

  const boundConnectionsOf = (nodeId: string) =>
    connections.filter((c) => (c.from === nodeId || c.to === nodeId) && c.transitionId !== undefined)

  const requestDeleteNode = (nodeId: string) => {
    const node = nodeById.get(nodeId)
    if (!node) return
    const hasStatus = node.config?.statusId !== undefined && statusById.has(node.config.statusId)
    if (hasStatus || boundConnectionsOf(nodeId).length > 0) setPendingDelete({ kind: 'node', id: nodeId })
    else removeLocally('node', nodeId)
  }

  const requestDeleteConnection = (connectionId: string) => {
    const connection = connections.find((c) => c.id === connectionId)
    if (!connection) return
    if (connection.transitionId !== undefined && transitionById.has(connection.transitionId))
      setPendingDelete({ kind: 'connection', id: connectionId })
    else removeLocally('connection', connectionId)
  }

  const confirmPendingDelete = async () => {
    if (!pendingDelete) return
    try {
      if (pendingDelete.kind === 'connection') {
        const tid = connections.find((c) => c.id === pendingDelete.id)?.transitionId
        if (tid !== undefined) await deleteTransition.mutateAsync(tid)
      } else {
        const node = nodeById.get(pendingDelete.id)
        const sid = node?.config?.statusId
        if (sid !== undefined && statusById.has(sid)) {
          // Backend xoá luôn các bước chuyển đi/đến trạng thái này
          await deleteStatus.mutateAsync(sid)
        } else {
          for (const c of boundConnectionsOf(pendingDelete.id)) {
            if (c.transitionId !== undefined) await deleteTransition.mutateAsync(c.transitionId)
          }
        }
      }
      removeLocally(pendingDelete.kind, pendingDelete.id)
    } catch {
      // Lỗi 409 (đang được sử dụng) đã được thông báo chung; giữ nguyên sơ đồ
    }
    setPendingDelete(null)
  }

  const pendingDeleteText = (() => {
    if (!pendingDelete) return ''
    if (pendingDelete.kind === 'connection') {
      const c = connections.find((x) => x.id === pendingDelete.id)
      const t = c?.transitionId !== undefined ? transitionById.get(c.transitionId) : undefined
      return `Xoá bước chuyển "${t?.actionName ?? ''}" (${t?.fromStatusName ?? 'Bắt đầu'} → ${t?.toStatusName ?? ''}) trên máy chủ? Không thể xoá nếu bước chuyển đã có trong lịch sử xử lý nội dung.`
    }
    const node = nodeById.get(pendingDelete.id)
    const status = node?.config?.statusId !== undefined ? statusById.get(node.config.statusId) : undefined
    if (status)
      return `Xoá trạng thái "${status.name}" cùng mọi bước chuyển đi/đến trạng thái này trên máy chủ? Không thể xoá nếu trạng thái đã được nội dung sử dụng.`
    return `Xoá nút "${node?.label ?? ''}" và các bước chuyển gắn với nó trên máy chủ?`
  })()

  // ---------- Lưu, xuất / nhập ----------

  const handleSave = async () => {
    if (!detail || !id) return
    const name = workflowName.trim()
    if (!name) return void toast.error('Tên workflow không được để trống')
    try {
      if (name !== detail.name)
        await updateWorkflow.mutateAsync({
          id,
          data: { name, description: detail.description, isActive: detail.isActive },
        })
      await saveLayout.mutateAsync({ id, layoutJson: serializeLayout(nodesRef.current, connectionsRef.current) })
      setDirty(false)
      if (unboundCount > 0)
        toast.warning(`Còn ${unboundCount} nút/đường nối chưa gắn trạng thái hoặc bước chuyển`, {
          description: 'Chúng chỉ được lưu trong sơ đồ, chưa có hiệu lực trong quy trình.',
        })
    } catch {
      // Lỗi đã được thông báo chung
    }
  }

  const handleExport = () => {
    const data = { name: workflowName, version: LAYOUT_VERSION, nodes, connections }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${(workflowName || 'workflow').replace(/\s+/g, '_')}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Đã xuất sơ đồ workflow')
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !detail) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result
      const layout = typeof text === 'string' ? parseLayout(text) : null
      if (!layout) return void toast.error('File không hợp lệ')
      // Chỉ giữ liên kết tới trạng thái/bước chuyển của workflow này; bổ sung phần còn thiếu
      const state = reconcileLayout(layout, detail, true)
      if (layout.name) setWorkflowName(layout.name)
      commit(state.nodes, state.connections)
      setSelectedNodeId(null)
      setSelectedConnectionId(null)
      toast.success('Đã nhập sơ đồ — bấm Lưu để lưu lại')
    }
    reader.readAsText(file)
  }

  const handleBack = () => (dirty ? setLeaveOpen(true) : onBack?.())

  // ---------- Hiển thị ----------

  const nodeTags = (node: NodeData): NodeTag[] => {
    if (node.type !== 'status') return []
    const status = node.config?.statusId !== undefined ? statusById.get(node.config.statusId) : undefined
    if (!status) return [{ label: 'Chưa gắn trạng thái', className: 'bg-yellow-400 text-black' }]
    const tags: NodeTag[] = []
    if (status.isInitial) tags.push({ label: 'Bắt đầu', className: 'bg-pink-500 text-white' })
    if (status.isFinal) tags.push({ label: 'Kết thúc', className: 'bg-red-500 text-white' })
    if (status.itemCount > 0) tags.push({ label: `${status.itemCount} nội dung`, className: 'bg-slate-700 text-white' })
    return tags
  }

  const renderConnection = (connection: Connection) => {
    const from = nodeById.get(connection.from)
    const to = nodeById.get(connection.to)
    if (!from || !to) return null
    const { d, mid } = connectionPath(from, to)
    const selected = selectedConnectionId === connection.id
    const kind = selected
      ? 'selected'
      : to.type === 'end'
        ? 'visual'
        : connection.transitionId !== undefined
          ? 'bound'
          : 'pending'
    const color = CONNECTION_COLORS[kind]
    const label = kind === 'visual' ? undefined : connection.transitionId !== undefined ? connection.label : 'Chưa lưu'

    return (
      <g key={connection.id}>
        {/* Vùng bấm rộng hơn nét vẽ */}
        <path
          d={d}
          stroke='transparent'
          strokeWidth={14}
          fill='none'
          style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
          onMouseDown={(e) => {
            e.stopPropagation()
            if (tool === 'select') selectConnection(connection.id)
          }}
        />
        <path
          d={d}
          stroke={color}
          strokeWidth={selected ? 3 : 2}
          strokeDasharray={kind === 'pending' || kind === 'visual' ? '6 4' : undefined}
          fill='none'
          markerEnd={`url(#arrow-${kind})`}
          className='pointer-events-none'
        />
        {label && (
          <text
            x={mid.x}
            y={mid.y - 4}
            fill={color}
            fontSize={12}
            textAnchor='middle'
            stroke='var(--background)'
            strokeWidth={4}
            paintOrder='stroke'
            className='pointer-events-none select-none'
          >
            {label}
          </text>
        )}
      </g>
    )
  }

  if (id == null || detailQuery.isError || (detailQuery.isFetched && !detail)) {
    return (
      <div className='bg-background flex h-screen flex-col items-center justify-center gap-4'>
        <AlertCircle className='text-destructive h-10 w-10' />
        <div className='text-foreground'>
          {id == null ? 'Không tìm thấy workflow' : 'Không tải được workflow. Vui lòng thử lại.'}
        </div>
        <div className='flex gap-2'>
          <Button variant='outline' onClick={onBack}>
            <ArrowLeft className='mr-2 h-4 w-4' /> Quay lại
          </Button>
          {id != null && <Button onClick={() => detailQuery.refetch()}>Thử lại</Button>}
        </div>
      </div>
    )
  }

  if (!detail) {
    return (
      <div className='bg-background text-muted-foreground flex h-screen items-center justify-center gap-2'>
        <Loader2 className='h-5 w-5 animate-spin' /> Đang tải workflow...
      </div>
    )
  }

  const selectedNode = selectedNodeId ? (nodeById.get(selectedNodeId) ?? null) : null
  const selectedConnection = selectedConnectionId
    ? (connections.find((c) => c.id === selectedConnectionId) ?? null)
    : null
  const saving = saveLayout.isPending || updateWorkflow.isPending

  return (
    <div className='bg-background flex h-screen flex-col'>
      {/* Top Toolbar */}
      <div className='bg-card border-border border-b p-3'>
        <div className='flex items-center justify-between'>
          <div className='flex flex-1 items-center gap-3'>
            <Button variant='ghost' onClick={handleBack} className='text-muted-foreground hover:text-foreground' size='sm'>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Quay lại
            </Button>
            <Separator orientation='vertical' className='bg-muted h-6' />
            <div className='max-w-sm flex-1'>
              <Input
                value={workflowName}
                onChange={(e) => {
                  setWorkflowName(e.target.value)
                  setDirty(true)
                }}
                placeholder='Tên workflow...'
                className='bg-muted border-border text-foreground h-9'
              />
            </div>
            <Badge
              variant='outline'
              className={detail.isActive ? 'border-green-500 text-green-400' : 'border-border text-muted-foreground'}
            >
              {detail.isActive ? 'Hoạt động' : 'Tạm dừng'}
            </Badge>
            <Badge variant='outline' className='border-border text-muted-foreground'>
              {detail.statuses.length} trạng thái
            </Badge>
            <Badge variant='outline' className='border-border text-muted-foreground'>
              {detail.transitions.length} bước chuyển
            </Badge>
            {unboundCount > 0 && (
              <Badge variant='outline' className='border-yellow-500 text-yellow-400'>
                {unboundCount} chưa gắn
              </Badge>
            )}
            {detailQuery.isFetching && <Loader2 className='text-muted-foreground h-4 w-4 animate-spin' />}
          </div>

          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => restore(history.index - 1)}
              disabled={history.index <= 0}
              className='border-border text-foreground hover:bg-accent'
              title='Hoàn tác (chỉ bố cục sơ đồ)'
            >
              <Undo2 className='h-4 w-4' />
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => restore(history.index + 1)}
              disabled={history.index >= history.stack.length - 1}
              className='border-border text-foreground hover:bg-accent'
              title='Làm lại'
            >
              <Redo2 className='h-4 w-4' />
            </Button>

            <Separator orientation='vertical' className='bg-muted h-6' />

            <div className='bg-muted border-border flex gap-1 rounded border p-1'>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setTool('select')}
                className={tool === 'select' ? 'bg-accent text-primary' : 'text-muted-foreground'}
                title='Chọn'
              >
                <MousePointer2 className='h-4 w-4' />
              </Button>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setTool('pan')}
                className={tool === 'pan' ? 'bg-accent text-primary' : 'text-muted-foreground'}
                title='Kéo canvas'
              >
                <Move className='h-4 w-4' />
              </Button>
            </div>

            <Button
              variant='outline'
              size='sm'
              onClick={() => setShowGrid(!showGrid)}
              className={`border-border ${showGrid ? 'text-primary bg-primary/10' : 'text-muted-foreground'} hover:bg-accent`}
              title='Bật/tắt lưới'
            >
              <Grid3x3 className='h-4 w-4' />
            </Button>

            <Separator orientation='vertical' className='bg-muted h-6' />

            <Button variant='outline' size='sm' onClick={handleZoomOut} className='border-border text-foreground hover:bg-accent' title='Thu nhỏ'>
              <ZoomOut className='h-4 w-4' />
            </Button>
            <span className='text-muted-foreground w-12 text-center text-xs'>{Math.round(scale * 100)}%</span>
            <Button variant='outline' size='sm' onClick={handleZoomIn} className='border-border text-foreground hover:bg-accent' title='Phóng to'>
              <ZoomIn className='h-4 w-4' />
            </Button>
            <Button variant='outline' size='sm' onClick={handleZoomReset} className='border-border text-foreground hover:bg-accent' title='Đặt lại thu phóng'>
              <Maximize2 className='h-4 w-4' />
            </Button>

            <Separator orientation='vertical' className='bg-muted h-6' />

            <Button
              variant='outline'
              size='sm'
              onClick={() => importRef.current?.click()}
              className='border-border text-foreground hover:bg-accent'
              title='Nhập sơ đồ (JSON)'
            >
              <Upload className='h-4 w-4' />
            </Button>
            <input ref={importRef} type='file' accept='.json' onChange={handleImport} className='hidden' />
            <Button
              variant='outline'
              size='sm'
              onClick={handleExport}
              className='border-border text-foreground hover:bg-accent'
              title='Xuất sơ đồ (JSON)'
            >
              <Download className='h-4 w-4' />
            </Button>

            <Separator orientation='vertical' className='bg-muted h-6' />

            <Button
              size='sm'
              onClick={handleSave}
              disabled={saving}
              className='bg-primary hover:bg-primary/90 text-primary-foreground'
              title='Lưu tên và bố cục sơ đồ'
            >
              {saving ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Save className='mr-2 h-4 w-4' />}
              Lưu{dirty ? ' *' : ''}
            </Button>
          </div>
        </div>

        {/* Connection mode indicator */}
        {connectingFrom && (
          <div className='bg-primary/10 border-primary/50 mt-2 flex items-center gap-3 rounded border p-2'>
            <span className='text-primary text-sm'>
              Đang nối từ: <strong>{nodeById.get(connectingFrom)?.label}</strong>
            </span>
            <span className='text-muted-foreground text-xs'>→ Click vào nút đích để tạo đường nối</span>
            <Button
              size='sm'
              variant='outline'
              onClick={() => setConnectingFrom(null)}
              className='ml-auto border-red-500 text-red-400 hover:bg-red-900/20'
            >
              Huỷ
            </Button>
          </div>
        )}
      </div>

      <div className='flex flex-1 overflow-hidden'>
        {/* Left Sidebar - Node Palette */}
        <div className='bg-card border-border flex w-64 flex-col overflow-hidden border-r'>
          <div className='border-border flex-shrink-0 border-b p-3'>
            <h3 className='text-primary text-sm'>Thư viện nút</h3>
            <p className='text-muted-foreground mt-1 text-xs'>Kéo thả vào canvas</p>
          </div>

          <ScrollArea className='h-full flex-1'>
            <div className='space-y-4 p-3'>
              {categories.map((category) => (
                <div key={category}>
                  <div className='text-muted-foreground mb-2 flex items-center gap-2 text-xs'>
                    <div className='bg-admin h-px flex-1' />
                    <span>{category}</span>
                    <div className='bg-admin h-px flex-1' />
                  </div>
                  <div className='space-y-1.5'>
                    {nodeTemplates
                      .filter((n) => n.category === category)
                      .map((template) => (
                        <Card
                          key={template.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, template)}
                          className='border-border hover:bg-accent cursor-move p-2.5 transition-colors'
                        >
                          <div className='flex items-start gap-2'>
                            <div
                              className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded text-xs text-white'
                              style={{ backgroundColor: template.color }}
                            >
                              {template.label.charAt(0)}
                            </div>
                            <div className='min-w-0 flex-1'>
                              <div className='text-foreground text-xs leading-tight'>{template.label}</div>
                              <div className='text-muted-foreground mt-0.5 truncate text-[10px] leading-tight'>
                                {template.description}
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                  </div>
                </div>
              ))}

              <div className='text-muted-foreground space-y-1.5 border-t pt-3 text-[11px] leading-snug'>
                <div className='flex items-center gap-2'>
                  <span className='h-0.5 w-6' style={{ backgroundColor: CONNECTION_COLORS.bound }} /> Bước chuyển đã lưu
                </div>
                <div className='flex items-center gap-2'>
                  <span className='h-0 w-6 border-t-2 border-dashed' style={{ borderColor: CONNECTION_COLORS.pending }} />
                  Chưa lưu bước chuyển
                </div>
                <div className='flex items-center gap-2'>
                  <span className='h-0 w-6 border-t-2 border-dashed' style={{ borderColor: CONNECTION_COLORS.visual }} />
                  Minh hoạ (tới Kết thúc)
                </div>
                <p className='pt-1'>
                  Trạng thái và bước chuyển được lưu ngay khi bấm nút trong bảng thuộc tính; nút "Lưu" lưu tên và bố cục
                  sơ đồ.
                </p>
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Canvas */}
        <div className='bg-muted relative flex-1 overflow-hidden'>
          <div
            ref={canvasRef}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
            className='absolute inset-0 h-full w-full'
            style={{
              transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px) scale(${scale})`,
              transformOrigin: '0 0',
              backgroundImage: showGrid ? 'radial-gradient(circle, #1a1a2e 1px, transparent 1px)' : 'none',
              backgroundSize: showGrid ? '20px 20px' : 'auto',
              cursor: tool === 'pan' ? 'grab' : isPanning ? 'grabbing' : 'default',
            }}
          >
            {/* SVG for connections */}
            <svg className='pointer-events-none absolute inset-0 h-[10000px] w-[10000px] overflow-visible'>
              <defs>
                {Object.entries(CONNECTION_COLORS).map(([kind, color]) => (
                  <marker key={kind} id={`arrow-${kind}`} markerWidth='10' markerHeight='10' refX='9' refY='3' orient='auto'>
                    <polygon points='0 0, 10 3, 0 6' fill={color} />
                  </marker>
                ))}
              </defs>
              {connections.map(renderConnection)}
            </svg>

            {/* Nodes */}
            {nodes.map((node) => (
              <FlowchartNode
                key={node.id}
                node={node}
                isSelected={selectedNodeId === node.id}
                isConnecting={connectingFrom === node.id}
                onClick={() => handleNodeClick(node.id)}
                onDelete={() => requestDeleteNode(node.id)}
                onDuplicate={() => handleDuplicateNode(node.id)}
                onStartConnection={() => handleStartConnection(node.id)}
                onDragStart={(e) => handleNodeDragStart(e, node.id)}
                scale={scale}
                tags={nodeTags(node)}
              />
            ))}

            {/* Empty state */}
            {nodes.length === 0 && (
              <div
                className='pointer-events-none absolute inset-0 flex items-center justify-center'
                style={{ transform: `scale(${1 / scale})` }}
              >
                <div className='text-muted-foreground text-center'>
                  <div className='mb-4 text-6xl'>🎯</div>
                  <div className='mb-2 text-xl'>Kéo thả các nút vào đây</div>
                  <div className='text-sm'>Thêm nút Bắt đầu và các trạng thái, rồi nối chúng bằng bước chuyển</div>
                </div>
              </div>
            )}
          </div>

          {/* Mini-map */}
          <div className='bg-background/90 border-border absolute right-4 bottom-4 h-32 w-48 overflow-hidden rounded border'>
            <div className='relative h-full w-full'>
              <div className='text-muted-foreground absolute top-1 left-1 z-10 text-xs'>Mini-map</div>
              <svg className='h-full w-full'>
                {nodes.map((node) => (
                  <rect
                    key={node.id}
                    x={node.x / 20}
                    y={node.y / 20}
                    width={node.width / 20}
                    height={node.height / 20}
                    fill={node.color}
                    opacity={0.6}
                  />
                ))}
              </svg>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Properties */}
        <div className='bg-card border-border flex w-80 flex-col overflow-hidden border-l'>
          <div className='border-border flex-shrink-0 border-b p-3'>
            <h3 className='text-primary text-sm'>Thuộc tính</h3>
          </div>
          <div className='flex-1 overflow-hidden'>
            {selectedConnection ? (
              <TransitionConfigPanel
                workflowId={detail.id}
                connection={selectedConnection}
                fromNode={nodeById.get(selectedConnection.from)}
                toNode={nodeById.get(selectedConnection.to)}
                transition={
                  selectedConnection.transitionId !== undefined
                    ? transitionById.get(selectedConnection.transitionId)
                    : undefined
                }
                onBind={handleBindTransition}
                onDelete={requestDeleteConnection}
              />
            ) : (
              <NodeConfigPanel
                workflowId={detail.id}
                node={selectedNode}
                statuses={detail.statuses}
                boundStatusIds={boundStatusIds}
                onUpdate={handleUpdateNode}
                onDelete={requestDeleteNode}
              />
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={pendingDelete?.kind === 'connection' ? 'Xoá bước chuyển' : 'Xoá nút'}
        desc={pendingDeleteText}
        cancelBtnText='Huỷ'
        confirmText='Xoá'
        destructive
        isLoading={deleteStatus.isPending || deleteTransition.isPending}
        handleConfirm={confirmPendingDelete}
      />

      <ConfirmDialog
        open={leaveOpen}
        onOpenChange={setLeaveOpen}
        title='Rời trình thiết kế?'
        desc='Tên hoặc bố cục sơ đồ chưa được lưu. Trạng thái và bước chuyển đã tạo vẫn được giữ trên máy chủ.'
        cancelBtnText='Ở lại'
        confirmText='Rời đi'
        destructive
        handleConfirm={() => {
          setLeaveOpen(false)
          onBack?.()
        }}
      />
    </div>
  )
}
