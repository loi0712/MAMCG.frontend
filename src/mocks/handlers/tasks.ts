import { http, HttpResponse } from 'msw'
import { apiUrls } from '@/api/config/endpoints'
import type {
  MyTask,
  MyTaskStatusCount,
  WorkflowHistoryEntry,
  WorkflowVersionDetail,
} from '@/features/tasks/api/tasks'
import { groups, users } from '../db'
import { api, notFound } from './utils'
import { statuses } from './workflows'

// Mock "Công việc của tôi" + lịch sử/phiên bản (WorkflowController), quy tắc giống WorkflowTaskService:
// việc của tôi = chưa ở trạng thái kết thúc, AssignedTo chứa id người dùng hoặc id nhóm của người dùng.

const itemId = ':id' as unknown as number
const version = ':version' as unknown as number

// Người dùng mock đang đăng nhập (auth mock mặc định trả users[0] — admin)
const MOCK_USER_ID = users[0]?.id ?? 'u-1'
const WORKFLOW = { id: 1, name: 'Quy trình duyệt tin' }

const hoursFromNow = (h: number) => new Date(Date.now() + h * 3_600_000).toISOString()

interface MockItem {
  id: number
  title: string
  content: string
  statusId: number
  assignedTo: string
  author: string
  referenceType: string | null
  referenceId: string | null
  assignedAt: string
  deadline: string | null
}

const items: MockItem[] = [
  { id: 101, title: 'TS-0001', content: 'Bar 2 dòng', statusId: 2, assignedTo: '1', author: 'u-3', referenceType: 'asset', referenceId: '1', assignedAt: hoursFromNow(-30), deadline: hoursFromNow(-6) },
  { id: 102, title: 'TS-0002', content: 'Logo góc', statusId: 1, assignedTo: MOCK_USER_ID, author: MOCK_USER_ID, referenceType: 'asset', referenceId: '2', assignedAt: hoursFromNow(-2), deadline: hoursFromNow(20) },
  { id: 103, title: 'CG_TS-0003', content: 'CG_TS-0003', statusId: 2, assignedTo: `${MOCK_USER_ID},3`, author: 'u-4', referenceType: 'cg-scene', referenceId: '5', assignedAt: hoursFromNow(-5), deadline: null },
  { id: 104, title: 'TS-0004', content: 'Nền thời tiết', statusId: 2, assignedTo: 'u-2', author: 'u-3', referenceType: 'asset', referenceId: '4', assignedAt: hoursFromNow(-1), deadline: hoursFromNow(10) },
  { id: 105, title: 'TS-0005', content: 'Đã duyệt xong', statusId: 3, assignedTo: MOCK_USER_ID, author: 'u-3', referenceType: 'asset', referenceId: '5', assignedAt: hoursFromNow(-50), deadline: null },
  // Nội dung cũ, chưa gắn đối tượng nguồn
  { id: 106, title: 'TS-0006', content: 'Khung phỏng vấn', statusId: 1, assignedTo: '1', author: 'u-2', referenceType: null, referenceId: null, assignedAt: hoursFromNow(-80), deadline: hoursFromNow(-1) },
  ...Array.from({ length: 22 }, (_, i): MockItem => ({
    id: 200 + i,
    title: `TS-${String(100 + i).padStart(4, '0')}`,
    content: `Đồ hoạ bản tin #${i + 1}`,
    statusId: i % 3 === 0 ? 1 : 2,
    assignedTo: i % 2 === 0 ? MOCK_USER_ID : '1',
    author: 'u-3',
    referenceType: 'asset',
    referenceId: String(10 + i),
    assignedAt: hoursFromNow(-i - 3),
    deadline: i % 4 === 0 ? null : hoursFromNow(48 - i),
  })),
]

const myKeys = () => [MOCK_USER_ID, ...groups.filter((g) => g.users?.some((u) => u.id === MOCK_USER_ID)).map((g) => String(g.id))]
const split = (v: string | null) => (v ?? '').split(',').map((s) => s.trim()).filter(Boolean)
const isFinal = (statusId: number) => statuses.find((s) => s.id === statusId)?.isFinal ?? false
const isOverdue = (i: MockItem) => !!i.deadline && new Date(i.deadline).getTime() < Date.now()

const openItems = () => {
  const keys = myKeys()
  return items.filter((i) => !isFinal(i.statusId) && split(i.assignedTo).some((a) => keys.includes(a)))
}

const toTask = (i: MockItem): MyTask => {
  const status = statuses.find((s) => s.id === i.statusId)
  return {
    id: i.id,
    title: i.title,
    content: i.content,
    workflowId: WORKFLOW.id,
    workflowName: WORKFLOW.name,
    statusId: i.statusId,
    statusName: status?.name ?? `#${i.statusId}`,
    statusColor: status?.color ?? null,
    assignedTo: i.assignedTo,
    author: i.author,
    assignedAt: i.assignedAt,
    deadline: i.deadline,
    isOverdue: isOverdue(i),
    referenceType: i.referenceType,
    referenceId: i.referenceId,
    createdAt: i.assignedAt,
    modifiedAt: i.assignedAt,
  }
}

const userName = (id: string | null) => {
  if (!id) return null
  if (/^\d+$/.test(id)) return groups.find((g) => String(g.id) === id)?.name ?? id
  return users.find((u) => u.id === id)?.fullName ?? id
}

const historyOf = (i: MockItem): WorkflowHistoryEntry[] => {
  const s = (sid: number | null) => statuses.find((x) => x.id === sid)
  const entry = (n: number, actor: string, action: string, color: string, from: number | null, to: number, assigned: string, comment: string | null, hoursAgo: number, deadline: string | null): WorkflowHistoryEntry => ({
    id: i.id * 10 + n,
    actorId: actor,
    actorName: userName(actor),
    actionId: n,
    actionName: action,
    actionColor: color,
    fromStatusId: from,
    fromStatusName: s(from)?.name ?? null,
    fromStatusColor: s(from)?.color ?? null,
    toStatusId: to,
    toStatusName: s(to)?.name ?? null,
    toStatusColor: s(to)?.color ?? null,
    assignedTo: assigned,
    assignedToNames: split(assigned).map(userName).join(', '),
    comment,
    actionTime: hoursFromNow(-hoursAgo),
    deadline,
  })
  const list = [entry(1, i.author, 'Gửi duyệt', '#06b6d4', null, 1, i.author, null, 40, null)]
  if (i.statusId >= 2) list.push(entry(2, i.author, 'Gửi duyệt', '#06b6d4', 1, 2, i.assignedTo, 'Nhờ duyệt giúp bản cập nhật màu nền.', 30, i.deadline))
  if (i.statusId === 3) list.push(entry(3, 'u-2', 'Duyệt', '#22c55e', 2, 3, i.assignedTo, 'Đạt.', 5, null))
  return list
}

const snapshot = (i: MockItem, v: number) =>
  JSON.stringify({
    Id: Number(i.referenceId ?? 0),
    Name: i.title,
    FilePath: `assets/${i.title}${v > 1 ? `_v${v}` : ''}.png`,
    Extension: '.png',
    Size: 120_000 + v * 1500,
    IsApproved: false,
    Panels: [
      {
        PanelName: 'Thông tin chung',
        Fields: [
          { Id: 1, FieldName: 'ID', DisplayName: 'Mã', Value: i.title },
          { Id: 2, FieldName: 'AssetType', DisplayName: 'Loại đồ hoạ', Value: i.content },
          { Id: 3, FieldName: 'Color', DisplayName: 'Màu nền', Value: v === 1 ? '#003366' : '#004488' },
        ],
      },
      {
        PanelName: 'Ghi chú',
        Fields: [
          { Id: 4, FieldName: 'Note', DisplayName: 'Ghi chú', Value: v === 1 ? '' : 'Đã sửa theo góp ý' },
          ...(v >= 3 ? [{ Id: 5, FieldName: 'Duration', DisplayName: 'Thời lượng', Value: '10s' }] : []),
        ],
      },
    ],
  })

const versionsOf = (i: MockItem): WorkflowVersionDetail[] =>
  historyOf(i).map((h, idx) => ({
    id: i.id * 10 + idx + 1,
    versionNumber: idx + 1,
    createdAt: h.actionTime ?? new Date().toISOString(),
    contentSnapshot: snapshot(i, idx + 1),
    diff: null,
  }))

// Quyền xem lịch sử: người liên quan (tác giả, người/nhóm được giao) hoặc quản trị viên (người dùng mock là admin)
const findViewable = (rawId: unknown) => {
  const item = items.find((i) => i.id === Number(rawId))
  if (!item) return { error: HttpResponse.json({ title: `Không tìm thấy nội dung ${rawId} trong quy trình.`, status: 404 }, { status: 404 }) }
  return { item }
}

const t = apiUrls.workflowTask

export const taskHandlers = [
  http.get(api(t.summary), () => {
    const open = openItems()
    const counts = new Map<number, number>()
    open.forEach((i) => counts.set(i.statusId, (counts.get(i.statusId) ?? 0) + 1))
    const list: MyTaskStatusCount[] = [...counts.entries()]
      .map(([statusId, count]) => {
        const s = statuses.find((x) => x.id === statusId)
        return { statusId, statusName: s?.name ?? `#${statusId}`, color: s?.color ?? null, displayOrder: s?.displayOrder ?? null, workflowName: WORKFLOW.name, count }
      })
      .sort((a, b) => (a.displayOrder ?? 99) - (b.displayOrder ?? 99))
    return HttpResponse.json({ total: open.length, overdue: open.filter(isOverdue).length, statuses: list })
  }),

  http.get(api(t.myTasks), ({ request }) => {
    const url = new URL(request.url)
    const statusId = Number(url.searchParams.get('statusId')) || undefined
    const overdue = url.searchParams.get('overdue')
    const term = (url.searchParams.get('search') ?? '').trim().toLowerCase()
    const pageNumber = Math.max(1, Number(url.searchParams.get('pageNumber') ?? 1) || 1)
    const pageSize = Math.min(200, Math.max(1, Number(url.searchParams.get('pageSize') ?? 20) || 1))

    const filtered = openItems()
      .filter((i) => !statusId || i.statusId === statusId)
      .filter((i) => overdue === null || String(isOverdue(i)) === overdue)
      .filter((i) => !term || `${i.title} ${i.content}`.toLowerCase().includes(term))
      // Có hạn trước (hạn gần nhất lên đầu), sau đó mới giao trước
      .sort((a, b) =>
        a.deadline && b.deadline
          ? a.deadline.localeCompare(b.deadline)
          : a.deadline ? -1 : b.deadline ? 1 : b.assignedAt.localeCompare(a.assignedAt)
      )
    const start = (pageNumber - 1) * pageSize
    return HttpResponse.json({ items: filtered.slice(start, start + pageSize).map(toTask), totalCount: filtered.length })
  }),

  http.get(api(t.history(itemId)), ({ params }) => {
    const { item, error } = findViewable(params.id)
    return item ? HttpResponse.json(historyOf(item)) : error
  }),

  http.get(api(t.versions(itemId)), ({ params }) => {
    const { item, error } = findViewable(params.id)
    if (!item) return error
    return HttpResponse.json(
      versionsOf(item)
        .map((v) => ({ id: v.id, versionNumber: v.versionNumber, createdAt: v.createdAt, hasSnapshot: !!v.contentSnapshot }))
        .reverse()
    )
  }),

  http.get(api(t.version(itemId, version)), ({ params }) => {
    const { item, error } = findViewable(params.id)
    if (!item) return error
    const found = versionsOf(item).find((v) => v.versionNumber === Number(params.version))
    return found ? HttpResponse.json(found) : notFound()
  }),
]
