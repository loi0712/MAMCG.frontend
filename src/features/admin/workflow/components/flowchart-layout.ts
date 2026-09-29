import type { WorkflowDetail, WorkflowStatus, WorkflowTransition } from '../../api/workflows'
import { FLOWCHART_SHAPES, type FlowchartShapeType } from './flowchart-shapes'

// ===========================================
// Bố cục sơ đồ quy trình (lưu vào WorkflowDefinition.layoutJson)
//
// - Nút "status": gắn với một trạng thái backend qua node.config.statusId
// - Nút "start"/"end": chỉ để hiển thị. Kết nối Bắt đầu → trạng thái là bước khởi tạo
//   (bước chuyển có fromStatusId = null); kết nối tới nút Kết thúc chỉ mang tính minh hoạ.
// - Kết nối giữa hai nút gắn với một bước chuyển backend qua connection.transitionId
// ===========================================

export type NodeKind = 'start' | 'end' | 'status'
export type Side = 'top' | 'right' | 'bottom' | 'left'

export interface NodeConfig {
  statusId?: number
}

export interface NodeData {
  id: string
  type: NodeKind
  label: string
  description?: string
  shapeType: FlowchartShapeType
  color: string
  strokeColor: string
  x: number
  y: number
  width: number
  height: number
  config?: NodeConfig
}

export interface Connection {
  id: string
  from: string
  to: string
  label?: string
  transitionId?: number
  // Lưu kèm để gắn lại bước chuyển khi id thay đổi (vd. sau khi nhân bản quy trình)
  actionId?: number
}

export interface FlowchartLayout {
  version: string
  nodes: NodeData[]
  connections: Connection[]
}

export const LAYOUT_VERSION = '2.0'

export const DEFAULT_STATUS_COLOR = '#fbbf24'
export const DEFAULT_STATUS_STROKE = '#d97706'

export const newId = (prefix: string) => `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`

export const START_NODE_TEMPLATE = {
  type: 'start' as const,
  label: 'Bắt đầu',
  shapeType: 'oval' as const,
  color: '#ec4899',
  strokeColor: '#be185d',
  width: 120,
  height: 60,
}

// ---------- Đọc JSON (không tin cậy) ----------

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)
const num = (v: unknown, fallback: number) => (typeof v === 'number' && Number.isFinite(v) ? v : fallback)
const str = (v: unknown) => (typeof v === 'string' ? v : undefined)
const intOrUndef = (v: unknown) => {
  const n = typeof v === 'string' ? Number(v) : v
  return typeof n === 'number' && Number.isInteger(n) ? n : undefined
}

const toNode = (raw: unknown): NodeData | null => {
  if (!isRecord(raw) || typeof raw.id !== 'string') return null
  // Bố cục cũ có nhiều loại nút (process, decision...): đều coi là nút trạng thái
  const type: NodeKind = raw.type === 'start' || raw.type === 'end' ? raw.type : 'status'
  const shape = str(raw.shapeType)
  const shapeType: FlowchartShapeType =
    shape && shape in FLOWCHART_SHAPES ? (shape as FlowchartShapeType) : type === 'status' ? 'process' : 'oval'
  const statusId = isRecord(raw.config) ? intOrUndef(raw.config.statusId) : undefined
  return {
    id: raw.id,
    type,
    label: str(raw.label) ?? '',
    description: str(raw.description),
    shapeType,
    color: str(raw.color) ?? DEFAULT_STATUS_COLOR,
    strokeColor: str(raw.strokeColor) ?? DEFAULT_STATUS_STROKE,
    x: num(raw.x, 0),
    y: num(raw.y, 0),
    width: num(raw.width, 140),
    height: num(raw.height, 70),
    config: type === 'status' && statusId !== undefined ? { statusId } : {},
  }
}

const toConnection = (raw: unknown): Connection | null => {
  if (!isRecord(raw) || typeof raw.id !== 'string' || typeof raw.from !== 'string' || typeof raw.to !== 'string')
    return null
  return {
    id: raw.id,
    from: raw.from,
    to: raw.to,
    label: str(raw.label),
    transitionId: intOrUndef(raw.transitionId),
    actionId: intOrUndef(raw.actionId),
  }
}

// Trả null nếu không đọc được; chấp nhận cả file export ({ name, nodes, connections })
export function parseLayout(json: string | null | undefined): (FlowchartLayout & { name?: string }) | null {
  if (!json) return null
  let data: unknown
  try {
    data = JSON.parse(json)
  } catch {
    return null
  }
  if (!isRecord(data) || !Array.isArray(data.nodes)) return null
  const nodes = data.nodes.map(toNode).filter((n): n is NodeData => n !== null)
  const ids = new Set(nodes.map((n) => n.id))
  const connections = (Array.isArray(data.connections) ? data.connections : [])
    .map(toConnection)
    .filter((c): c is Connection => c !== null && ids.has(c.from) && ids.has(c.to))
  return { version: str(data.version) ?? LAYOUT_VERSION, name: str(data.name), nodes, connections }
}

export const serializeLayout = (nodes: NodeData[], connections: Connection[]) =>
  JSON.stringify({ version: LAYOUT_VERSION, nodes, connections } satisfies FlowchartLayout)

// ---------- Đồng bộ bố cục với dữ liệu backend ----------

export const statusNodeFrom = (status: WorkflowStatus, x: number, y: number): NodeData => ({
  id: newId('node'),
  type: 'status',
  label: status.name,
  description: status.description ?? undefined,
  shapeType: 'process',
  color: status.color || DEFAULT_STATUS_COLOR,
  strokeColor: DEFAULT_STATUS_STROKE,
  x,
  y,
  width: 140,
  height: 70,
  config: { statusId: status.id },
})

// Id trạng thái nguồn/đích của một kết nối theo các nút hai đầu
// (undefined = chưa gắn trạng thái; null = nút Bắt đầu, tức bước khởi tạo)
export function endpointStatus(node: NodeData | undefined): number | null | undefined {
  if (!node) return undefined
  if (node.type === 'start') return null
  if (node.type === 'end') return undefined
  return node.config?.statusId
}

/**
 * Bỏ các liên kết không còn tồn tại ở backend (trạng thái/bước chuyển đã xoá),
 * gắn lại kết nối theo cặp trạng thái (+ hành động) khi id bước chuyển đổi.
 * Với `addMissing`, thêm nút cho trạng thái và kết nối cho bước chuyển chưa có trên sơ đồ.
 */
export function reconcileLayout(
  layout: { nodes: NodeData[]; connections: Connection[] } | null,
  detail: WorkflowDetail,
  addMissing: boolean
): { nodes: NodeData[]; connections: Connection[] } {
  const statusById = new Map(detail.statuses.map((s) => [s.id, s]))
  const boundStatuses = new Set<number>()

  const nodes: NodeData[] = (layout?.nodes ?? []).map((n) => {
    if (n.type !== 'status') return { ...n, config: {} }
    const sid = n.config?.statusId
    const status = sid !== undefined ? statusById.get(sid) : undefined
    if (!status || boundStatuses.has(status.id)) return { ...n, config: {} }
    boundStatuses.add(status.id)
    return { ...n, label: status.name, color: status.color || n.color, config: { statusId: status.id } }
  })

  const nodeById = new Map(nodes.map((n) => [n.id, n]))
  const claimed = new Set<number>()
  const transitionById = new Map(detail.transitions.map((t) => [t.id, t]))

  const matches = (t: WorkflowTransition, c: Connection) => {
    const from = endpointStatus(nodeById.get(c.from))
    const to = endpointStatus(nodeById.get(c.to))
    return from !== undefined && to != null && t.fromStatusId === from && t.toStatusId === to
  }

  const connections: Connection[] = (layout?.connections ?? [])
    .filter((c) => nodeById.has(c.from) && nodeById.has(c.to))
    .map((c) => {
      const current = c.transitionId !== undefined ? transitionById.get(c.transitionId) : undefined
      if (current && !claimed.has(current.id) && matches(current, c)) {
        claimed.add(current.id)
        return { ...c, actionId: current.actionId ?? undefined, label: current.actionName ?? c.label }
      }
      return { ...c, transitionId: undefined }
    })
    // Lượt 2: gắn lại kết nối chưa có bước chuyển theo cặp trạng thái (ưu tiên cùng hành động)
    .map((c) => {
      if (c.transitionId !== undefined) return c
      const candidates = detail.transitions.filter((t) => !claimed.has(t.id) && matches(t, c))
      const t = candidates.find((x) => x.actionId === c.actionId) ?? candidates[0]
      if (!t) return { ...c, label: undefined }
      claimed.add(t.id)
      return { ...c, transitionId: t.id, actionId: t.actionId ?? undefined, label: t.actionName ?? undefined }
    })

  if (!addMissing) return { nodes, connections }

  // Thêm nút cho trạng thái chưa có trên sơ đồ: xếp thành cột bên phải các nút hiện có
  const missing = detail.statuses.filter((s) => !boundStatuses.has(s.id))
  const baseX = nodes.length ? Math.max(...nodes.map((n) => n.x + n.width)) + 80 : 80
  const needsStart = detail.transitions.some((t) => t.fromStatusId == null && !claimed.has(t.id))
  let start = nodes.find((n) => n.type === 'start')
  const firstY = needsStart && !start ? 180 : 60
  missing.forEach((s, i) => {
    const node = statusNodeFrom(s, baseX, firstY + i * 140)
    nodes.push(node)
    nodeById.set(node.id, node)
  })

  const nodeForStatus = (sid: number | null) =>
    sid == null
      ? start
      : nodes.find((n) => n.type === 'status' && n.config?.statusId === sid)

  detail.transitions
    .filter((t) => !claimed.has(t.id))
    .forEach((t) => {
      if (t.fromStatusId == null && !start) {
        const target = nodeForStatus(t.toStatusId)
        const tx = target?.x ?? baseX
        const ty = target?.y ?? 180
        // Đặt phía trên trạng thái đích; không đủ chỗ thì đặt bên trái/phải
        const pos =
          ty >= 120
            ? { x: tx + 10, y: ty - 120 }
            : { x: tx >= 200 ? tx - 180 : tx + (target?.width ?? 140) + 60, y: ty }
        start = { ...START_NODE_TEMPLATE, id: newId('node'), ...pos, config: {} }
        nodes.push(start)
      }
      const from = nodeForStatus(t.fromStatusId)
      const to = t.toStatusId != null ? nodeForStatus(t.toStatusId) : undefined
      if (!from || !to) return
      claimed.add(t.id)
      connections.push({
        id: newId('conn'),
        from: from.id,
        to: to.id,
        transitionId: t.id,
        actionId: t.actionId ?? undefined,
        label: t.actionName ?? undefined,
      })
    })

  return { nodes, connections }
}

// ---------- Vẽ đường nối ----------

const point = (node: NodeData, side: Side) => {
  switch (side) {
    case 'top':
      return { x: node.x + node.width / 2, y: node.y }
    case 'right':
      return { x: node.x + node.width, y: node.y + node.height / 2 }
    case 'bottom':
      return { x: node.x + node.width / 2, y: node.y + node.height }
    case 'left':
      return { x: node.x, y: node.y + node.height / 2 }
  }
}

const normal: Record<Side, { x: number; y: number }> = {
  top: { x: 0, y: -1 },
  right: { x: 1, y: 0 },
  bottom: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
}

/**
 * Đường cong giữa hai nút. Chọn cạnh theo vị trí tương đối; chiều ngược (lên trên / sang trái)
 * đi vòng ra ngoài để không đè lên kết nối chiều xuôi giữa cùng hai nút.
 */
export function connectionPath(from: NodeData, to: NodeData) {
  const dx = to.x + to.width / 2 - (from.x + from.width / 2)
  const dy = to.y + to.height / 2 - (from.y + from.height / 2)
  let sides: [Side, Side]
  if (Math.abs(dy) >= Math.abs(dx)) sides = dy >= 0 ? ['bottom', 'top'] : ['right', 'right']
  else sides = dx >= 0 ? ['right', 'left'] : ['bottom', 'bottom']

  const p0 = point(from, sides[0])
  const p3 = point(to, sides[1])
  const dist = Math.hypot(p3.x - p0.x, p3.y - p0.y)
  const bend = sides[0] === sides[1] ? 60 + dist * 0.15 : Math.max(30, dist * 0.35)
  const p1 = { x: p0.x + normal[sides[0]].x * bend, y: p0.y + normal[sides[0]].y * bend }
  const p2 = { x: p3.x + normal[sides[1]].x * bend, y: p3.y + normal[sides[1]].y * bend }

  return {
    d: `M ${p0.x} ${p0.y} C ${p1.x} ${p1.y}, ${p2.x} ${p2.y}, ${p3.x} ${p3.y}`,
    // Điểm giữa đường Bezier (t = 0.5) để đặt nhãn
    mid: { x: (p0.x + 3 * p1.x + 3 * p2.x + p3.x) / 8, y: (p0.y + 3 * p1.y + 3 * p2.y + p3.y) / 8 },
  }
}
