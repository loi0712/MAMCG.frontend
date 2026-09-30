import { http, HttpResponse } from 'msw'
import { apiUrls } from '@/api/config/endpoints'
import type {
  ActionType,
  ActivityLog,
  AuditAction,
  AuditLogDetail,
  CGServerLog,
  LdapSyncLog,
  SystemLog,
} from '@/features/admin/api/logs'
import { api, notFound, paginate } from './utils'

// Thời điểm cách hiện tại `minutes` phút, định dạng như backend (không kèm múi giờ)
const ago = (minutes: number) => {
  const d = new Date(Date.now() - minutes * 60_000)
  return new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().replace('Z', '')
}

const actionTypes: ActionType[] = [
  { id: 1, name: 'Tạo mới', description: 'Yêu cầu POST' },
  { id: 2, name: 'Cập nhật', description: 'Yêu cầu PUT/PATCH' },
  { id: 3, name: 'Xoá', description: 'Yêu cầu DELETE' },
  { id: 4, name: 'Đăng nhập', description: null },
  { id: 5, name: 'Khác', description: null },
]

const CHROME = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36'
const FIREFOX = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:130.0) Gecko/20100101 Firefox/130.0'
const SAFARI = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15'

const activitySeed: Array<[string, string | null, number, string, string, string, string, number]> = [
  ['admin', 'u-1', 4, 'POST /api/Auth/login', 'Success', '192.168.1.10', CHROME, 320],
  ['admin', 'u-1', 1, 'POST /api/Department/create', 'Success', '192.168.1.10', CHROME, 45],
  ['binh.tran', 'u-3', 4, 'POST /api/Auth/login', 'Failed (400)', '192.168.1.112', FIREFOX, 290],
  ['binh.tran', 'u-3', 4, 'POST /api/Auth/login', 'Success', '192.168.1.112', FIREFOX, 305],
  ['binh.tran', 'u-3', 2, 'PUT /api/Field/update/3', 'Success', '192.168.1.112', FIREFOX, 38],
  ['cuong.le', 'u-4', 1, 'POST /api/Group/create', 'Success', '192.168.1.98', SAFARI, 52],
  ['cuong.le', 'u-4', 3, 'DELETE /api/Panel/delete/7', 'Failed (404)', '192.168.1.98', SAFARI, 12],
  ['admin', 'u-1', 2, 'PUT /api/CGServer/update/2', 'Success', '192.168.1.10', CHROME, 61],
  ['an.nguyen', 'u-2', 1, 'POST /api/Asset/upload', 'Success', '192.168.1.105', CHROME, 1840],
  ['an.nguyen', 'u-2', 3, 'DELETE /api/Asset/delete/12', 'Failed (403)', '192.168.1.105', CHROME, 9],
  ['admin', 'u-1', 5, 'POST /api/CGServer/check/3', 'Success', '192.168.1.10', CHROME, 2003],
  ['dung.pham', null, 4, 'POST /api/Auth/login', 'Failed (401)', '192.168.1.200', 'curl/8.5.0', 150],
]

const activities: ActivityLog[] = Array.from({ length: 36 }, (_, i) => {
  const [userName, userId, actionTypeId, actionDetail, outcome, ipAddress, deviceInfo, durationMs] =
    activitySeed[i % activitySeed.length]
  return {
    id: 1000 - i,
    userId,
    userName,
    actionTypeId,
    actionTypeName: actionTypes.find((t) => t.id === actionTypeId)?.name ?? null,
    actionDetail,
    outcome,
    ipAddress,
    deviceInfo,
    durationMs,
    createdAt: ago(i * 17 + 2),
  }
})

const systemSeed: Array<[string, string, string]> = [
  ['Warning', 'Microsoft.EntityFrameworkCore.Query', 'Truy vấn dùng First/FirstOrDefault không có OrderBy, kết quả có thể không ổn định.'],
  ['Error', 'Playout.Infrastructure.CGServerChecker', 'Không kết nối được 192.168.1.103:5250: Connection refused'],
  ['Warning', 'MassTransit', 'Failed to report usage telemetry\nSystem.Net.Http.HttpRequestException: The proxy tunnel request failed with status code 403.\n   at System.Net.Http.HttpConnectionPool.EstablishProxyTunnelAsync(Boolean async, CancellationToken cancellationToken)\n   at MassTransit.UsageTracking.UsageTracker.ReportUsage()'],
  ['Critical', 'Asset.Infrastructure.Storage', 'Mất kết nối tới storage primary (\\\\nas01\\media). Đã chuyển sang chế độ chỉ đọc.'],
  ['Error', 'Microsoft.AspNetCore.Server.Kestrel', 'Connection id "0HN7" bad request data: "Request body too large."'],
  ['Warning', 'Identity.Infrastructure.Ldap', 'Máy chủ LDAP phản hồi chậm (3200 ms).'],
]

const systemLogs: SystemLog[] = Array.from({ length: 24 }, (_, i) => {
  const [logLevel, source, message] = systemSeed[i % systemSeed.length]
  return { id: 500 - i, serviceName: 'MAMCG.Host', logLevel, source, message, createdAt: ago(i * 43 + 5) }
})

const cgSeed: Array<[number, string]> = [
  [1, '[OK] Kết nối được 192.168.1.101:5250'],
  [2, '[OK] Kết nối được 192.168.1.102:5250'],
  [3, '[LỖI] Không kết nối được 192.168.1.103:5250: Connection refused'],
]

const cgServerLogs: CGServerLog[] = Array.from({ length: 15 }, (_, i) => {
  const [serverId, message] = cgSeed[i % cgSeed.length]
  return { id: 200 - i, serverId, message, createdAt: ago(Math.floor(i / 3) * 60 + 1) }
})

const ldapSyncLogs: LdapSyncLog[] = [
  { id: 3, syncTime: ago(30), status: 'Success', message: 'Đồng bộ hoàn tất', usersSynced: 42, groupsSynced: 6 },
  { id: 2, syncTime: ago(24 * 60 + 30), status: 'Failed', message: 'Không kết nối được ldap://dc01.vtv.local:389 (timeout)', usersSynced: 0, groupsSynced: 0 },
  { id: 1, syncTime: ago(2 * 24 * 60 + 30), status: 'Success', message: 'Đồng bộ hoàn tất', usersSynced: 40, groupsSynced: 6 },
]

// Nhật ký kiểm toán: [người, họ tên, thao tác, module, loại, id, trước, sau, trường thay đổi]
type AuditSeed = [string, string, AuditAction, string, string, string, object | null, object | null, string | null]
const MASK = '********'
const auditSeed: AuditSeed[] = [
  ['admin', 'Quản trị viên', 'update', 'Configuration', 'Setting', '12',
    { ConfigKey: 'email.smtp.host', ConfigValue: 'smtp.old.vtv.vn', Description: 'Máy chủ SMTP', IsDeleted: false },
    { ConfigKey: 'email.smtp.host', ConfigValue: 'smtp.vtv.vn', Description: 'Máy chủ SMTP', IsDeleted: false }, 'ConfigValue'],
  ['admin', 'Quản trị viên', 'update', 'Configuration', 'Setting', '13',
    { ConfigKey: 'email.smtp.password', ConfigValue: MASK, IsDeleted: false },
    { ConfigKey: 'email.smtp.password', ConfigValue: MASK, IsDeleted: false }, 'ConfigValue'],
  ['admin', 'Quản trị viên', 'create', 'Identity', 'User', 'u-5', null,
    { Id: 'u-5', Username: 'hoa.vu', FullName: 'Vũ Thị Hoa', Email: 'hoa.vu@vtv.vn', PasswordHash: MASK, IsActive: true, IsDeleted: false }, null],
  ['binh.tran', 'Trần Văn Bình', 'update', 'Identity', 'User', 'u-3',
    { Id: 'u-3', Username: 'binh.tran', FullName: 'Trần Bình', Email: 'binh@vtv.vn', IsActive: true, IsDeleted: false },
    { Id: 'u-3', Username: 'binh.tran', FullName: 'Trần Văn Bình', Email: 'binh.tran@vtv.vn', IsActive: true, IsDeleted: false }, 'FullName,Email'],
  ['admin', 'Quản trị viên', 'create', 'Identity', 'AccessControlEntry', '41', null,
    { Id: 41, TargetType: 'GROUP', TargetId: '2', PermissionId: 6, ObjectTypeId: 1, ObjectId: null }, null],
  ['cuong.le', 'Lê Văn Cường', 'update', 'Content', 'Workflow', '1',
    { Id: 1, WorkflowName: 'Quy trình duyệt tài sản', UsageKey: null, IsActive: true, IsDeleted: false },
    { Id: 1, WorkflowName: 'Quy trình duyệt tài sản', UsageKey: 'asset', IsActive: true, IsDeleted: false }, 'UsageKey'],
  ['cuong.le', 'Lê Văn Cường', 'create', 'Content', 'WorkflowStatusTransition', '17', null,
    { Id: 17, WorkflowId: 1, FromStatusId: 2, ToStatusId: 3, ActionId: 3, DeadlineHours: 24 }, null],
  ['admin', 'Quản trị viên', 'update', 'Playout', 'CGServer', '2',
    { Id: 2, ServerName: 'CG-02', IpAddress: '192.168.1.102', Port: 5250, StatusId: 1, IsDeleted: false },
    { Id: 2, ServerName: 'CG-02', IpAddress: '192.168.1.112', Port: 5250, StatusId: 1, IsDeleted: false }, 'IpAddress'],
  ['admin', 'Quản trị viên', 'delete', 'Configuration', 'StoragePoint', '4',
    { Id: 4, Name: 'NAS cũ', Path: '\\\\nas02\\media', Type: 'SMB', SecretKey: MASK, IsActive: false, IsDeleted: false },
    { Id: 4, Name: 'NAS cũ', Path: '\\\\nas02\\media', Type: 'SMB', SecretKey: MASK, IsActive: false, IsDeleted: true }, 'IsDeleted'],
  ['admin', 'Quản trị viên', 'update', 'Configuration', 'Database', '1',
    { Id: 1, Name: 'Asset', ConnectionString: 'Server=10.0.0.5;Database=mamcg_asset;User Id=mamcg;Password=' + MASK + ';' },
    { Id: 1, Name: 'Asset', ConnectionString: 'Server=10.0.0.6;Database=mamcg_asset;User Id=mamcg;Password=' + MASK + ';' }, 'ConnectionString'],
]

const auditLogs: AuditLogDetail[] = Array.from({ length: 24 }, (_, i) => {
  const [userName, userFullName, action, module, entityType, entityId, before, after, changedFields] = auditSeed[i % auditSeed.length]
  return {
    id: 3000 - i,
    createdAt: ago(i * 29 + 3),
    userId: `u-${(i % 4) + 1}`,
    userName,
    userFullName,
    ipAddress: `192.168.1.${10 + (i % 5)}`,
    action,
    module,
    entityType,
    entityId,
    changedFields,
    before: before ? JSON.stringify(before) : null,
    after: after ? JSON.stringify(after) : null,
  }
})

const AUDIT_ACTIONS: AuditAction[] = ['create', 'update', 'delete']

// Lọc khoảng thời gian from/to như backend
const inRange = (value: string | undefined, url: URL) => {
  const t = new Date(value ?? 0).getTime()
  const from = url.searchParams.get('from')
  const to = url.searchParams.get('to')
  return (!from || t >= new Date(from).getTime()) && (!to || t <= new Date(to).getTime())
}

// Kho theo loại (/api/Log/{kind}) cho API xoá; ldap-sync so theo syncTime
const stores: Record<string, { items: Array<{ id?: number }>; time: (index: number) => string | null | undefined }> = {
  activities: { items: activities, time: (i) => activities[i]?.createdAt },
  system: { items: systemLogs, time: (i) => systemLogs[i]?.createdAt },
  'cg-server': { items: cgServerLogs, time: (i) => cgServerLogs[i]?.createdAt },
  'ldap-sync': { items: ldapSyncLogs, time: (i) => ldapSyncLogs[i]?.syncTime },
  audit: { items: auditLogs, time: (i) => auditLogs[i]?.createdAt },
}

// ----- Xuất CSV như backend: UTF-8 BOM, chống CSV injection, tối đa EXPORT_MAX_ROWS dòng mới nhất -----
const EXPORT_MAX_ROWS = 10_000
const csvEscape = (value: unknown) => {
  let s = value === null || value === undefined ? '' : String(value)
  if (s && '=+-@\t\r'.includes(s[0])) s = `'${s}`
  return /[",;\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}
const csvTime = (value?: string | null) => (value ? value.replace('T', ' ').slice(0, 19) : '')

const auditFilter = (url: URL) => {
  const user = url.searchParams.get('user')?.trim().toLowerCase()
  const entityType = url.searchParams.get('entityType')
  const entityId = url.searchParams.get('entityId')
  const action = url.searchParams.get('action')?.toLowerCase()
  return auditLogs.filter(
    (l) =>
      (!user || l.userId === user || `${l.userName} ${l.userFullName}`.toLowerCase().includes(user)) &&
      (!entityType || l.entityType === entityType) &&
      (!entityId || l.entityId === entityId) &&
      (!action || l.action === action) &&
      inRange(l.createdAt, url)
  )
}
const auditText = (l: AuditLogDetail) =>
  `${l.userName} ${l.userFullName} ${l.ipAddress} ${l.entityType} ${l.entityId} ${l.changedFields ?? ''}`
const searchFilter = <T,>(items: T[], url: URL, text: (item: T) => string) => {
  const term = (url.searchParams.get('searchTerm') ?? '').trim().toLowerCase()
  return term ? items.filter((i) => text(i).toLowerCase().includes(term)) : items
}

const exportRows = (kind: string, url: URL): { header: string[]; rows: unknown[][] } | null => {
  switch (kind) {
    case 'activities': {
      const actionTypeId = url.searchParams.get('actionTypeId')
      const outcome = url.searchParams.get('outcome')?.toLowerCase()
      const items = searchFilter(
        activities.filter(
          (a) =>
            (!actionTypeId || a.actionTypeId === Number(actionTypeId)) &&
            (outcome !== 'success' || a.outcome === 'Success') &&
            (outcome !== 'failed' || a.outcome !== 'Success') &&
            inRange(a.createdAt, url)
        ),
        url,
        (a) => `${a.userName} ${a.actionDetail} ${a.ipAddress}`
      )
      return {
        header: ['Id', 'Thời gian', 'Người dùng', 'User Id', 'Loại thao tác', 'Chi tiết', 'Kết quả', 'IP', 'Thiết bị', 'Thời lượng (ms)'],
        rows: items.map((a) => [a.id, csvTime(a.createdAt), a.userName, a.userId, a.actionTypeName, a.actionDetail, a.outcome, a.ipAddress, a.deviceInfo, a.durationMs]),
      }
    }
    case 'system': {
      const level = url.searchParams.get('logLevel')
      const items = searchFilter(
        systemLogs.filter((l) => (!level || l.logLevel === level) && inRange(l.createdAt, url)),
        url,
        (l) => `${l.message} ${l.source}`
      )
      return {
        header: ['Id', 'Thời gian', 'Mức', 'Dịch vụ', 'Nguồn', 'Nội dung'],
        rows: items.map((l) => [l.id, csvTime(l.createdAt), l.logLevel, l.serviceName, l.source, l.message]),
      }
    }
    case 'cg-server': {
      const serverId = url.searchParams.get('serverId')
      const items = cgServerLogs.filter((l) => (!serverId || l.serverId === Number(serverId)) && inRange(l.createdAt, url))
      return {
        header: ['Id', 'Thời gian', 'CG server Id', 'Nội dung'],
        rows: items.map((l) => [l.id, csvTime(l.createdAt), l.serverId, l.message]),
      }
    }
    case 'ldap-sync':
      return {
        header: ['Id', 'Thời gian đồng bộ', 'Trạng thái', 'Nội dung', 'Số người dùng', 'Số nhóm'],
        rows: ldapSyncLogs
          .filter((l) => inRange(l.syncTime ?? undefined, url))
          .map((l) => [l.id, csvTime(l.syncTime), l.status, l.message, l.usersSynced, l.groupsSynced]),
      }
    case 'audit':
      return {
        header: ['Id', 'Thời gian', 'Người dùng', 'Họ tên', 'User Id', 'IP', 'Thao tác', 'Module', 'Loại đối tượng', 'Id đối tượng', 'Trường thay đổi', 'Trước', 'Sau'],
        rows: searchFilter(auditFilter(url), url, auditText).map((l) => [
          l.id, csvTime(l.createdAt), l.userName, l.userFullName, l.userId, l.ipAddress, l.action, l.module,
          l.entityType, l.entityId, l.changedFields, l.before, l.after,
        ]),
      }
    default:
      return null
  }
}

const badRequest = (title: string) => HttpResponse.json({ title, status: 400 }, { status: 400 })

const invalidAction = (url: URL) => {
  const action = url.searchParams.get('action')
  return action && !AUDIT_ACTIONS.includes(action.trim().toLowerCase() as AuditAction)
    ? badRequest(`Thao tác không hợp lệ: '${action}'. Hợp lệ: ${AUDIT_ACTIONS.join(', ')}`)
    : null
}

export const logHandlers = [
  // Xuất CSV theo bộ lọc — khai báo trước audit/:id ("audit/export" cũng khớp audit/:id)
  http.get(api(apiUrls.log.export(':kind')), ({ params, request }) => {
    const kind = String(params.kind).toLowerCase()
    const url = new URL(request.url)
    if (kind === 'audit') {
      const invalid = invalidAction(url)
      if (invalid) return invalid
    }
    const data = exportRows(kind, url)
    if (!data) return badRequest(`Loại nhật ký không hợp lệ: '${params.kind}'. Hợp lệ: ${Object.keys(stores).join(', ')}`)
    const truncated = data.rows.length > EXPORT_MAX_ROWS
    const rows = data.rows.slice(0, EXPORT_MAX_ROWS)
    const csv = [data.header, ...rows].map((r) => r.map(csvEscape).join(',')).join('\r\n') + '\r\n'
    const stamp = new Date().toISOString().replace(/[-:]/g, '').replace('T', '-').slice(0, 15)
    return new HttpResponse('\uFEFF' + csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="nhat-ky-${kind}-${stamp}.csv"`,
        'X-Export-Rows': String(rows.length),
        'X-Export-Truncated': String(truncated),
      },
    })
  }),

  // Nhật ký kiểm toán — entity-types khai báo trước audit/:id
  http.get(api(apiUrls.log.auditEntityTypes), () => {
    const counts = new Map<string, { entityType: string; module: string; count: number }>()
    for (const l of auditLogs) {
      const key = `${l.module}:${l.entityType}`
      const row = counts.get(key) ?? { entityType: l.entityType, module: l.module, count: 0 }
      row.count++
      counts.set(key, row)
    }
    return HttpResponse.json([...counts.values()].sort((a, b) => a.module.localeCompare(b.module) || a.entityType.localeCompare(b.entityType)))
  }),

  http.get(api(apiUrls.log.auditDetails(':id' as unknown as number)), ({ params }) => {
    const log = auditLogs.find((l) => l.id === Number(params.id))
    return log ? HttpResponse.json(log) : notFound()
  }),

  http.get(api(apiUrls.log.audit), ({ request }) => {
    const url = new URL(request.url)
    const invalid = invalidAction(url)
    if (invalid) return invalid
    // pageSize 1..200 như backend
    url.searchParams.set('pageSize', String(Math.min(200, Math.max(1, Number(url.searchParams.get('pageSize') ?? 20)))))
    // Danh sách không kèm before/after (chỉ có ở chi tiết)
    const { page, totalCount } = paginate(auditFilter(url), url, auditText)
    return HttpResponse.json({ items: page.map((l) => ({ ...l, before: undefined, after: undefined })), totalCount })
  }),

  http.get(api(apiUrls.log.activities), ({ request }) => {
    const url = new URL(request.url)
    const actionTypeId = url.searchParams.get('actionTypeId')
    const outcome = url.searchParams.get('outcome')?.toLowerCase()
    const filtered = activities.filter(
      (a) =>
        (!actionTypeId || a.actionTypeId === Number(actionTypeId)) &&
        (outcome !== 'success' || a.outcome === 'Success') &&
        (outcome !== 'failed' || a.outcome !== 'Success') &&
        inRange(a.createdAt, url)
    )
    const { page, totalCount } = paginate(filtered, url, (a) => `${a.userName} ${a.actionDetail} ${a.ipAddress}`)
    return HttpResponse.json({ items: page, totalCount })
  }),

  http.get(api(apiUrls.log.actionTypes), () => HttpResponse.json(actionTypes)),

  http.get(api(apiUrls.log.system), ({ request }) => {
    const url = new URL(request.url)
    const level = url.searchParams.get('logLevel')
    const filtered = systemLogs.filter((l) => (!level || l.logLevel === level) && inRange(l.createdAt, url))
    const { page, totalCount } = paginate(filtered, url, (l) => `${l.message} ${l.source}`)
    return HttpResponse.json({ items: page, totalCount })
  }),

  http.get(api(apiUrls.log.cgServer), ({ request }) => {
    const url = new URL(request.url)
    const serverId = url.searchParams.get('serverId')
    const filtered = cgServerLogs.filter((l) => (!serverId || l.serverId === Number(serverId)) && inRange(l.createdAt, url))
    const { page, totalCount } = paginate(filtered, url, () => '')
    return HttpResponse.json({ items: page, totalCount })
  }),

  http.get(api(apiUrls.log.ldapSync), ({ request }) => {
    const { page, totalCount } = paginate(ldapSyncLogs, new URL(request.url), () => '')
    return HttpResponse.json({ items: page, totalCount })
  }),

  // Xoá một dòng — khai báo trước route purge để khớp đường dẫn dài hơn
  http.delete(api(apiUrls.log.deleteOne(':kind', ':id' as unknown as number)), ({ params }) => {
    const store = stores[String(params.kind)]
    if (!store) return badRequest(`Loại nhật ký không hợp lệ: '${params.kind}'`)
    if (params.kind === 'audit') return badRequest('Không được xoá từng dòng nhật ký kiểm toán')
    const index = store.items.findIndex((l) => l.id === Number(params.id))
    if (index < 0) return notFound()
    store.items.splice(index, 1)
    return HttpResponse.json(true)
  }),

  // Xoá các dòng tạo trước `before` (bắt buộc, không được ở tương lai)
  http.delete(api(apiUrls.log.purge(':kind')), ({ params, request }) => {
    const store = stores[String(params.kind)]
    if (!store) return badRequest(`Loại nhật ký không hợp lệ: '${params.kind}'`)
    const raw = new URL(request.url).searchParams.get('before')
    const before = raw ? new Date(raw).getTime() : NaN
    if (Number.isNaN(before)) return badRequest('Thiếu tham số before (xoá nhật ký trước thời điểm này)')
    if (before > Date.now()) return badRequest('Thời điểm before không được ở tương lai')
    let deleted = 0
    for (let i = store.items.length - 1; i >= 0; i--) {
      if (new Date(store.time(i) ?? 0).getTime() < before) {
        store.items.splice(i, 1)
        deleted++
      }
    }
    return HttpResponse.json({ deleted })
  }),
]
