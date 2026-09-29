import type { ReactNode } from 'react'
import { Activity, Clock, Cpu, Database, HardDrive, RefreshCw, Server, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/shared/lib/utils'
import {
  type RecentActivity,
  type StorageStat,
  formatBytes,
  formatDateTime,
  formatNumber,
  formatUptime,
  isServiceStatus,
  overallStatus,
  percent,
  SERVICE_STATUS,
  useSystemDashboard,
} from '../api/system'

function InfoRow({ label, children, last }: { label: string; children: ReactNode; last?: boolean }) {
  return (
    <div className={cn('flex justify-between gap-4 py-2', !last && 'border-b border-border')}>
      <span className='text-muted-foreground shrink-0'>{label}</span>
      <span className='text-foreground text-right break-all'>{children}</span>
    </div>
  )
}

function StorageCard({ storage }: { storage: StorageStat }) {
  const used = storage.usedBytes
  const total = storage.totalBytes
  const free = storage.freeBytes
  return (
    <Card className='bg-card border-border p-6'>
      <div className='flex items-center justify-between gap-2 mb-4'>
        <div className='flex items-center gap-2 min-w-0'>
          <HardDrive className='w-5 h-5 text-primary shrink-0' />
          <h3 className='text-primary truncate'>{storage.name ?? 'Lưu trữ'}</h3>
        </div>
        {storage.available ? (
          <Badge variant='outline' className='border-green-500 text-green-400'>Sẵn sàng</Badge>
        ) : (
          <Badge variant='outline' className='border-red-500 text-red-400'>Không truy cập được</Badge>
        )}
      </div>
      {storage.available ? (
        <div className='space-y-3'>
          <div className='flex justify-between text-sm'>
            <span className='text-muted-foreground'>Đã sử dụng</span>
            <span className='text-foreground'>
              {formatBytes(used)}
              {total != null && ` / ${formatBytes(total)}`}
            </span>
          </div>
          {total != null && <Progress value={percent(used, total)} className='h-2' />}
          <div className='text-xs text-muted-foreground'>
            {free != null
              ? `Còn trống: ${formatBytes(free)}${total ? ` (${Math.round(percent(free, total))}%)` : ''}`
              : 'Không xác định được dung lượng trống'}
          </div>
        </div>
      ) : (
        <div className='text-sm text-red-400'>{storage.message ?? 'Không truy cập được điểm lưu trữ'}</div>
      )}
      <div className='mt-4 pt-4 border-t border-border'>
        <div className='text-xs text-muted-foreground'>Loại: {storage.type ?? '—'}</div>
      </div>
    </Card>
  )
}

// Hôm nay chỉ hiện giờ, ngày khác hiện cả ngày
const formatActivityTime = (value: string | undefined) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  const sameDay = date.toDateString() === new Date().toDateString()
  return sameDay
    ? date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    : date.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

function ActivityItem({ activity }: { activity: RecentActivity }) {
  const success = activity.outcome?.toLowerCase() === 'success'
  return (
    <div className='flex items-center gap-4 p-3 bg-muted rounded border border-border'>
      <div className='text-xs text-muted-foreground w-24 shrink-0'>{formatActivityTime(activity.time)}</div>
      <div className='flex-1 min-w-0'>
        <div className='text-sm text-foreground truncate'>{activity.action ?? '—'}</div>
        <div className='text-xs text-muted-foreground mt-1'>bởi {activity.userName ?? 'Hệ thống'}</div>
      </div>
      <Badge
        variant='outline'
        className={success ? 'border-green-500 text-green-400' : 'border-red-500 text-red-400'}
      >
        {success ? 'Thành công' : 'Thất bại'}
      </Badge>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className='h-28' />
        ))}
      </div>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
        <Skeleton className='h-72' />
        <Skeleton className='h-72' />
      </div>
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className='h-56' />
        ))}
      </div>
      <Skeleton className='h-64' />
    </div>
  )
}

export function DashboardView() {
  const { data, isLoading, isError, isFetching, refetch } = useSystemDashboard()

  if (isLoading) return <DashboardSkeleton />

  if (isError && !data) {
    return (
      <Card className='bg-card border-border p-6 flex flex-col items-center gap-3 text-center'>
        <div className='text-destructive'>Không tải được dữ liệu tổng quan hệ thống.</div>
        <Button variant='outline' onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={cn('w-4 h-4 mr-2', isFetching && 'animate-spin')} />
          Thử lại
        </Button>
      </Card>
    )
  }

  const server = data?.server
  const users = data?.users
  const media = data?.media
  const storage = data?.storage ?? []
  const services = data?.services ?? []
  const databases = services.filter((s) => s.sizeBytes != null || s.name?.startsWith('Database'))
  const activities = data?.recentActivities ?? []
  const cg = data?.cgServers
  const status = overallStatus(services.map((s) => s.status))
  const cpu = server?.cpuPercent ?? 0
  const totalDbSize = databases.reduce((sum, d) => sum + (d.sizeBytes ?? 0), 0)

  return (
    <div className='space-y-4'>
      {/* Toolbar */}
      <div className='flex flex-wrap items-center justify-end gap-3'>
        <span className='text-xs text-muted-foreground'>
          Cập nhật lúc {formatDateTime(data?.generatedAt)} · tự làm mới mỗi 30 giây
        </span>
        <Button variant='outline' size='sm' onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={cn('w-4 h-4 mr-2', isFetching && 'animate-spin')} />
          Làm mới
        </Button>
      </div>

      {/* System Status Cards */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
        <Card className='bg-card border-border p-4'>
          <div className='flex items-center justify-between mb-2'>
            <div className='text-sm text-muted-foreground'>Trạng thái hệ thống</div>
            <Activity className={cn('w-4 h-4', status.className)} />
          </div>
          <div className={cn('text-2xl', status.className)}>{status.label}</div>
          <div className='text-xs text-muted-foreground mt-1'>Uptime: {formatUptime(server?.uptimeSeconds)}</div>
        </Card>

        <Card className='bg-card border-border p-4'>
          <div className='flex items-center justify-between mb-2'>
            <div className='text-sm text-muted-foreground'>Người dùng online</div>
            <Users className='w-4 h-4 text-primary' />
          </div>
          <div className='text-2xl text-foreground'>
            {formatNumber(users?.activeLast15Min)}
            <span className='text-sm text-muted-foreground'>/{formatNumber(users?.active)}</span>
          </div>
          <div className='text-xs text-muted-foreground mt-1'>
            Hoạt động 15 phút qua · {formatNumber(users?.loggedInLast24h)} đăng nhập 24h
          </div>
        </Card>

        <Card className='bg-card border-border p-4'>
          <div className='flex items-center justify-between mb-2'>
            <div className='text-sm text-muted-foreground'>CPU (API server)</div>
            <Cpu className='w-4 h-4 text-yellow-400' />
          </div>
          <div className='text-2xl text-foreground'>{server ? `${Math.round(cpu)}%` : '—'}</div>
          <Progress value={Math.min(100, cpu)} className='mt-2 h-1' />
        </Card>

        <Card className='bg-card border-border p-4'>
          <div className='flex items-center justify-between mb-2'>
            <div className='text-sm text-muted-foreground'>RAM (API server)</div>
            <HardDrive className='w-4 h-4 text-blue-400' />
          </div>
          <div className='text-2xl text-foreground'>
            {formatBytes(server?.processMemoryBytes)}
            <span className='text-sm text-muted-foreground'>/{formatBytes(server?.totalAvailableMemoryBytes, 0)}</span>
          </div>
          <Progress
            value={percent(server?.processMemoryBytes, server?.totalAvailableMemoryBytes)}
            className='mt-2 h-1'
          />
        </Card>
      </div>

      {/* Server & Database Info */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
        <Card className='bg-card border-border p-6'>
          <div className='flex items-center gap-2 mb-4'>
            <Server className='w-5 h-5 text-primary' />
            <h3 className='text-primary'>Thông tin Server</h3>
          </div>
          <div className='space-y-3 text-sm'>
            <InfoRow label='Phiên bản'>{server?.version ?? '—'}</InfoRow>
            <InfoRow label='Nền tảng'>{server?.osDescription ?? '—'}</InfoRow>
            <InfoRow label='Runtime'>{server?.framework ?? '—'}</InfoRow>
            <InfoRow label='Máy chủ'>
              {server?.machineName ?? '—'}
              {server?.processorCount ? ` · ${server.processorCount} lõi` : ''}
            </InfoRow>
            <InfoRow label='Môi trường'>{server?.environment ?? '—'}</InfoRow>
            <InfoRow label='Khởi động lúc'>{formatDateTime(server?.startedAt)}</InfoRow>
            <InfoRow label='CG Server'>
              {cg ? (
                <>
                  <span className='text-green-400'>{cg.online ?? 0} online</span>
                  {` / ${cg.total ?? 0}`}
                  {(cg.maintenance ?? 0) > 0 && ` · ${cg.maintenance} bảo trì`}
                </>
              ) : (
                '—'
              )}
            </InfoRow>
            <InfoRow label='Xác thực' last>
              <Badge variant='outline' className='border-green-500 text-green-400'>
                {server?.authMethod ?? '—'}
              </Badge>
            </InfoRow>
          </div>
        </Card>

        <Card className='bg-card border-border p-6'>
          <div className='flex items-center gap-2 mb-4'>
            <Database className='w-5 h-5 text-primary' />
            <h3 className='text-primary'>Cơ sở dữ liệu</h3>
          </div>
          <div className='space-y-3 text-sm'>
            {databases.length === 0 ? (
              <div className='text-muted-foreground py-2'>Không có dữ liệu</div>
            ) : (
              <>
                {databases.map((db) => {
                  const cfg = isServiceStatus(db.status) ? SERVICE_STATUS[db.status] : SERVICE_STATUS.not_configured
                  return (
                    <InfoRow key={db.name} label={db.name?.replace(/^Database\s*/, '') || '—'}>
                      <span className='inline-flex items-center gap-2'>
                        <span className='text-muted-foreground text-xs'>{db.detail}</span>
                        {formatBytes(db.sizeBytes)}
                        <span className={cn('inline-block h-2 w-2 rounded-full', cfg.dot)} title={cfg.label} />
                      </span>
                    </InfoRow>
                  )
                })}
                <InfoRow label='Tổng kích thước DB' last>
                  {formatBytes(totalDbSize)}
                </InfoRow>
              </>
            )}
          </div>
        </Card>
      </div>

      {/* Storage & Media Statistics */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {storage.length === 0 ? (
          <Card className='bg-card border-border p-6 flex items-center justify-center text-sm text-muted-foreground'>
            Chưa cấu hình điểm lưu trữ
          </Card>
        ) : (
          storage.map((s) => <StorageCard key={s.id} storage={s} />)
        )}

        <Card className='bg-card border-border p-6'>
          <div className='flex items-center gap-2 mb-4'>
            <Activity className='w-5 h-5 text-primary' />
            <h3 className='text-primary'>Thống kê Media</h3>
          </div>
          <div className='space-y-3 text-sm'>
            <InfoRow label='Video'>{formatNumber(media?.video)}</InfoRow>
            <InfoRow label='Audio'>{formatNumber(media?.audio)}</InfoRow>
            <InfoRow label='Hình ảnh'>{formatNumber(media?.image)}</InfoRow>
            <InfoRow label='Khác'>{formatNumber(media?.other)}</InfoRow>
            <InfoRow label='Tổng số media'>{formatNumber(media?.totalAssets)}</InfoRow>
            <InfoRow label='Trường metadata'>{formatNumber(media?.fieldCount)}</InfoRow>
            <InfoRow label='Tổng dung lượng' last>
              {formatBytes(media?.totalSizeBytes)}
            </InfoRow>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className='bg-card border-border p-6'>
        <div className='flex items-center gap-2 mb-4'>
          <Clock className='w-5 h-5 text-primary' />
          <h3 className='text-primary'>Hoạt động gần đây</h3>
        </div>
        <div className='space-y-3'>
          {activities.length === 0 ? (
            <div className='text-sm text-muted-foreground text-center py-6'>Chưa có hoạt động nào</div>
          ) : (
            activities.map((activity, index) => (
              <ActivityItem key={`${activity.time}-${index}`} activity={activity} />
            ))
          )}
        </div>
      </Card>
    </div>
  )
}
