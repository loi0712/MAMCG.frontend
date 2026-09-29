import { http, HttpResponse } from 'msw'
import { apiUrls } from '@/api/config/endpoints'
import type { CGServer, CGServerRequest } from '@/features/admin/api/cg-servers'
import { api, notFound, paginate } from './utils'

const id = ':id' as unknown as number

const statuses = [
  { id: 1, name: 'Online' },
  { id: 2, name: 'Offline' },
  { id: 3, name: 'Maintenance' },
]

const now = () => new Date().toISOString()
let seq = 100

export const cgServers: CGServer[] = [
  { id: 1, serverName: 'CG Server - Studio A', ipAddress: '192.168.1.101', port: 5250, location: 'Studio A', isBackupServer: false, statusId: 1, statusName: 'Online', lastChecked: now(), version: '2.3.1', createdAt: now(), modifiedAt: now() },
  { id: 2, serverName: 'CG Server - Studio B', ipAddress: '192.168.1.102', port: 5250, location: 'Studio B', isBackupServer: false, statusId: 1, statusName: 'Online', lastChecked: now(), version: '2.3.1', createdAt: now(), modifiedAt: now() },
  { id: 3, serverName: 'CG Server - Backup', ipAddress: '192.168.1.103', port: 5250, location: 'Server room', isBackupServer: true, statusId: 3, statusName: 'Maintenance', lastChecked: null, version: '2.3.0', createdAt: now(), modifiedAt: now() },
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

  http.post(api(apiUrls.cgServer.create), async ({ request }) => {
    const data = (await request.json()) as CGServerRequest
    const conflict = conflictIp(data.ipAddress)
    if (conflict) return conflict
    const created = { id: ++seq, lastChecked: null, createdAt: now() } as CGServer
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

  // Máy chủ đang bảo trì giữ nguyên trạng thái; còn lại giả lập kết nối được
  http.post(api(apiUrls.cgServer.check(id)), ({ params }) => {
    const server = cgServers.find((s) => s.id === Number(params.id))
    if (!server) return notFound()
    const reachable = server.statusId !== 3
    server.lastChecked = now()
    if (server.statusId !== 3) Object.assign(server, { statusId: 1, statusName: 'Online' })
    return HttpResponse.json({
      reachable,
      message: reachable ? null : 'Máy chủ đang bảo trì',
      elapsedMs: 12,
      server,
    })
  }),
]
