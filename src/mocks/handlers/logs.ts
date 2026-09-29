import { http, HttpResponse } from 'msw'
import { apiUrls } from '@/api/config/endpoints'
import type { ActionType, ActivityLog, CGServerLog, LdapSyncLog, SystemLog } from '@/features/admin/api/logs'
import { api, paginate } from './utils'

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

// Lọc khoảng thời gian from/to như backend
const inRange = (value: string | undefined, url: URL) => {
  const t = new Date(value ?? 0).getTime()
  const from = url.searchParams.get('from')
  const to = url.searchParams.get('to')
  return (!from || t >= new Date(from).getTime()) && (!to || t <= new Date(to).getTime())
}

export const logHandlers = [
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
]
