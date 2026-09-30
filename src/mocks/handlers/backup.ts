import { http, HttpResponse } from 'msw'
import { apiUrls } from '@/api/config/endpoints'
import type {
  BackupConfig,
  BackupDatabase,
  BackupHistoryItem,
  BackupRunRequest,
  BackupStatus,
} from '@/features/admin/api/backup'
import { api, notFound } from './utils'

const id = ':id' as unknown as number

// ===========================================
// TIỆN ÍCH THỜI GIAN: backend lưu giờ Việt Nam, không kèm múi giờ
// ===========================================

const VN_OFFSET_MS = 7 * 3600 * 1000
const toVnString = (date: Date) => new Date(date.getTime() + VN_OFFSET_MS).toISOString().slice(0, 23)
const vnNow = () => toVnString(new Date())
const vnAgo = (ms: number) => toVnString(new Date(Date.now() - ms))
const DAY = 24 * 3600 * 1000
const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
const DB_NAMES: Record<string, string> = {
  AssetDb: 'mamcg_asset',
  ConfigurationDb: 'mamcg_config',
  ContentDb: 'mamcg_content',
  IdentityDb: 'mamcg_identity',
  PlayoutDb: 'mamcg_playout',
  TrackingDb: 'mamcg_tracking',
}
const DEFAULT_PATH = '/var/opt/mssql/data'

const conflict = (title: string) => HttpResponse.json({ title, status: 409 }, { status: 409 })
const badRequest = (title: string) => HttpResponse.json({ title, status: 400 }, { status: 400 })

// ===========================================
// DỮ LIỆU GIẢ
// ===========================================

interface StoredConfig {
  enabled: boolean
  time: string
  days: string[]
  path: string
  retentionDays: number
  compression: boolean
  copyOnly: boolean
  verify: boolean
  databases: string[]
}

let config: StoredConfig = {
  enabled: true,
  time: '02:00',
  days: [],
  path: '',
  retentionDays: 7,
  compression: true,
  copyOnly: true,
  verify: false,
  databases: [],
}

const toConfigDto = (): BackupConfig => ({
  ...config,
  path: config.path || null,
})

type Row = BackupHistoryItem & { id: number }

let seq = 0
let running: { batchId: string } | null = null

const fileName = (db: string, at: string) =>
  `${db}_${at.slice(0, 10).replace(/-/g, '')}_${at.slice(11, 19).replace(/:/g, '')}.bak`

const seedRow = (
  connectionName: string,
  ago: number,
  status: 'Success' | 'Failed' | 'Deleted',
  batchId: string
): Row => {
  const startedAt = vnAgo(ago)
  const databaseName = DB_NAMES[connectionName]
  const durationMs = 1200 + ((seq * 733) % 9000)
  const failed = status === 'Failed'
  return {
    id: ++seq,
    batchId,
    connectionName,
    databaseName,
    filePath: failed ? '' : `${DEFAULT_PATH}/${fileName(databaseName, startedAt)}`,
    sizeBytes: failed ? null : 400_000 + ((seq * 911_117) % 900_000_000),
    compressed: true,
    status,
    message: failed
      ? 'Cannot open backup device. Operating system error 112(There is not enough space on the disk.).\nBACKUP DATABASE is terminating abnormally.'
      : status === 'Deleted'
        ? 'Đã xoá file do quá hạn lưu giữ'
        : 'Backup thành công',
    trigger: 'schedule',
    triggeredBy: null,
    startedAt,
    finishedAt: vnAgo(ago - durationMs),
    durationMs,
  }
}

const history: Row[] = []
for (let day = 9; day >= 1; day--) {
  const batchId = crypto.randomUUID()
  for (const name of Object.keys(DB_NAMES)) {
    const status = day > 7 ? 'Deleted' : day === 3 && name === 'ContentDb' ? 'Failed' : 'Success'
    history.push(seedRow(name, day * DAY - 2 * 3600 * 1000, status, batchId))
  }
}

// ===========================================
// TIỆN ÍCH
// ===========================================

const nextRunAt = () => {
  if (!config.enabled) return null
  const [h, m] = config.time.split(':').map(Number)
  const now = new Date(Date.now() + VN_OFFSET_MS)
  for (let i = 0; i <= 7; i++) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + i, h, m))
    if (d <= now) continue
    if (config.days.length && !config.days.includes(DAY_KEYS[d.getUTCDay()])) continue
    return d.toISOString().slice(0, 19)
  }
  return null
}

const lastAt = (statuses: string[]) =>
  history
    .filter((r) => statuses.includes(r.status ?? ''))
    .map((r) => r.finishedAt ?? '')
    .sort()
    .at(-1) ?? null

const status = (): BackupStatus => ({
  running: !!running,
  currentBatchId: running?.batchId ?? null,
  nextRunAt: nextRunAt(),
  lastSuccessAt: lastAt(['Success', 'Deleted']),
  lastFailureAt: lastAt(['Failed']),
  scheduleEnabled: config.enabled,
})

const databases = (): BackupDatabase[] =>
  Object.entries(DB_NAMES).map(([connectionName, databaseName]) => ({
    connectionName,
    databaseName,
    server: 'localhost,1433',
    selected: config.databases.includes(connectionName),
  }))

const unknownDbs = (names: string[]) => names.filter((n) => !(n in DB_NAMES))

// Lượt backup chạy nền: mỗi CSDL xong sau khoảng 1,5–4 giây
const startBatch = (names: string[]) => {
  const batchId = crypto.randomUUID()
  running = { batchId }
  const folder = config.path || DEFAULT_PATH
  const rows = names.map((connectionName): Row => {
    const startedAt = vnNow()
    return {
      id: ++seq,
      batchId,
      connectionName,
      databaseName: DB_NAMES[connectionName],
      filePath: `${folder}/${fileName(DB_NAMES[connectionName], startedAt)}`,
      sizeBytes: null,
      compressed: config.compression,
      status: 'Running',
      message: null,
      trigger: 'manual',
      triggeredBy: 'admin',
      startedAt,
      finishedAt: null,
      durationMs: null,
    }
  })
  history.push(...rows)
  // Giả lập thư mục không tồn tại trên máy chủ SQL
  const failing = /khong|not-?exist/i.test(folder)
  rows.forEach((row, index) => {
    const delay = 1500 + index * 500
    setTimeout(() => {
      Object.assign(row, {
        status: failing ? 'Failed' : 'Success',
        sizeBytes: failing ? null : 500_000 + Math.round(Math.random() * 50_000_000),
        filePath: failing ? '' : row.filePath,
        message: failing
          ? `Cannot open backup device '${row.filePath}'. Operating system error 5(Access is denied.).\nBACKUP DATABASE is terminating abnormally.`
          : config.verify
            ? 'Đã backup và kiểm tra file'
            : 'Backup thành công',
        finishedAt: vnNow(),
        durationMs: delay - 200,
      })
      if (rows.every((r) => r.status !== 'Running')) running = null
    }, delay)
  })
  return batchId
}

// ===========================================
// HANDLERS
// ===========================================

export const backupHandlers = [
  http.get(api(apiUrls.backup.config), () => HttpResponse.json(toConfigDto())),

  http.put(api(apiUrls.backup.config), async ({ request }) => {
    const data = (await request.json()) as BackupConfig
    const time = (data.time ?? '').trim()
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) return badRequest('Giờ chạy phải theo định dạng HH:mm.')
    const days = [...new Set((data.days ?? []).map((d) => d.trim().toLowerCase()).filter(Boolean))]
    if (days.some((d) => !DAY_KEYS.includes(d)))
      return badRequest('Ngày chạy chỉ gồm: mon, tue, wed, thu, fri, sat, sun.')
    const retentionDays = data.retentionDays ?? 7
    if (retentionDays < 0 || retentionDays > 3650) return badRequest('Số ngày giữ bản backup trong khoảng 0 - 3650.')
    const dbs = [...new Set((data.databases ?? []).map((d) => d.trim()).filter(Boolean))]
    const unknown = unknownDbs(dbs)
    if (unknown.length) return badRequest(`Không có kết nối: ${unknown.join(', ')}.`)
    config = {
      enabled: data.enabled ?? false,
      time,
      days,
      path: (data.path ?? '').trim(),
      retentionDays,
      compression: data.compression ?? true,
      copyOnly: data.copyOnly ?? true,
      verify: data.verify ?? false,
      databases: dbs,
    }
    return HttpResponse.json(toConfigDto())
  }),

  http.get(api(apiUrls.backup.databases), () => HttpResponse.json(databases())),

  http.get(api(apiUrls.backup.status), () => HttpResponse.json(status())),

  http.get(api(apiUrls.backup.history), ({ request }) => {
    const url = new URL(request.url)
    const q = (key: string) => url.searchParams.get(key)?.trim() || null
    const pageNumber = Number(q('pageNumber') ?? 1)
    const pageSize = Number(q('pageSize') ?? 20)
    const [st, batchId, conn, from, to] = ['status', 'batchId', 'connectionName', 'from', 'to'].map(q)
    const filtered = history
      .filter(
        (r) =>
          (!st || r.status?.toLowerCase() === st.toLowerCase()) &&
          (!batchId || r.batchId === batchId) &&
          (!conn || r.connectionName?.toLowerCase() === conn.toLowerCase()) &&
          (!from || (r.startedAt ?? '') >= from) &&
          (!to || (r.startedAt ?? '') <= to)
      )
      .sort((a, b) => b.id - a.id)
    const start = (pageNumber - 1) * pageSize
    return HttpResponse.json({
      items: filtered.slice(start, start + pageSize),
      totalCount: filtered.length,
    })
  }),

  http.post(api(apiUrls.backup.run), async ({ request }) => {
    if (running) return conflict('Đang có lượt backup chạy, vui lòng đợi.')
    const body = ((await request.json().catch(() => null)) ?? {}) as BackupRunRequest
    const requested = (body.databases ?? []).map((d) => d.trim()).filter(Boolean)
    const unknown = unknownDbs(requested)
    if (unknown.length) return badRequest(`Không có kết nối: ${unknown.join(', ')}.`)
    const names = requested.length ? requested : config.databases.length ? config.databases : Object.keys(DB_NAMES)
    const batchId = startBatch(names)
    return HttpResponse.json({ batchId, databases: names }, { status: 202 })
  }),

  http.delete(api(apiUrls.backup.delete(id)), ({ params }) => {
    const index = history.findIndex((r) => r.id === Number(params.id))
    if (index < 0) return notFound()
    const row = history[index]
    if (row.status === 'Running') return conflict('Bản backup đang chạy, không xoá được.')
    if (row.status === 'Success') {
      Object.assign(row, {
        status: 'Deleted',
        message: 'Đã xoá file theo yêu cầu',
      })
      return HttpResponse.json(row)
    }
    history.splice(index, 1)
    return HttpResponse.json(row)
  }),
]
