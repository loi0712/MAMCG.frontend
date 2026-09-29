import { http, HttpResponse } from 'msw'
import { apiUrls } from '@/api/config/endpoints'
import type {
  ConfigServer,
  ConfigServerRequest,
  DatabaseConnection,
  DatabaseRequest,
  StoragePoint,
  StoragePointRequest,
  StorageUsage,
} from '@/features/admin/api/configuration'
import { api, notFound, paginate } from './utils'

const id = ':id' as unknown as number
const now = () => new Date().toISOString()
let seq = 100

const SECRET_MASK = '********'
const GB = 1024 ** 3
const TB = 1024 ** 4

// ===========================================
// DỮ LIỆU GIẢ (giá trị bí mật lưu nguyên, che khi trả về như backend)
// ===========================================

type Stored<T> = T & { id: number }

const databases: Stored<DatabaseConnection>[] = [
  { id: 1, name: 'Main Database', type: 'SqlServer', connectionString: 'Server=192.168.1.50,1433;Database=mamcg_main;User Id=sa;Password=P@ssw0rd;TrustServerCertificate=true;', description: 'CSDL chính của hệ thống', isActive: true, createdAt: now(), modifiedAt: now() },
  { id: 2, name: 'Identity DB', type: 'SqlServer', connectionString: 'Server=192.168.1.50,1433;Database=mamcg_identity;User Id=sa;Password=P@ssw0rd;TrustServerCertificate=true;', description: null, isActive: true, createdAt: now(), modifiedAt: now() },
  { id: 3, name: 'Archive Database', type: 'PostgreSQL', connectionString: 'Host=192.168.1.51;Port=5432;Database=archive_db;Username=archive;Password=secret;', description: 'Kho lưu trữ cũ', isActive: true, createdAt: now(), modifiedAt: now() },
  { id: 4, name: 'Legacy System', type: 'SqlServer', connectionString: 'Server=192.168.1.52,1433;Database=legacy_db;User Id=legacy;Password=old;', description: null, isActive: false, createdAt: now(), modifiedAt: now() },
]

const storagePoints: Stored<StoragePoint>[] = [
  { id: 1, name: 'Main NAS Storage', path: '/mnt/nas/media', type: 'NAS', accessKey: null, secretKey: null, description: 'Lưu trữ media chính', isActive: true, createdAt: now(), modifiedAt: now() },
  { id: 2, name: 'Local Cache', path: '/var/mamcg/cache', type: 'Local', accessKey: null, secretKey: null, description: null, isActive: true, createdAt: now(), modifiedAt: now() },
  { id: 3, name: 'Amazon S3 Backup', path: 's3://mamcg-backup', type: 'S3', accessKey: 'AKIAIOSFODNN7EXAMPLE', secretKey: 'wJalrXUtnFEMI/K7MDENG', description: 'Sao lưu trên cloud', isActive: true, createdAt: now(), modifiedAt: now() },
  { id: 4, name: 'Archive SAN', path: '/mnt/san/archive', type: 'SAN', accessKey: null, secretKey: null, description: null, isActive: false, createdAt: now(), modifiedAt: now() },
]

const usages: Record<number, StorageUsage> = {
  1: { available: true, message: null, totalBytes: 10 * TB, freeBytes: 3.5 * TB, usedBytes: 6.5 * TB },
  2: { available: true, message: null, totalBytes: 500 * GB, freeBytes: 120 * GB, usedBytes: 380 * GB },
  4: { available: true, message: null, totalBytes: 5 * TB, freeBytes: 0.2 * TB, usedBytes: 4.8 * TB },
}

const servers: Stored<ConfigServer>[] = [
  { id: 1, name: 'Transcoder', host: '10.0.0.9', port: 8080, credentials: 'token-123', type: 'Transcoder', description: null, isActive: true, createdAt: now(), modifiedAt: now() },
]

// ===========================================
// TIỆN ÍCH
// ===========================================

const PASSWORD_RE = /\b(password|pwd)\s*=\s*([^;]*)/i

const maskConnectionString = (cs: string | null | undefined) =>
  (cs ?? '').replace(new RegExp(PASSWORD_RE.source, 'gi'), (m) => m.slice(0, m.indexOf('=') + 1) + SECRET_MASK)

const resolveConnectionString = (incoming: string, current: string | null | undefined) => {
  if (!current || !incoming.includes(SECRET_MASK)) return incoming
  const match = PASSWORD_RE.exec(current)
  return match ? incoming.replace(SECRET_MASK, match[2]) : incoming
}

const mask = (value: string | null | undefined) => (value ? SECRET_MASK : value)
const resolve = (incoming: string | null | undefined, current: string | null | undefined) =>
  incoming === SECRET_MASK ? current : incoming

const conflictName = <T extends { id: number; name?: string | null }>(items: T[], name: string, exceptId?: number) =>
  items.some((x) => x.name?.toLowerCase() === name.trim().toLowerCase() && x.id !== exceptId)
    ? HttpResponse.json({ title: `Name '${name.trim()}' đã tồn tại`, status: 409 }, { status: 409 })
    : null

const toDatabaseDto = (d: Stored<DatabaseConnection>): DatabaseConnection => ({
  ...d,
  connectionString: maskConnectionString(d.connectionString),
})
const toStorageDto = (s: Stored<StoragePoint>): StoragePoint => ({ ...s, secretKey: mask(s.secretKey) })
const toServerDto = (s: Stored<ConfigServer>): ConfigServer => ({ ...s, credentials: mask(s.credentials) })

// Giả lập đọc dung lượng: đường dẫn cục bộ/mount đọc được, còn lại (S3, FTP...) thì không
const readUsage = (point: Stored<StoragePoint>): StorageUsage => {
  const known = usages[point.id]
  if (known) return known
  const path = point.path ?? ''
  if (!/^(\/|[A-Za-z]:\\|\\\\)/.test(path))
    return { available: false, message: `Máy chủ API không truy cập được đường dẫn ${path}`, totalBytes: null, freeBytes: null, usedBytes: null }
  const totalBytes = 2 * TB
  const usedBytes = Math.round(totalBytes * (0.2 + ((point.id * 37) % 60) / 100))
  const usage = { available: true, message: null, totalBytes, freeBytes: totalBytes - usedBytes, usedBytes }
  usages[point.id] = usage
  return usage
}

const findById = <T extends { id: number }>(items: T[], raw: unknown) => items.find((x) => x.id === Number(raw))

const removeById = <T extends { id: number }>(items: T[], raw: unknown) => {
  const index = items.findIndex((x) => x.id === Number(raw))
  if (index < 0) return false
  items.splice(index, 1)
  return true
}

const SQL_SERVER_TYPES = ['sqlserver', 'sql server', 'mssql']

// ===========================================
// HANDLERS
// ===========================================

export const configurationHandlers = [
  // ---------- Database ----------
  http.get(api(apiUrls.database.list), ({ request }) => {
    const { page, totalCount } = paginate(databases, new URL(request.url), (d) => `${d.name} ${d.type} ${d.description ?? ''}`)
    return HttpResponse.json({ items: page.map(toDatabaseDto), totalCount })
  }),

  http.get(api(apiUrls.database.details(id)), ({ params }) => {
    const db = findById(databases, params.id)
    return db ? HttpResponse.json(toDatabaseDto(db)) : notFound()
  }),

  http.post(api(apiUrls.database.create), async ({ request }) => {
    const data = (await request.json()) as DatabaseRequest
    const conflict = conflictName(databases, data.name)
    if (conflict) return conflict
    const created: Stored<DatabaseConnection> = {
      id: ++seq,
      name: data.name.trim(),
      type: data.type.trim(),
      connectionString: data.connectionString.trim(),
      description: data.description ?? null,
      isActive: data.isActive ?? true,
      createdAt: now(),
      modifiedAt: now(),
    }
    databases.push(created)
    return HttpResponse.json(toDatabaseDto(created))
  }),

  http.put(api(apiUrls.database.update(id)), async ({ params, request }) => {
    const db = findById(databases, params.id)
    if (!db) return notFound()
    const data = (await request.json()) as DatabaseRequest
    const conflict = conflictName(databases, data.name, db.id)
    if (conflict) return conflict
    Object.assign(db, {
      name: data.name.trim(),
      type: data.type.trim(),
      connectionString: resolveConnectionString(data.connectionString.trim(), db.connectionString),
      description: data.description ?? null,
      isActive: data.isActive ?? true,
      modifiedAt: now(),
    })
    return HttpResponse.json(toDatabaseDto(db))
  }),

  http.delete(api(apiUrls.database.delete(id)), ({ params }) =>
    removeById(databases, params.id) ? new HttpResponse(null, { status: 204 }) : notFound()
  ),

  // Như backend: chỉ kiểm tra được SQL Server; giả lập máy 192.168.1.52 không kết nối được
  http.post(api(apiUrls.database.test(id)), ({ params }) => {
    const db = findById(databases, params.id)
    if (!db) return notFound()
    const type = db.type ?? ''
    if (!SQL_SERVER_TYPES.includes(type.trim().toLowerCase()))
      return HttpResponse.json({ success: false, message: `Chưa hỗ trợ kiểm tra loại '${type}' (hỗ trợ: SqlServer)`, elapsedMs: 0 })
    if (db.connectionString?.includes('192.168.1.52'))
      return HttpResponse.json({ success: false, message: 'Kết nối thất bại: A network-related error occurred (timeout).', elapsedMs: 5012 })
    return HttpResponse.json({ success: true, message: 'Kết nối thành công (SQL Server 16.00.4135)', elapsedMs: 18 })
  }),

  // ---------- StoragePoint ----------
  http.get(api(apiUrls.storagePoint.list), ({ request }) => {
    const { page, totalCount } = paginate(storagePoints, new URL(request.url), (s) => `${s.name} ${s.path} ${s.type}`)
    return HttpResponse.json({ items: page.map(toStorageDto), totalCount })
  }),

  http.get(api(apiUrls.storagePoint.details(id)), ({ params }) => {
    const point = findById(storagePoints, params.id)
    return point ? HttpResponse.json(toStorageDto(point)) : notFound()
  }),

  http.get(api(apiUrls.storagePoint.usage(id)), ({ params }) => {
    const point = findById(storagePoints, params.id)
    return point ? HttpResponse.json(readUsage(point)) : notFound()
  }),

  http.post(api(apiUrls.storagePoint.create), async ({ request }) => {
    const data = (await request.json()) as StoragePointRequest
    const conflict = conflictName(storagePoints, data.name)
    if (conflict) return conflict
    const created: Stored<StoragePoint> = {
      id: ++seq,
      name: data.name.trim(),
      path: data.path.trim(),
      type: data.type.trim(),
      accessKey: data.accessKey ?? null,
      secretKey: data.secretKey ?? null,
      description: data.description ?? null,
      isActive: data.isActive ?? true,
      createdAt: now(),
      modifiedAt: now(),
    }
    storagePoints.push(created)
    return HttpResponse.json(toStorageDto(created))
  }),

  http.put(api(apiUrls.storagePoint.update(id)), async ({ params, request }) => {
    const point = findById(storagePoints, params.id)
    if (!point) return notFound()
    const data = (await request.json()) as StoragePointRequest
    const conflict = conflictName(storagePoints, data.name, point.id)
    if (conflict) return conflict
    if (data.path.trim() !== point.path) delete usages[point.id]
    Object.assign(point, {
      name: data.name.trim(),
      path: data.path.trim(),
      type: data.type.trim(),
      accessKey: data.accessKey ?? null,
      secretKey: resolve(data.secretKey, point.secretKey) ?? null,
      description: data.description ?? null,
      isActive: data.isActive ?? true,
      modifiedAt: now(),
    })
    return HttpResponse.json(toStorageDto(point))
  }),

  http.delete(api(apiUrls.storagePoint.delete(id)), ({ params }) => {
    delete usages[Number(params.id)]
    return removeById(storagePoints, params.id) ? new HttpResponse(null, { status: 204 }) : notFound()
  }),

  // ---------- Server ----------
  http.get(api(apiUrls.server.list), ({ request }) => {
    const { page, totalCount } = paginate(servers, new URL(request.url), (s) => `${s.name} ${s.host} ${s.type}`)
    return HttpResponse.json({ items: page.map(toServerDto), totalCount })
  }),

  http.get(api(apiUrls.server.details(id)), ({ params }) => {
    const server = findById(servers, params.id)
    return server ? HttpResponse.json(toServerDto(server)) : notFound()
  }),

  http.post(api(apiUrls.server.create), async ({ request }) => {
    const data = (await request.json()) as ConfigServerRequest
    const conflict = conflictName(servers, data.name)
    if (conflict) return conflict
    const created: Stored<ConfigServer> = {
      id: ++seq,
      name: data.name.trim(),
      host: data.host.trim(),
      port: data.port ?? null,
      credentials: data.credentials ?? null,
      type: data.type.trim(),
      description: data.description ?? null,
      isActive: data.isActive ?? true,
      createdAt: now(),
      modifiedAt: now(),
    }
    servers.push(created)
    return HttpResponse.json(toServerDto(created))
  }),

  http.put(api(apiUrls.server.update(id)), async ({ params, request }) => {
    const server = findById(servers, params.id)
    if (!server) return notFound()
    const data = (await request.json()) as ConfigServerRequest
    const conflict = conflictName(servers, data.name, server.id)
    if (conflict) return conflict
    Object.assign(server, {
      name: data.name.trim(),
      host: data.host.trim(),
      port: data.port ?? null,
      credentials: resolve(data.credentials, server.credentials) ?? null,
      type: data.type.trim(),
      description: data.description ?? null,
      isActive: data.isActive ?? true,
      modifiedAt: now(),
    })
    return HttpResponse.json(toServerDto(server))
  }),

  http.delete(api(apiUrls.server.delete(id)), ({ params }) =>
    removeById(servers, params.id) ? new HttpResponse(null, { status: 204 }) : notFound()
  ),
]
