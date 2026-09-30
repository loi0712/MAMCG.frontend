import { http, HttpResponse } from 'msw'
import { apiUrls } from '@/api/config/endpoints'
import type {
  EmailLog,
  EmailPreviewRequest,
  EmailTemplate,
  EmailTemplateRequest,
  EmailTemplateTestRequest,
  SystemEvent,
} from '@/features/admin/api/email-templates'
import { api, notFound, paginate } from './utils'

const id = ':id' as unknown as number
const code = ':code'
const now = () => new Date().toISOString()
const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString()

const badRequest = (title: string) => HttpResponse.json({ title, status: 400 }, { status: 400 })
const conflict = (title: string) => HttpResponse.json({ title, status: 409 }, { status: 409 })

// ===========================================
// SỰ KIỆN HỆ THỐNG (SystemEventCatalog)
// ===========================================

const COMMON_VARIABLES: Record<string, string> = {
  app_name: 'MAMCG',
  event_code: 'system-warning',
  event_name: 'Cảnh báo hệ thống',
  severity: 'medium',
  title: 'Tiêu đề sự kiện',
  message: 'Nội dung chi tiết sự kiện',
  time: '30/09/2026 08:00:00',
  server: 'mamcg-api',
}

type EventRow = [code: string, name: string, category: string, group: string, severity: string, vars: Record<string, string>]

const EVENT_ROWS: EventRow[] = [
  ['system-start', 'Khởi động hệ thống', 'Hệ thống', 'tech', 'low', { environment: 'Production', version: '1.0.0' }],
  ['system-shutdown', 'Tắt hệ thống', 'Hệ thống', 'tech', 'medium', { environment: 'Production', uptime: '3d 4h 12m' }],
  ['system-error', 'Lỗi hệ thống', 'Hệ thống', 'tech', 'high', { count: '3', first_message: 'Timeout khi kết nối CSDL' }],
  ['system-warning', 'Cảnh báo hệ thống', 'Hệ thống', 'tech', 'medium', { count: '5', first_message: 'Yêu cầu xử lý chậm' }],
  ['db-backup-success', 'Backup thành công', 'Cơ sở dữ liệu', 'tech', 'low', { databases: 'mamcg_asset', total_size: '1,2 GB' }],
  ['db-backup-failed', 'Backup thất bại', 'Cơ sở dữ liệu', 'tech', 'critical', { databases: 'mamcg_asset', error: 'Access is denied.' }],
  ['db-connection-lost', 'Mất kết nối database', 'Cơ sở dữ liệu', 'tech', 'critical', { database: 'Database Asset', error: 'Network error' }],
  ['db-connection-restored', 'Khôi phục kết nối database', 'Cơ sở dữ liệu', 'tech', 'low', { database: 'Database Asset', downtime: '00:04:30' }],
  ['user-created', 'Tạo tài khoản mới', 'Người dùng', 'security', 'low', { username: 'nv.an', actor: 'admin', ip: '10.0.0.15' }],
  ['user-deleted', 'Xoá tài khoản', 'Người dùng', 'security', 'medium', { target: 'd3f1…', actor: 'admin', ip: '10.0.0.15' }],
  ['user-login-failed', 'Đăng nhập thất bại', 'Người dùng', 'security', 'medium', { username: 'nv.an', ip: '10.0.0.15' }],
  ['user-password-changed', 'Đổi mật khẩu', 'Người dùng', 'security', 'low', { username: 'nv.an', actor: 'nv.an' }],
  ['workflow-started', 'Workflow bắt đầu', 'Workflow', 'admin', 'low', { workflow: 'Quy trình tin', item: 'Bản tin 18h' }],
  ['workflow-completed', 'Workflow hoàn tất', 'Workflow', 'admin', 'low', { workflow: 'Quy trình tin', approved_by: 'tt.binh' }],
  ['workflow-failed', 'Workflow thất bại', 'Workflow', 'admin', 'high', { workflow: 'Quy trình tin', error: 'Quá hạn xử lý' }],
  ['storage-warning', 'Cảnh báo dung lượng', 'Lưu trữ', 'tech', 'medium', { storage: 'NAS 1', used_percent: '82', free: '1,8 TB' }],
  ['storage-full', 'Dung lượng đầy', 'Lưu trữ', 'tech', 'critical', { storage: 'NAS 1', used_percent: '96', free: '400 GB' }],
  ['storage-cleanup', 'Dọn dẹp lưu trữ', 'Lưu trữ', 'tech', 'low', { storage: 'Backup', deleted_files: '12', freed: '35 GB' }],
  ['cg-server-offline', 'CG server mất kết nối', 'CG Server', 'tech', 'high', { server_name: 'CG Studio A', ip: '192.168.1.101', port: '5250' }],
  ['cg-server-online', 'CG server kết nối lại', 'CG Server', 'tech', 'low', { server_name: 'CG Studio A', ip: '192.168.1.101', port: '5250' }],
  ['ldap-sync-completed', 'Đồng bộ LDAP hoàn tất', 'LDAP', 'security', 'low', { created: '3', updated: '120', deactivated: '1' }],
  ['ldap-sync-failed', 'Đồng bộ LDAP thất bại', 'LDAP', 'security', 'high', { error: 'Invalid credentials' }],
]

const events: SystemEvent[] = EVENT_ROWS.map(([c, name, category, recipientGroup, defaultSeverity, vars]) => ({
  code: c,
  name,
  category,
  recipientGroup,
  defaultSeverity,
  variables: { ...COMMON_VARIABLES, event_code: c, event_name: name, severity: defaultSeverity, ...vars },
}))

const findEvent = (c: string | null | undefined) => events.find((e) => e.code === c?.trim().toLowerCase())

// ===========================================
// MẪU EMAIL
// ===========================================

const VARIABLE_PATTERN = /\{\{\s*([A-Za-z0-9_.-]+)\s*\}\}/g
const extractVariables = (...parts: (string | null | undefined)[]) => [
  ...new Set(parts.flatMap((p) => [...(p ?? '').matchAll(VARIABLE_PATTERN)].map((m) => m[1]))),
]

const defaultContent = (e: SystemEvent) => {
  const rows = Object.keys(e.variables ?? {})
    .filter((k) => !(k in COMMON_VARIABLES))
    .map((k) => `<tr><td style="padding:4px 12px 4px 0;color:#555">${k}</td><td><b>{{${k}}}</b></td></tr>`)
    .join('')
  return {
    subject: `[{{app_name}}] ${e.name}: {{title}}`,
    body:
      '<div style="font-family:Arial,sans-serif;font-size:14px;color:#222"><h2 style="margin:0 0 8px">{{event_name}}</h2>' +
      `<p>{{title}}</p><p>{{message}}</p><table style="border-collapse:collapse">${rows}` +
      '<tr><td style="padding:4px 12px 4px 0;color:#555">Thời điểm</td><td>{{time}}</td></tr>' +
      '<tr><td style="padding:4px 12px 4px 0;color:#555">Mức độ</td><td>{{severity}}</td></tr></table>' +
      '<p style="margin:16px 0 0;color:#888;font-size:12px">Email tự động từ {{app_name}} ({{server}}).</p></div>',
  }
}

let templateSeq = 100

const templates: EmailTemplate[] = [
  ...events.slice(0, 8).map((e, i): EmailTemplate => {
    const { subject, body } = defaultContent(e)
    return {
      id: i + 1,
      code: e.code,
      name: e.name,
      subject,
      body,
      isHtml: true,
      description: `Mẫu mặc định cho sự kiện "${e.name}" (${e.category})`,
      isActive: i !== 3,
      isSystem: true,
      eventName: e.name,
      variables: extractVariables(subject, body),
      createdAt: minutesAgo(10_000),
      modifiedAt: minutesAgo(10_000 - i * 100),
    }
  }),
  {
    id: 50,
    code: 'weekly-report',
    name: 'Báo cáo tuần',
    subject: '[{{app_name}}] Báo cáo tuần {{week}}',
    body: 'Xin chào,\n\nTổng hợp hoạt động tuần {{week}} của {{app_name}}.\n\nTrân trọng.',
    isHtml: false,
    description: 'Mẫu tuỳ chỉnh (không gắn sự kiện)',
    isActive: true,
    isSystem: false,
    eventName: null,
    variables: ['app_name', 'week'],
    createdAt: minutesAgo(3000),
    modifiedAt: minutesAgo(1200),
  },
]

const sortedTemplates = () =>
  [...templates].sort((a, b) => Number(b.isSystem) - Number(a.isSystem) || (a.code ?? '').localeCompare(b.code ?? ''))

const validateTemplate = (d: EmailTemplateRequest): string | null => {
  const c = d.code?.trim() ?? ''
  if (!c || c.length > 100 || !/^[A-Za-z0-9_.-]+$/.test(c))
    return "Mã mẫu chỉ gồm chữ, số, '-', '_', '.' và tối đa 100 ký tự."
  if (!d.name?.trim()) return 'Tên mẫu không được trống và tối đa 255 ký tự.'
  if (!d.subject?.trim()) return 'Tiêu đề không được trống và tối đa 500 ký tự.'
  if (!d.body?.trim()) return 'Nội dung không được trống và tối đa 200.000 ký tự.'
  return null
}

const applyTemplate = (t: EmailTemplate, d: EmailTemplateRequest) => {
  const c = (d.code ?? '').trim().toLowerCase()
  Object.assign(t, {
    code: c,
    name: d.name?.trim(),
    subject: d.subject,
    body: d.body,
    isHtml: d.isHtml ?? true,
    description: d.description?.trim() || null,
    isActive: d.isActive ?? true,
    eventName: findEvent(c)?.name ?? null,
    variables: extractVariables(d.subject, d.body),
    modifiedAt: now(),
  })
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

const sampleVariables = (c: string | null | undefined, overrides?: Record<string, string> | null) => ({
  ...COMMON_VARIABLES,
  ...(findEvent(c)?.variables ?? {}),
  ...(overrides ?? {}),
})

const render = (template: string, vars: Record<string, string>, html: boolean) =>
  template.replace(VARIABLE_PATTERN, (_, name: string) => {
    const value = vars[name] ?? ''
    return html ? escapeHtml(value) : value
  })

// ===========================================
// NHẬT KÝ EMAIL
// ===========================================

let logSeq = 1000

const logs: EmailLog[] = [
  {
    id: 1,
    eventCode: 'system-start',
    templateCode: 'system-start',
    toAddresses: 'tech@mamcg.vn, admin@mamcg.vn',
    ccAddresses: null,
    subject: '[MAMCG] Khởi động hệ thống: MAMCG đã khởi động',
    status: 'Sent',
    error: null,
    createdAt: minutesAgo(600),
  },
  {
    id: 2,
    eventCode: 'storage-warning',
    templateCode: null,
    toAddresses: 'tech@mamcg.vn, admin@mamcg.vn',
    ccAddresses: 'ops@mamcg.vn',
    subject: '[MAMCG] Cảnh báo dung lượng: NAS 1 đã dùng 82%',
    status: 'Sent',
    error: null,
    createdAt: minutesAgo(420),
  },
  {
    id: 3,
    eventCode: 'cg-server-offline',
    templateCode: null,
    toAddresses: 'tech@mamcg.vn, admin@mamcg.vn',
    ccAddresses: null,
    subject: '[MAMCG] CG server mất kết nối: CG Studio A',
    status: 'Failed',
    error: 'Không kết nối được máy chủ SMTP smtp.mamcg.vn:587 (Connection refused)',
    createdAt: minutesAgo(300),
  },
  {
    id: 4,
    eventCode: 'user-login-failed',
    templateCode: null,
    toAddresses: '',
    ccAddresses: null,
    subject: '[MAMCG] Đăng nhập thất bại: nv.an',
    status: 'Skipped',
    error: 'Chưa cấu hình người nhận (email.notify.recipient.security)',
    createdAt: minutesAgo(200),
  },
  {
    id: 5,
    eventCode: null,
    templateCode: 'weekly-report',
    toAddresses: 'admin@mamcg.vn',
    ccAddresses: null,
    subject: '[MAMCG] Báo cáo tuần 39',
    status: 'Sent',
    error: null,
    createdAt: minutesAgo(90),
  },
  {
    id: 6,
    eventCode: 'db-backup-success',
    templateCode: 'db-backup-success',
    toAddresses: 'tech@mamcg.vn, admin@mamcg.vn',
    ccAddresses: null,
    subject: '[MAMCG] Backup thành công: mamcg_identity, mamcg_asset',
    status: 'Sent',
    error: null,
    createdAt: minutesAgo(30),
  },
]

const writeLog = (entry: Omit<EmailLog, 'id' | 'createdAt'>) => {
  logs.unshift({ ...entry, id: ++logSeq, createdAt: now() })
}

// createdAt dạng ISO; mốc lọc dạng yyyy-mm-ddTHH:mm:ss (giờ địa phương)
const toTime = (v: string | null | undefined) => (v ? new Date(v).getTime() : NaN)

// ===========================================
// HANDLERS (đường dẫn cố định đặt trước /:id)
// ===========================================

export const emailTemplateHandlers = [
  http.get(api(apiUrls.emailTemplate.list), ({ request }) => {
    const { page, totalCount } = paginate(
      sortedTemplates(),
      new URL(request.url),
      (t) => `${t.code} ${t.name} ${t.subject}`
    )
    return HttpResponse.json({ items: page, totalCount })
  }),

  http.get(api(apiUrls.emailTemplate.events), () => HttpResponse.json(events)),

  http.post(api(apiUrls.emailTemplate.preview), async ({ request }) => {
    const d = (await request.json()) as EmailPreviewRequest
    const vars = sampleVariables(d.code, d.variables)
    const html = d.isHtml ?? true
    return HttpResponse.json({
      subject: render(d.subject ?? '', vars, false).replace(/[\r\n]+/g, ' ').trim(),
      body: render(d.body ?? '', vars, html),
      isHtml: html,
      missingVariables: extractVariables(d.subject, d.body).filter((v) => !(v in vars)),
    })
  }),

  // Giả lập: mọi sự kiện đều coi như đã bật và có người nhận
  http.post(api(apiUrls.emailTemplate.triggerEvent(code)), ({ params }) => {
    const event = findEvent(String(params.code))
    if (!event) return HttpResponse.json({ sent: false, reason: 'Sự kiện chưa bật gửi email' })
    const template = templates.find((t) => t.code === event.code && t.isActive)
    const vars = sampleVariables(event.code, { title: `Sự kiện thử: ${event.name}` })
    writeLog({
      eventCode: event.code,
      templateCode: template?.code ?? null,
      toAddresses: `${event.recipientGroup}@mamcg.vn, admin@mamcg.vn`,
      ccAddresses: null,
      subject: render(template?.subject ?? `[{{app_name}}] ${event.name}: {{title}}`, vars, false),
      status: 'Sent',
      error: null,
    })
    return HttpResponse.json({ sent: true, reason: 'Đã gửi email (giả lập)' })
  }),

  http.post(api(apiUrls.emailTemplate.create), async ({ request }) => {
    const d = (await request.json()) as EmailTemplateRequest
    const error = validateTemplate(d)
    if (error) return badRequest(error)
    const c = (d.code ?? '').trim().toLowerCase()
    if (templates.some((t) => t.code === c)) return conflict(`Mã mẫu '${c}' đã tồn tại.`)
    const t: EmailTemplate = { id: ++templateSeq, isSystem: false, createdAt: now() }
    applyTemplate(t, d)
    templates.push(t)
    return HttpResponse.json(t)
  }),

  http.put(api(apiUrls.emailTemplate.update(id)), async ({ params, request }) => {
    const t = templates.find((x) => x.id === Number(params.id))
    if (!t) return notFound()
    const d = (await request.json()) as EmailTemplateRequest
    const error = validateTemplate(d)
    if (error) return badRequest(error)
    const c = (d.code ?? '').trim().toLowerCase()
    if (t.isSystem && c !== t.code) return badRequest('Không đổi được mã của mẫu hệ thống.')
    if (templates.some((x) => x.code === c && x.id !== t.id)) return conflict(`Mã mẫu '${c}' đã tồn tại.`)
    applyTemplate(t, d)
    return HttpResponse.json(t)
  }),

  http.delete(api(apiUrls.emailTemplate.delete(id)), ({ params }) => {
    const index = templates.findIndex((x) => x.id === Number(params.id))
    if (index < 0) return notFound()
    if (templates[index].isSystem)
      return conflict('Không xoá được mẫu hệ thống; hãy tắt mẫu hoặc khôi phục mặc định.')
    templates.splice(index, 1)
    return new HttpResponse(null, { status: 204 })
  }),

  http.post(api(apiUrls.emailTemplate.reset(id)), ({ params }) => {
    const t = templates.find((x) => x.id === Number(params.id))
    if (!t) return notFound()
    const event = findEvent(t.code)
    if (!event) return badRequest('Mẫu này không có nội dung mặc định.')
    const { subject, body } = defaultContent(event)
    Object.assign(t, {
      name: event.name,
      subject,
      body,
      isHtml: true,
      isActive: true,
      variables: extractVariables(subject, body),
      modifiedAt: now(),
    })
    return HttpResponse.json(t)
  }),

  // Gửi tới địa chỉ *@fail.test để thử trường hợp lỗi
  http.post(api(apiUrls.emailTemplate.sendTest(id)), async ({ params, request }) => {
    const t = templates.find((x) => x.id === Number(params.id))
    if (!t) return notFound()
    const d = (await request.json()) as EmailTemplateTestRequest
    const to = d.to?.trim() ?? ''
    if (!/^[^@\s]+@[^@\s]+$/.test(to)) return badRequest('Địa chỉ email nhận không hợp lệ.')
    const vars = sampleVariables(t.code, d.variables)
    const success = !to.endsWith('@fail.test')
    const message = success ? `Đã gửi email thử tới ${to}` : 'Máy chủ SMTP từ chối người nhận (giả lập)'
    writeLog({
      eventCode: null,
      templateCode: t.code,
      toAddresses: to,
      ccAddresses: null,
      subject: `[TEST] ${render(t.subject ?? '', vars, false)}`,
      status: success ? 'Sent' : 'Failed',
      error: success ? null : message,
    })
    return HttpResponse.json({ success, message, elapsedMs: 180 })
  }),

  http.get(api(apiUrls.emailTemplate.details(id)), ({ params }) => {
    const t = templates.find((x) => x.id === Number(params.id))
    return t ? HttpResponse.json(t) : notFound()
  }),

  http.get(api(apiUrls.emailLog.list), ({ request }) => {
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const eventCode = url.searchParams.get('eventCode')
    const from = toTime(url.searchParams.get('from'))
    const to = toTime(url.searchParams.get('to'))
    const filtered = logs.filter(
      (l) =>
        (!status || l.status === status) &&
        (!eventCode || l.eventCode === eventCode) &&
        (Number.isNaN(from) || toTime(l.createdAt) >= from) &&
        (Number.isNaN(to) || toTime(l.createdAt) <= to)
    )
    const { page, totalCount } = paginate(filtered, url, (l) => `${l.subject} ${l.toAddresses}`)
    return HttpResponse.json({ items: page, totalCount })
  }),

  http.delete(api(apiUrls.emailLog.purge), ({ request }) => {
    const before = toTime(new URL(request.url).searchParams.get('before'))
    if (Number.isNaN(before)) return badRequest('Thiếu thời điểm xoá.')
    if (before > Date.now()) return badRequest('Thời điểm xoá phải ở quá khứ.')
    const keep = logs.filter((l) => toTime(l.createdAt) >= before)
    const deleted = logs.length - keep.length
    logs.splice(0, logs.length, ...keep)
    return HttpResponse.json({ deleted })
  }),
]
