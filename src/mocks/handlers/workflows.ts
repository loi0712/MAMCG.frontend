import { http, HttpResponse } from 'msw'
import { apiUrls } from '@/api/config/endpoints'
import type {
  WorkflowAction,
  WorkflowActionRequest,
  WorkflowDetail,
  WorkflowListItem,
  WorkflowRequest,
  WorkflowStatus,
  WorkflowStatusRequest,
  WorkflowTransition,
  WorkflowTransitionRequest,
} from '@/features/admin/api/workflows'
import { notificationTypes } from './notification-types'
import { api, notFound, paginate } from './utils'

// Mock quản trị quy trình (WorkflowDefinitionController): dữ liệu trong bộ nhớ,
// áp dụng các ràng buộc chính của WorkflowAdminService.

const id = ':id' as unknown as number
const now = () => new Date().toISOString()
let seq = 500
const nextId = () => ++seq

interface MockWorkflow {
  id: number
  name: string
  description: string | null
  isActive: boolean
  usageKey: string | null
  layoutJson: string | null
  createdAt: string
  modifiedAt: string
  // Số nội dung đang chạy (giả lập): > 0 thì không cho xoá
  activeItemCount: number
}

type MockStatus = Omit<WorkflowStatus, 'itemCount'>
type MockTransition = Omit<WorkflowTransition, 'fromStatusName' | 'toStatusName' | 'actionName'>

const actions: WorkflowAction[] = [
  { id: 1, name: 'Gửi duyệt', color: '#06b6d4', icon: null, displayOrder: 1, description: null },
  { id: 2, name: 'Duyệt', color: '#22c55e', icon: null, displayOrder: 2, description: null },
  { id: 3, name: 'Trả lại', color: '#ef4444', icon: null, displayOrder: 3, description: null },
]

const workflows: MockWorkflow[] = [
  { id: 1, name: 'Quy trình duyệt tin', description: 'Biên tập → duyệt → xuất bản', isActive: true, usageKey: 'asset', layoutJson: null, createdAt: now(), modifiedAt: now(), activeItemCount: 2 },
  { id: 2, name: 'Quy trình lưu trữ', description: null, isActive: false, usageKey: null, layoutJson: null, createdAt: now(), modifiedAt: now(), activeItemCount: 0 },
]

// Dùng chung với mock "Công việc của tôi" (tasks.ts) và loại thông báo
export const statuses: MockStatus[] = [
  { id: 1, workflowId: 1, name: 'Nháp', color: '#64748b', displayOrder: 1, description: null, isInitial: true, isFinal: false },
  { id: 2, workflowId: 1, name: 'Chờ duyệt', color: '#f59e0b', displayOrder: 2, description: null, isInitial: false, isFinal: false },
  { id: 3, workflowId: 1, name: 'Đã duyệt', color: '#22c55e', displayOrder: 3, description: null, isInitial: false, isFinal: true },
]

export const transitions: MockTransition[] = [
  { id: 1, workflowId: 1, fromStatusId: null, toStatusId: 1, actionId: 1, deadlineHours: null, assignedUserGroupId: null, requireUpload: false, notificationTypeId: null },
  { id: 2, workflowId: 1, fromStatusId: 1, toStatusId: 2, actionId: 1, deadlineHours: 24, assignedUserGroupId: '2', requireUpload: false, notificationTypeId: 1 },
  { id: 3, workflowId: 1, fromStatusId: 2, toStatusId: 3, actionId: 2, deadlineHours: null, assignedUserGroupId: '3', requireUpload: true, notificationTypeId: null },
  { id: 4, workflowId: 1, fromStatusId: 2, toStatusId: 1, actionId: 3, deadlineHours: 4, assignedUserGroupId: null, requireUpload: false, notificationTypeId: null },
]

// Giả lập: trạng thái "Chờ duyệt" của quy trình 1 đang có nội dung
const itemCount = (statusId: number) => (statusId === 2 ? 2 : 0)

const error = (status: number, title: string) => HttpResponse.json({ title, status }, { status })
const clean = (v: string | null | undefined) => (v && v.trim() ? v.trim() : null)

const toTransitionDto = (t: MockTransition): WorkflowTransition => ({
  ...t,
  fromStatusName: statuses.find((s) => s.id === t.fromStatusId)?.name ?? null,
  toStatusName: statuses.find((s) => s.id === t.toStatusId)?.name ?? null,
  actionName: actions.find((a) => a.id === t.actionId)?.name ?? null,
})

const toStatusDto = (s: MockStatus): WorkflowStatus => ({ ...s, itemCount: itemCount(s.id) })

// Giống backend: mục đích hợp lệ, quy trình phải hoạt động, mỗi mục đích chỉ một quy trình
const validateUsage = (key: string | null | undefined, isActive: boolean, excludeId?: number) => {
  const usage = key?.trim().toLowerCase() || null
  if (!usage) return null
  if (!['asset', 'cg-scene'].includes(usage)) return error(400, 'Mục đích sử dụng không hợp lệ. Giá trị cho phép: asset, cg-scene.')
  if (!isActive)
    return error(
      400,
      workflows.find((x) => x.id === excludeId)?.usageKey === usage
        ? `Quy trình đang được dùng cho "${usage}" nên không thể ngừng hoạt động; gán quy trình khác trước.`
        : `Chỉ gán được quy trình đang hoạt động cho "${usage}"; hãy bật Hoạt động.`
    )
  const other = workflows.find((x) => x.usageKey === usage && x.id !== excludeId)
  if (other) return error(409, `Mục đích "${usage}" đang được gán cho quy trình "${other.name}"; bỏ gán ở quy trình đó trước.`)
  return usage
}

const toListItem = (w: MockWorkflow): WorkflowListItem => ({
  id: w.id,
  name: w.name,
  description: w.description,
  isActive: w.isActive,
  usageKey: w.usageKey,
  statusCount: statuses.filter((s) => s.workflowId === w.id).length,
  transitionCount: transitions.filter((t) => t.workflowId === w.id).length,
  activeItemCount: w.activeItemCount,
  createdAt: w.createdAt,
  modifiedAt: w.modifiedAt,
})

const toDetail = (w: MockWorkflow): WorkflowDetail => ({
  id: w.id,
  name: w.name,
  description: w.description,
  isActive: w.isActive,
  usageKey: w.usageKey,
  layoutJson: w.layoutJson,
  createdAt: w.createdAt,
  modifiedAt: w.modifiedAt,
  statuses: statuses
    .filter((s) => s.workflowId === w.id)
    .sort((a, b) => (a.displayOrder ?? Infinity) - (b.displayOrder ?? Infinity) || a.id - b.id)
    .map(toStatusDto),
  transitions: transitions.filter((t) => t.workflowId === w.id).map(toTransitionDto),
})

const findWorkflow = (wid: unknown) => workflows.find((w) => w.id === Number(wid))
const touch = (wid: number | null) => {
  const w = workflows.find((x) => x.id === wid)
  if (w) w.modifiedAt = now()
}

const validateWorkflow = (data: WorkflowRequest, exceptId?: number) => {
  const name = data.name?.trim()
  if (!name) return error(400, 'Tên quy trình không được để trống.')
  if (workflows.some((w) => w.name === name && w.id !== exceptId)) return error(409, `Tên quy trình '${name}' đã tồn tại.`)
  return null
}

const validateStatus = (workflowId: number, data: WorkflowStatusRequest, exceptId?: number) => {
  const name = data.name?.trim()
  if (!name) return error(400, 'Tên trạng thái không được để trống.')
  if (data.isInitial && data.isFinal) return error(400, 'Trạng thái không thể vừa là bắt đầu vừa là kết thúc.')
  if (statuses.some((s) => s.workflowId === workflowId && s.name === name && s.id !== exceptId))
    return error(409, `Trạng thái '${name}' đã tồn tại trong quy trình.`)
  return null
}

const clearOtherInitial = (workflowId: number, keepId: number) =>
  statuses.forEach((s) => {
    if (s.workflowId === workflowId && s.id !== keepId) s.isInitial = false
  })

const validateTransition = (workflowId: number, data: WorkflowTransitionRequest, exceptId?: number) => {
  if (data.fromStatusId === data.toStatusId) return error(400, 'Trạng thái nguồn và đích phải khác nhau.')
  if (data.deadlineHours != null && (data.deadlineHours < 0 || data.deadlineHours > 24 * 365))
    return error(400, `Thời hạn phải trong khoảng 0 - ${24 * 365} giờ.`)
  const ids = [data.toStatusId, ...(data.fromStatusId != null ? [data.fromStatusId] : [])]
  if (!ids.every((sid) => statuses.some((s) => s.id === sid && s.workflowId === workflowId)))
    return error(400, 'Trạng thái nguồn/đích không thuộc quy trình này.')
  if (!actions.some((a) => a.id === data.actionId)) return error(400, `Không tìm thấy hành động ${data.actionId}.`)
  if (data.notificationTypeId != null && !notificationTypes.some((t) => t.id === data.notificationTypeId))
    return error(400, `Không tìm thấy loại thông báo ${data.notificationTypeId}.`)
  const others = transitions.filter((t) => t.workflowId === workflowId && t.id !== exceptId)
  if (data.fromStatusId == null) {
    if (others.some((t) => t.fromStatusId == null))
      return error(409, 'Quy trình đã có bước khởi tạo (không có trạng thái nguồn).')
  } else if (others.some((t) => t.fromStatusId === data.fromStatusId && t.actionId === data.actionId)) {
    return error(409, 'Đã có bước chuyển với cùng trạng thái nguồn và hành động.')
  }
  return null
}

const validateAction = (data: WorkflowActionRequest, exceptId?: number) => {
  const name = data.name?.trim()
  if (!name) return error(400, 'Tên hành động không được để trống.')
  if (actions.some((a) => a.name === name && a.id !== exceptId)) return error(409, `Hành động '${name}' đã tồn tại.`)
  return null
}

const transitionFields = (data: WorkflowTransitionRequest) => ({
  fromStatusId: data.fromStatusId ?? null,
  toStatusId: data.toStatusId,
  actionId: data.actionId,
  deadlineHours: data.deadlineHours ?? null,
  assignedUserGroupId: clean(data.assignedUserGroupId),
  requireUpload: !!data.requireUpload,
  notificationTypeId: data.notificationTypeId ?? null,
})

const statusFields = (data: WorkflowStatusRequest) => ({
  name: data.name.trim(),
  color: clean(data.color),
  displayOrder: data.displayOrder ?? null,
  description: clean(data.description),
  isInitial: !!data.isInitial,
  isFinal: !!data.isFinal,
})

const actionFields = (data: WorkflowActionRequest) => ({
  name: data.name.trim(),
  color: clean(data.color),
  icon: clean(data.icon),
  displayOrder: data.displayOrder ?? null,
  description: clean(data.description),
})

const w = apiUrls.workflow

// Thứ tự quan trọng: các đường dẫn cố định (paged, actions) phải đứng trước /:id
export const workflowHandlers = [
  // ---------- Hành động ----------
  http.get(api(w.actions), () =>
    HttpResponse.json(
      [...actions].sort((a, b) => (a.displayOrder ?? Infinity) - (b.displayOrder ?? Infinity) || a.id - b.id)
    )
  ),

  http.post(api(w.actions), async ({ request }) => {
    const data = (await request.json()) as WorkflowActionRequest
    const invalid = validateAction(data)
    if (invalid) return invalid
    const created: WorkflowAction = { id: nextId(), ...actionFields(data) }
    actions.push(created)
    return HttpResponse.json(created)
  }),

  http.put(api(w.action(id)), async ({ params, request }) => {
    const action = actions.find((a) => a.id === Number(params.id))
    if (!action) return notFound()
    const data = (await request.json()) as WorkflowActionRequest
    const invalid = validateAction(data, action.id)
    if (invalid) return invalid
    Object.assign(action, actionFields(data))
    return HttpResponse.json(action)
  }),

  http.delete(api(w.action(id)), ({ params }) => {
    const index = actions.findIndex((a) => a.id === Number(params.id))
    if (index < 0) return notFound()
    if (transitions.some((t) => t.actionId === actions[index].id))
      return error(409, 'Hành động đang được dùng trong quy trình hoặc lịch sử xử lý, không thể xoá.')
    actions.splice(index, 1)
    return new HttpResponse(null, { status: 204 })
  }),

  // ---------- Quy trình ----------
  http.get(api(w.list), ({ request }) => {
    const url = new URL(request.url)
    const isActive = url.searchParams.get('isActive')
    const source = workflows
      .filter((x) => isActive === null || String(x.isActive) === isActive)
      .sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt) || b.id - a.id)
    const { page, totalCount } = paginate(source, url, (x) => `${x.name} ${x.description ?? ''}`)
    return HttpResponse.json({ items: page.map(toListItem), totalCount })
  }),

  http.post(api(w.create), async ({ request }) => {
    const data = (await request.json()) as WorkflowRequest
    const invalid = validateWorkflow(data)
    if (invalid) return invalid
    const usage = validateUsage(data.usageKey, data.isActive ?? true)
    if (typeof usage !== 'string' && usage !== null) return usage
    const created: MockWorkflow = {
      id: nextId(),
      name: data.name.trim(),
      description: clean(data.description),
      isActive: data.isActive ?? true,
      usageKey: usage,
      layoutJson: null,
      createdAt: now(),
      modifiedAt: now(),
      activeItemCount: 0,
    }
    workflows.push(created)
    return HttpResponse.json(toDetail(created))
  }),

  http.put(api(w.update(id)), async ({ params, request }) => {
    const workflow = findWorkflow(params.id)
    if (!workflow) return notFound()
    const data = (await request.json()) as WorkflowRequest
    const invalid = validateWorkflow(data, workflow.id)
    if (invalid) return invalid
    const usage = validateUsage(data.usageKey ?? workflow.usageKey, data.isActive, workflow.id)
    if (typeof usage !== 'string' && usage !== null) return usage
    Object.assign(workflow, {
      usageKey: usage,
      name: data.name.trim(),
      description: clean(data.description),
      isActive: data.isActive,
      modifiedAt: now(),
    })
    return HttpResponse.json(toDetail(workflow))
  }),

  http.put(api(w.layout(id)), async ({ params, request }) => {
    const workflow = findWorkflow(params.id)
    if (!workflow) return notFound()
    const { layoutJson } = (await request.json()) as { layoutJson: string | null }
    if (layoutJson?.trim()) {
      try {
        JSON.parse(layoutJson)
      } catch {
        return error(400, 'Bố cục sơ đồ không phải JSON hợp lệ.')
      }
    }
    workflow.layoutJson = layoutJson?.trim() ? layoutJson : null
    workflow.modifiedAt = now()
    return new HttpResponse(null, { status: 204 })
  }),

  http.delete(api(w.delete(id)), ({ params }) => {
    const index = workflows.findIndex((x) => x.id === Number(params.id))
    if (index < 0) return notFound()
    if (workflows[index].usageKey)
      return error(409, `Quy trình đang được dùng cho "${workflows[index].usageKey}"; hãy gán quy trình khác trước khi xoá.`)
    const running = workflows[index].activeItemCount
    if (running > 0)
      return error(
        409,
        `Quy trình đang có ${running} nội dung chưa hoàn thành, không thể xoá. Hãy ngừng kích hoạt thay vì xoá.`
      )
    const [removed] = workflows.splice(index, 1)
    for (let i = transitions.length - 1; i >= 0; i--) if (transitions[i].workflowId === removed.id) transitions.splice(i, 1)
    for (let i = statuses.length - 1; i >= 0; i--) if (statuses[i].workflowId === removed.id) statuses.splice(i, 1)
    return new HttpResponse(null, { status: 204 })
  }),

  http.post(api(w.clone(id)), ({ params, request }) => {
    const source = findWorkflow(params.id)
    if (!source) return notFound()
    const requested = new URL(request.url).searchParams.get('name')?.trim()
    let name = requested || `${source.name} (bản sao)`
    for (let i = 2; !requested && workflows.some((x) => x.name === name); i++) name = `${source.name} (bản sao ${i})`
    if (workflows.some((x) => x.name === name)) return error(409, `Tên quy trình '${name}' đã tồn tại.`)

    const copy: MockWorkflow = { ...source, id: nextId(), name, isActive: false, usageKey: null, createdAt: now(), modifiedAt: now(), activeItemCount: 0 }
    workflows.push(copy)
    const map = new Map<number, number>()
    statuses
      .filter((s) => s.workflowId === source.id)
      .forEach((s) => {
        const ns = { ...s, id: nextId(), workflowId: copy.id }
        map.set(s.id, ns.id)
        statuses.push(ns)
      })
    transitions
      .filter((t) => t.workflowId === source.id)
      .forEach((t) =>
        transitions.push({
          ...t,
          id: nextId(),
          workflowId: copy.id,
          fromStatusId: t.fromStatusId != null ? (map.get(t.fromStatusId) ?? t.fromStatusId) : null,
          toStatusId: t.toStatusId != null ? (map.get(t.toStatusId) ?? t.toStatusId) : null,
        })
      )
    // Như backend: đổi "statusId" trong bố cục sang id mới (transitionId giữ nguyên)
    copy.layoutJson =
      source.layoutJson?.replace(/"statusId":\s*(\d+)/g, (m, old: string) =>
        map.has(Number(old)) ? `"statusId":${map.get(Number(old))}` : m
      ) ?? null
    return HttpResponse.json(toDetail(copy))
  }),

  // ---------- Trạng thái ----------
  http.post(api(w.addStatus(id)), async ({ params, request }) => {
    const workflow = findWorkflow(params.id)
    if (!workflow) return notFound()
    const data = (await request.json()) as WorkflowStatusRequest
    const invalid = validateStatus(workflow.id, data)
    if (invalid) return invalid
    const created: MockStatus = { id: nextId(), workflowId: workflow.id, ...statusFields(data) }
    statuses.push(created)
    if (created.isInitial) clearOtherInitial(workflow.id, created.id)
    touch(workflow.id)
    return HttpResponse.json(toStatusDto(created))
  }),

  http.put(api(w.status(id)), async ({ params, request }) => {
    const status = statuses.find((s) => s.id === Number(params.id))
    if (!status || status.workflowId == null) return notFound()
    const data = (await request.json()) as WorkflowStatusRequest
    const invalid = validateStatus(status.workflowId, data, status.id)
    if (invalid) return invalid
    Object.assign(status, statusFields(data))
    if (status.isInitial) clearOtherInitial(status.workflowId, status.id)
    touch(status.workflowId)
    return HttpResponse.json(toStatusDto(status))
  }),

  http.delete(api(w.status(id)), ({ params }) => {
    const index = statuses.findIndex((s) => s.id === Number(params.id))
    if (index < 0) return notFound()
    const status = statuses[index]
    if (itemCount(status.id) > 0)
      return error(409, 'Trạng thái đã được sử dụng bởi nội dung trong quy trình, không thể xoá.')
    for (let i = transitions.length - 1; i >= 0; i--)
      if (transitions[i].fromStatusId === status.id || transitions[i].toStatusId === status.id) transitions.splice(i, 1)
    statuses.splice(index, 1)
    touch(status.workflowId)
    return new HttpResponse(null, { status: 204 })
  }),

  // ---------- Bước chuyển ----------
  http.post(api(w.addTransition(id)), async ({ params, request }) => {
    const workflow = findWorkflow(params.id)
    if (!workflow) return notFound()
    const data = (await request.json()) as WorkflowTransitionRequest
    const invalid = validateTransition(workflow.id, data)
    if (invalid) return invalid
    const created: MockTransition = { id: nextId(), workflowId: workflow.id, ...transitionFields(data) }
    transitions.push(created)
    touch(workflow.id)
    return HttpResponse.json(toTransitionDto(created))
  }),

  http.put(api(w.transition(id)), async ({ params, request }) => {
    const transition = transitions.find((t) => t.id === Number(params.id))
    if (!transition) return notFound()
    const data = (await request.json()) as WorkflowTransitionRequest
    const invalid = validateTransition(transition.workflowId, data, transition.id)
    if (invalid) return invalid
    Object.assign(transition, transitionFields(data))
    touch(transition.workflowId)
    return HttpResponse.json(toTransitionDto(transition))
  }),

  http.delete(api(w.transition(id)), ({ params }) => {
    const index = transitions.findIndex((t) => t.id === Number(params.id))
    if (index < 0) return notFound()
    const [removed] = transitions.splice(index, 1)
    touch(removed.workflowId)
    return new HttpResponse(null, { status: 204 })
  }),

  // Chi tiết đặt cuối để không nuốt các đường dẫn cố định ở trên
  http.get(api(w.details(id)), ({ params }) => {
    const workflow = findWorkflow(params.id)
    return workflow ? HttpResponse.json(toDetail(workflow)) : notFound()
  }),
]
