import { http, HttpResponse } from 'msw'
import { apiUrls } from '@/api/config/endpoints'
import { CG_SERVER_STATUS } from '@/features/admin/api/cg-servers'
import type { RecentActivity, ServerInfo, ServiceHealth, StorageStat, SystemDashboard } from '@/features/admin/api/system'
import { cgServers } from './cg-servers'
import { api } from './utils'

const GB = 1024 ** 3
const TB = 1024 ** 4
const startedAt = new Date(Date.now() - (5 * 86_400 + 7 * 3_600 + 23 * 60) * 1000).toISOString()

// Dao động nhẹ để thấy số liệu thay đổi khi tự làm mới
const jitter = (base: number, spread: number) => Math.round(base + (Math.random() - 0.5) * spread)

const serverInfo = (): ServerInfo => ({
  version: '1.0.0+mock',
  environment: 'Development',
  osDescription: 'Ubuntu 22.04.4 LTS',
  framework: '.NET 8.0.31',
  machineName: 'mamcg-api-01',
  processorCount: 8,
  startedAt,
  uptimeSeconds: Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000),
  cpuPercent: jitter(35, 20),
  processMemoryBytes: jitter(1.2 * GB, 0.2 * GB),
  gcHeapBytes: jitter(0.4 * GB, 0.1 * GB),
  totalAvailableMemoryBytes: 16 * GB,
  authMethod: 'LDAP/AD + Local',
})

const databases: [string, string, number][] = [
  ['Identity', 'mamcg_identity', 24],
  ['Asset', 'mamcg_asset', 1840],
  ['Content', 'mamcg_content', 312],
  ['Configuration', 'mamcg_config', 16],
  ['Playout', 'mamcg_playout', 48],
  ['Tracking', 'mamcg_tracking', 620],
]

const services = (): ServiceHealth[] => [
  { name: 'API Server', status: 'running', detail: 'Development', elapsedMs: 0, sizeBytes: null },
  ...databases.map(([module, db, mb]) => ({
    name: `Database ${module}`,
    status: 'running',
    detail: db,
    elapsedMs: jitter(12, 16),
    sizeBytes: mb * 1024 ** 2,
  })),
  { name: 'Message Queue (RabbitMQ)', status: 'degraded', detail: 'Degraded', elapsedMs: 0, sizeBytes: null },
]

const storage: StorageStat[] = [
  { id: 1, name: 'NAS Primary', type: 'Local', available: true, totalBytes: 10 * TB, usedBytes: 4.8 * TB, freeBytes: 5.2 * TB, message: null },
  { id: 2, name: 'Archive S3', type: 'S3', available: true, totalBytes: null, usedBytes: 18.5 * TB, freeBytes: null, message: null },
  { id: 3, name: 'FTP Ingest', type: 'FTP', available: false, totalBytes: null, usedBytes: null, freeBytes: null, message: 'Không kết nối được máy chủ FTP' },
]

const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString()

const recentActivities: RecentActivity[] = [
  { time: minutesAgo(3), userName: 'admin', action: 'POST /api/Auth/login', outcome: 'Success' },
  { time: minutesAgo(12), userName: 'editor01', action: 'PUT /api/Asset/metadata', outcome: 'Success' },
  { time: minutesAgo(25), userName: 'editor02', action: 'POST /api/Auth/login', outcome: 'Failed' },
  { time: minutesAgo(48), userName: 'admin', action: 'PUT /api/FieldGroup/fields/2', outcome: 'Success' },
  { time: minutesAgo(95), userName: 'admin', action: 'POST /api/CGServer/1/check', outcome: 'Success' },
]

const cgServerStats = () => ({
  total: cgServers.length,
  online: cgServers.filter((s) => s.statusId === CG_SERVER_STATUS.online).length,
  offline: cgServers.filter((s) => s.statusId === CG_SERVER_STATUS.offline).length,
  maintenance: cgServers.filter((s) => s.statusId === CG_SERVER_STATUS.maintenance).length,
})

export const systemHandlers = [
  http.get(api(apiUrls.systemStatus.dashboard), () => {
    const dashboard: SystemDashboard = {
      server: serverInfo(),
      users: { total: 100, active: 86, loggedInLast24h: 31, activeLast15Min: jitter(24, 6) },
      media: { totalAssets: 15_842, totalSizeBytes: 23.3 * TB, video: 12_450, audio: 2_892, image: 500, other: 0, fieldCount: 47 },
      storage,
      cgServers: cgServerStats(),
      services: services(),
      recentActivities,
      generatedAt: new Date().toISOString(),
    }
    return HttpResponse.json(dashboard)
  }),

  http.get(api(apiUrls.systemStatus.server), () => HttpResponse.json(serverInfo())),

  http.get(api(apiUrls.systemStatus.services), () => HttpResponse.json(services())),
]
