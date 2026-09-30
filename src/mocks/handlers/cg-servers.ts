import { http, HttpResponse } from 'msw'
import { apiUrls } from '@/api/config/endpoints'
import {
  type CGChannel,
  type CGServer,
  type CGServerMetricPoint,
  type CGServerRequest,
  isActiveChannelState,
  toLocalIso,
} from '@/features/admin/api/cg-servers'
import { api, notFound, paginate } from './utils'

const id = ':id' as unknown as number

const statuses = [
  { id: 1, name: 'Online' },
  { id: 2, name: 'Offline' },
  { id: 3, name: 'Maintenance' },
]

// Giờ địa phương không kèm múi giờ, như backend
const now = () => toLocalIso(new Date())
let seq = 100

const channel = (id: number, name: string, state: string, fps = 25, format = '1080i50'): CGChannel => ({ id, name, format, fps, state })

// Số liệu mới nhất CG app báo về (lệnh status / heartbeat)
const withMetrics = (channels: CGChannel[], cpuPercent: number, memoryMb: number, uptimeSeconds: number, latencyMs: number) => ({
  latencyMs,
  channels,
  channelCount: channels.length,
  activeChannels: channels.filter((c) => isActiveChannelState(c.state)).length,
  cpuPercent,
  memoryMb,
  uptimeSeconds,
  metricsUpdatedAt: now(),
})

const noMetrics = { latencyMs: null, channels: [], channelCount: null, activeChannels: null, cpuPercent: null, memoryMb: null, uptimeSeconds: null, metricsUpdatedAt: null }

export const cgServers: CGServer[] = [
  {
    id: 1, serverName: 'CG Server - Studio A', ipAddress: '192.168.1.101', port: 5250, location: 'Studio A', isBackupServer: false, statusId: 1, statusName: 'Online', lastChecked: now(), version: '2.3.1', createdAt: now(), modifiedAt: now(),
    ...withMetrics([channel(1, 'VTV1', 'playing'), channel(2, 'VTV2', 'playing'), channel(3, 'Preview', 'idle', 50, '1080p50'), channel(4, 'Dự phòng', 'stopped', 0)], 28.4, 1536, 5 * 86_400 + 12 * 3_600 + 34 * 60, 12),
  },
  {
    id: 2, serverName: 'CG Server - Studio B', ipAddress: '192.168.1.102', port: 5250, location: 'Studio B', isBackupServer: false, statusId: 1, statusName: 'Online', lastChecked: now(), version: '2.3.1', createdAt: now(), modifiedAt: now(),
    // CG app chưa hỗ trợ lệnh status: chỉ có độ trễ kết nối TCP
    ...noMetrics,
    latencyMs: 8,
  },
  {
    id: 3, serverName: 'CG Server - Backup', ipAddress: '192.168.1.103', port: 5250, location: 'Server room', isBackupServer: true, statusId: 3, statusName: 'Maintenance', lastChecked: null, version: '2.3.0', createdAt: now(), modifiedAt: now(),
    ...noMetrics,
  },
]

const apply = (target: CGServer, data: CGServerRequest) => {
  Object.assign(target, data, {
    statusName: statuses.find((s) => s.id === data.statusId)?.name ?? null,
    modifiedAt: now(),
  })
}

const conflictIp = (ip: string, exceptId?: number) =>
  cgServers.some((s) => s.ipAddress === ip && s.id !== exceptId)
    ? HttpResponse.json({ title: `Địa chỉ IP ${ip} đã được dùng cho CG server khác.`, status: 409 }, { status: 409 })
    : null

// Lịch sử số liệu giả lập: mỗi 5 phút một điểm, dao động quanh số liệu hiện tại
const METRIC_STEP_MS = 5 * 60_000
const wave = (seed: number, t: number, period: number) => Math.sin(t / period + seed)

function generateMetrics(server: CGServer, from: number, to: number, limit: number): CGServerMetricPoint[] {
  if (server.statusId === 3) return []
  const seed = server.id ?? 0
  const start = Math.max(from, to - limit * METRIC_STEP_MS)
  const first = Math.ceil(start / METRIC_STEP_MS) * METRIC_STEP_MS
  const points: CGServerMetricPoint[] = []
  for (let t = first; t <= to; t += METRIC_STEP_MS) {
    const step = t / METRIC_STEP_MS
    const latencyBase = server.latencyMs ?? 10
    const latencyMs = Math.max(1, Math.round(latencyBase + 4 * wave(seed, step, 7) + (step % 37 === 0 ? 25 : 0)))
    if (!server.metricsUpdatedAt) {
      points.push({ recordedAt: toLocalIso(new Date(t)), latencyMs, cpuPercent: null, memoryMb: null, activeChannels: null, avgFps: null, source: 'probe' })
      continue
    }
    const cpu = (server.cpuPercent ?? 20) + 10 * wave(seed, step, 11) + 3 * wave(seed * 3, step, 2)
    const total = server.channelCount ?? 0
    const active = Math.max(0, Math.min(total, (server.activeChannels ?? 0) + Math.round(wave(seed, step, 23))))
    points.push({
      recordedAt: toLocalIso(new Date(t)),
      latencyMs,
      cpuPercent: Math.round(Math.max(1, Math.min(100, cpu)) * 10) / 10,
      memoryMb: Math.round((server.memoryMb ?? 1024) + 120 * wave(seed, step, 31)),
      activeChannels: active,
      avgFps: active > 0 ? 25 : null,
      source: step % 2 === 0 ? 'heartbeat' : 'probe',
    })
  }
  return points
}

export const cgServerHandlers = [
  http.get(api(apiUrls.cgServer.list), ({ request }) => {
    const { page, totalCount } = paginate(cgServers, new URL(request.url), (s) => `${s.serverName} ${s.ipAddress} ${s.location}`)
    return HttpResponse.json({ items: page, totalCount })
  }),

  http.get(api(apiUrls.cgServer.statuses), () => HttpResponse.json(statuses)),

  http.get(api(apiUrls.cgServer.details(id)), ({ params }) => {
    const server = cgServers.find((s) => s.id === Number(params.id))
    return server ? HttpResponse.json(server) : notFound()
  }),

  http.get(api(apiUrls.cgServer.metrics(id)), ({ params, request }) => {
    const server = cgServers.find((s) => s.id === Number(params.id))
    if (!server) return notFound()
    const url = new URL(request.url)
    const to = url.searchParams.get('to') ? new Date(url.searchParams.get('to') as string).getTime() : Date.now()
    const from = url.searchParams.get('from') ? new Date(url.searchParams.get('from') as string).getTime() : to - 86_400_000
    const limit = Math.min(Math.max(Number(url.searchParams.get('limit') ?? 500), 1), 5000)
    return HttpResponse.json(generateMetrics(server, from, to, limit))
  }),

  http.post(api(apiUrls.cgServer.create), async ({ request }) => {
    const data = (await request.json()) as CGServerRequest
    const conflict = conflictIp(data.ipAddress)
    if (conflict) return conflict
    const created = { id: ++seq, lastChecked: null, createdAt: now(), ...noMetrics } as CGServer
    apply(created, data)
    cgServers.push(created)
    return HttpResponse.json(created)
  }),

  http.put(api(apiUrls.cgServer.update(id)), async ({ params, request }) => {
    const server = cgServers.find((s) => s.id === Number(params.id))
    if (!server) return notFound()
    const data = (await request.json()) as CGServerRequest
    const conflict = conflictIp(data.ipAddress, server.id)
    if (conflict) return conflict
    apply(server, data)
    return HttpResponse.json(server)
  }),

  http.delete(api(apiUrls.cgServer.delete(id)), ({ params }) => {
    const index = cgServers.findIndex((s) => s.id === Number(params.id))
    if (index < 0) return notFound()
    cgServers.splice(index, 1)
    return new HttpResponse(null, { status: 204 })
  }),

  // Máy chủ đang bảo trì giữ nguyên trạng thái; còn lại giả lập kết nối được (+ cập nhật số liệu nếu CG app có báo)
  http.post(api(apiUrls.cgServer.check(id)), ({ params }) => {
    const server = cgServers.find((s) => s.id === Number(params.id))
    if (!server) return notFound()
    const previousStatusId = server.statusId
    const reachable = server.statusId !== 3
    const latencyMs = reachable ? 5 + Math.round(Math.random() * 15) : null
    server.lastChecked = now()
    server.latencyMs = latencyMs
    const metricsAvailable = reachable && !!server.metricsUpdatedAt
    if (metricsAvailable) {
      server.cpuPercent = Math.round((15 + Math.random() * 30) * 10) / 10
      server.uptimeSeconds = (server.uptimeSeconds ?? 0) + 60
      server.metricsUpdatedAt = now()
    }
    if (reachable) Object.assign(server, { statusId: 1, statusName: 'Online' })
    return HttpResponse.json({
      reachable,
      message: reachable ? null : 'Máy chủ đang bảo trì',
      elapsedMs: latencyMs ?? 3000,
      latencyMs,
      metricsAvailable,
      previousStatusId,
      server,
    })
  }),
]
