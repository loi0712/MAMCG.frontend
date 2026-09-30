import { type ReactNode, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Activity, BarChart3, Clock, Cpu, Gauge, HardDrive, Loader2, Play, PlugZap, RefreshCw, Server, Timer, Wrench } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/shared/lib/utils'
import { AdminTableState } from '../components/admin-table-state'
import {
  type CGServer,
  type CGServerCheckResult,
  CG_SERVER_REFRESH_MS,
  CG_SERVER_STATUS,
  checkCGServer,
  useCGServers,
  useCheckCGServer,
} from '../api/cg-servers'
import { ALL_ITEMS } from '../api/common'
import {
  formatBytes,
  formatDateTime,
  formatUptime,
  percent,
  useServerInfo,
  useServiceHealth,
} from '../api/system'
import { CGServerMetricsDialog } from './components/cg-server-metrics-dialog'
import { CGServerMetricsPanel } from './components/cg-server-metrics-panel'
import { ServiceStatusBadge } from './components/service-status-badge'

function InfoRow({ label, children, last }: { label: string; children: ReactNode; last?: boolean }) {
  return (
    <div className={cn('flex justify-between gap-4 py-2', !last && 'border-b border-border')}>
      <span className='text-muted-foreground shrink-0'>{label}</span>
      <span className='text-foreground text-right break-all'>{children}</span>
    </div>
  )
}

function MetricCard({ title, icon, value, children }: { title: string; icon: ReactNode; value: ReactNode; children?: ReactNode }) {
  return (
    <Card className='bg-card border-border p-4'>
      <div className='flex items-center justify-between mb-3'>
        <div className='text-sm text-muted-foreground'>{title}</div>
        {icon}
      </div>
      <div className='text-2xl text-foreground mb-2'>{value}</div>
      {children}
    </Card>
  )
}

function CGStatusBadge({ server }: { server: CGServer }) {
  const config: Record<number, string> = {
    [CG_SERVER_STATUS.online]: 'border-green-500 text-green-400 bg-green-900/20',
    [CG_SERVER_STATUS.offline]: 'border-red-500 text-red-400 bg-red-900/20',
    [CG_SERVER_STATUS.maintenance]: 'border-yellow-500 text-yellow-400 bg-yellow-900/20',
  }
  const labels: Record<number, string> = {
    [CG_SERVER_STATUS.online]: 'Online',
    [CG_SERVER_STATUS.offline]: 'Offline',
    [CG_SERVER_STATUS.maintenance]: 'Bảo trì',
  }
  const id = server.statusId ?? 0
  return (
    <Badge variant='outline' className={config[id] ?? 'border-border text-muted-foreground'}>
      {labels[id] ?? server.statusName ?? '—'}
    </Badge>
  )
}

// ===========================================
// TAB: TRẠNG THÁI HỆ THỐNG
// ===========================================

function SystemTab() {
  const serverQuery = useServerInfo()
  const servicesQuery = useServiceHealth()
  const server = serverQuery.data
  const services = servicesQuery.data ?? []
  const refreshing = serverQuery.isFetching || servicesQuery.isFetching

  const refresh = () => {
    serverQuery.refetch()
    servicesQuery.refetch()
  }

  const cpu = server?.cpuPercent ?? 0
  const loadingServer = serverQuery.isLoading

  return (
    <div className='space-y-4'>
      {/* System Overview */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
        {loadingServer ? (
          Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className='h-32' />)
        ) : (
          <>
            <MetricCard title='CPU (API server)' icon={<Cpu className='w-4 h-4 text-primary' />} value={server ? `${Math.round(cpu)}%` : '—'}>
              <Progress value={Math.min(100, cpu)} className='h-2' />
              <div className='text-xs text-muted-foreground mt-2'>{server?.processorCount ?? '—'} lõi</div>
            </MetricCard>

            <MetricCard title='RAM (API server)' icon={<HardDrive className='w-4 h-4 text-primary' />} value={formatBytes(server?.processMemoryBytes)}>
              <Progress value={percent(server?.processMemoryBytes, server?.totalAvailableMemoryBytes)} className='h-2' />
              <div className='text-xs text-muted-foreground mt-2'>
                {Math.round(percent(server?.processMemoryBytes, server?.totalAvailableMemoryBytes))}% của{' '}
                {formatBytes(server?.totalAvailableMemoryBytes, 0)}
              </div>
            </MetricCard>

            <MetricCard title='GC Heap' icon={<Activity className='w-4 h-4 text-primary' />} value={formatBytes(server?.gcHeapBytes)}>
              <div className='text-xs text-muted-foreground mt-2'>Bộ nhớ managed của .NET</div>
            </MetricCard>

            <MetricCard title='Uptime' icon={<Timer className='w-4 h-4 text-primary' />} value={formatUptime(server?.uptimeSeconds)}>
              <div className='text-xs text-muted-foreground mt-2'>Từ {formatDateTime(server?.startedAt)}</div>
            </MetricCard>
          </>
        )}
      </div>

      {/* Services Status */}
      <Card className='bg-card border-border p-6'>
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center gap-3'>
            <Server className='w-5 h-5 text-primary' />
            <h3 className='text-primary'>Trạng thái dịch vụ</h3>
          </div>
          <div className='flex items-center gap-3'>
            <span className='text-xs text-muted-foreground hidden md:inline'>Tự làm mới mỗi 30 giây</span>
            <Button variant='outline' className='border-border text-foreground hover:bg-accent' onClick={refresh} disabled={refreshing}>
              <RefreshCw className={cn('w-4 h-4 mr-2', refreshing && 'animate-spin')} />
              Làm mới
            </Button>
          </div>
        </div>

        <div className='rounded-md border border-border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dịch vụ</TableHead>
                <TableHead>Chi tiết</TableHead>
                <TableHead className='text-right'>Phản hồi</TableHead>
                <TableHead className='text-right'>Dung lượng</TableHead>
                <TableHead className='text-right'>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AdminTableState
                colSpan={5}
                isLoading={servicesQuery.isLoading}
                isError={servicesQuery.isError && !servicesQuery.data}
                isEmpty={services.length === 0}
                emptyText='Không có dịch vụ nào'
              />
              {services.map((service) => (
                <TableRow key={service.name}>
                  <TableCell className='text-foreground'>{service.name ?? '—'}</TableCell>
                  <TableCell className='text-muted-foreground'>{service.detail ?? '—'}</TableCell>
                  <TableCell className='text-right text-muted-foreground'>
                    {service.elapsedMs != null ? `${service.elapsedMs} ms` : '—'}
                  </TableCell>
                  <TableCell className='text-right text-muted-foreground'>{formatBytes(service.sizeBytes)}</TableCell>
                  <TableCell className='text-right'>
                    <ServiceStatusBadge status={service.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* System Information */}
      <Card className='bg-card border-border p-6'>
        <div className='flex items-center gap-2 mb-4'>
          <Server className='w-5 h-5 text-primary' />
          <h3 className='text-primary'>Thông tin hệ thống</h3>
        </div>
        {loadingServer ? (
          <Skeleton className='h-48' />
        ) : serverQuery.isError && !server ? (
          <div className='text-sm text-destructive'>Không tải được thông tin máy chủ.</div>
        ) : (
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-x-8 text-sm'>
            <div>
              <InfoRow label='Hostname'>{server?.machineName ?? '—'}</InfoRow>
              <InfoRow label='Hệ điều hành'>{server?.osDescription ?? '—'}</InfoRow>
              <InfoRow label='Runtime'>{server?.framework ?? '—'}</InfoRow>
              <InfoRow label='Số lõi CPU' last>{server?.processorCount ?? '—'}</InfoRow>
            </div>
            <div>
              <InfoRow label='Phiên bản'>{server?.version ?? '—'}</InfoRow>
              <InfoRow label='Môi trường'>{server?.environment ?? '—'}</InfoRow>
              <InfoRow label='Khởi động lúc'>{formatDateTime(server?.startedAt)}</InfoRow>
              <InfoRow label='Xác thực' last>{server?.authMethod ?? '—'}</InfoRow>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

// ===========================================
// TAB: TRẠNG THÁI SERVER CG
// ===========================================

function CGServersTab() {
  const queryClient = useQueryClient()
  // Backend giám sát mỗi 60 giây → tự làm mới danh sách để thấy trạng thái/số liệu mới
  const { data, isLoading, isError, isFetching, refetch } = useCGServers(ALL_ITEMS, { refetchInterval: CG_SERVER_REFRESH_MS })
  const [detailsId, setDetailsId] = useState<number | null>(null)
  const checkOne = useCheckCGServer()
  const [checkingIds, setCheckingIds] = useState<Set<number>>(new Set())
  const [checkingAll, setCheckingAll] = useState(false)
  const [results, setResults] = useState<Record<number, CGServerCheckResult>>({})

  const servers = data?.items ?? []
  const count = (statusId: number) => servers.filter((s) => s.statusId === statusId).length
  const detailsServer = servers.find((s) => s.id === detailsId) ?? null

  // Tổng kênh đang phát / tổng kênh của các server có báo số liệu
  const reporting = servers.filter((s) => s.channelCount != null || s.activeChannels != null)
  const activeChannels = reporting.reduce((sum, s) => sum + (s.activeChannels ?? 0), 0)
  const totalChannels = reporting.reduce((sum, s) => sum + (s.channelCount ?? s.channels?.length ?? 0), 0)
  // Độ trễ trung bình của các server đang online có số đo
  const latencies = servers
    .filter((s) => s.statusId === CG_SERVER_STATUS.online && s.latencyMs != null)
    .map((s) => s.latencyMs as number)
  const avgLatency = latencies.length ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : null

  const markChecking = (id: number, on: boolean) =>
    setCheckingIds((prev) => {
      const next = new Set(prev)
      if (on) next.add(id)
      else next.delete(id)
      return next
    })

  const handleCheck = async (id: number) => {
    markChecking(id, true)
    try {
      const result = await checkOne.mutateAsync(id)
      setResults((prev) => ({ ...prev, [id]: result }))
    } catch {
      // Lỗi đã được toast toàn cục
    } finally {
      markChecking(id, false)
    }
  }

  // Kiểm tra lần lượt từng máy chủ, chỉ toast tổng kết một lần
  const handleCheckAll = async () => {
    setCheckingAll(true)
    let reachable = 0
    let failed = 0
    for (const server of servers) {
      if (server.id == null) continue
      markChecking(server.id, true)
      try {
        const result = await checkCGServer(server.id)
        setResults((prev) => ({ ...prev, [server.id as number]: result }))
        if (result.reachable) reachable++
        else failed++
      } catch {
        failed++
      } finally {
        markChecking(server.id, false)
      }
    }
    setCheckingAll(false)
    await queryClient.invalidateQueries({ queryKey: ['admin-cg-servers'] })
    if (failed === 0) toast.success(`Đã kiểm tra ${reachable} CG server: tất cả kết nối được`)
    else toast.warning(`Đã kiểm tra ${reachable + failed} CG server: ${failed} không kết nối được`)
  }

  const lastChecked = servers
    .map((s) => s.lastChecked)
    .filter((d): d is string => !!d)
    .sort()
    .at(-1)

  return (
    <div className='space-y-4'>
      {/* CG Servers Overview */}
      <div className='grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4'>
        <MetricCard title='Tổng Servers' icon={<Server className='w-4 h-4 text-primary' />} value={isLoading ? '—' : (data?.totalCount ?? servers.length)} />
        <MetricCard
          title='Online'
          icon={<Activity className='w-4 h-4 text-green-400' />}
          value={<span className='text-green-400'>{isLoading ? '—' : count(CG_SERVER_STATUS.online)}</span>}
        />
        <MetricCard
          title='Offline'
          icon={<PlugZap className='w-4 h-4 text-red-400' />}
          value={<span className='text-red-400'>{isLoading ? '—' : count(CG_SERVER_STATUS.offline)}</span>}
        />
        <MetricCard
          title='Bảo trì'
          icon={<Wrench className='w-4 h-4 text-yellow-400' />}
          value={<span className='text-yellow-400'>{isLoading ? '—' : count(CG_SERVER_STATUS.maintenance)}</span>}
        />
        <MetricCard
          title='Kênh đang phát'
          icon={<Play className='w-4 h-4 text-primary' />}
          value={isLoading || reporting.length === 0 ? '—' : `${activeChannels}/${totalChannels}`}
        >
          <div className='text-xs text-muted-foreground'>
            {reporting.length === 0 ? 'Chưa có số liệu' : `Từ ${reporting.length} server có báo số liệu`}
          </div>
        </MetricCard>
        <MetricCard
          title='Độ trễ TB'
          icon={<Gauge className='w-4 h-4 text-primary' />}
          value={isLoading || avgLatency == null ? '—' : `${avgLatency} ms`}
        >
          <div className='text-xs text-muted-foreground'>
            {latencies.length === 0 ? 'Chưa có số đo' : `${latencies.length} server online`}
          </div>
        </MetricCard>
      </div>

      {/* CG Servers List */}
      <Card className='bg-card border-border p-6'>
        <div className='flex flex-wrap items-center justify-between gap-3 mb-4'>
          <div className='flex items-center gap-3'>
            <Server className='w-5 h-5 text-primary' />
            <h3 className='text-primary'>Server CG</h3>
            <span className='text-xs text-muted-foreground'>Kiểm tra gần nhất: {formatDateTime(lastChecked)}</span>
            <span className='text-xs text-muted-foreground hidden md:inline'>• Tự làm mới mỗi 30 giây</span>
          </div>
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              className='border-border text-foreground hover:bg-accent'
              onClick={() => refetch()}
              disabled={isFetching}
            >
              <RefreshCw className={cn('w-4 h-4 mr-2', isFetching && 'animate-spin')} />
              Làm mới
            </Button>
            <Button onClick={handleCheckAll} disabled={checkingAll || servers.length === 0}>
              {checkingAll ? <Loader2 className='w-4 h-4 mr-2 animate-spin' /> : <PlugZap className='w-4 h-4 mr-2' />}
              Kiểm tra tất cả
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className='space-y-4'>
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={i} className='h-28' />
            ))}
          </div>
        ) : isError && !data ? (
          <div className='text-sm text-destructive text-center py-8'>Không tải được dữ liệu. Vui lòng thử lại.</div>
        ) : servers.length === 0 ? (
          <div className='text-sm text-muted-foreground text-center py-8'>Chưa có CG server nào</div>
        ) : (
          <div className='space-y-4'>
            {servers.map((server) => {
              const id = server.id ?? 0
              const checking = checkingIds.has(id)
              const result = results[id]
              const online = server.statusId === CG_SERVER_STATUS.online
              return (
                <div key={id} className='p-5 bg-muted rounded-lg border border-border'>
                  {/* Server Header */}
                  <div className='flex items-center justify-between gap-3 mb-4'>
                    <div className='flex items-center gap-3 min-w-0'>
                      <Server className={cn('w-5 h-5 shrink-0', online ? 'text-green-400' : 'text-muted-foreground')} />
                      <div className='min-w-0'>
                        <div className='text-foreground flex items-center gap-2'>
                          <span className='truncate'>{server.serverName ?? '—'}</span>
                          {server.isBackupServer && (
                            <Badge variant='outline' className='border-border text-muted-foreground'>
                              Dự phòng
                            </Badge>
                          )}
                        </div>
                        <div className='text-xs text-muted-foreground mt-1'>
                          {server.ipAddress ?? '—'}
                          {server.port != null && `:${server.port}`}
                          {server.version && ` • ${server.version}`}
                          {server.location && ` • ${server.location}`}
                        </div>
                      </div>
                    </div>
                    <CGStatusBadge server={server} />
                  </div>

                  {result && (
                    <div
                      className={cn(
                        'mb-3 text-xs rounded border px-3 py-2',
                        result.reachable ? 'border-green-500/40 text-green-400' : 'border-red-500/40 text-red-400'
                      )}
                    >
                      {result.reachable
                        ? `Kết nối được (${result.latencyMs ?? result.elapsedMs ?? 0} ms)${result.metricsAvailable ? ' • đã cập nhật số liệu' : ' • CG app không trả số liệu'}`
                        : (result.message ?? 'Không kết nối được')}
                    </div>
                  )}

                  <div className='mb-3'>
                    <CGServerMetricsPanel server={server} />
                  </div>

                  {/* Last check */}
                  <div className='flex items-center justify-between pt-3 border-t border-border'>
                    <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                      <Clock className='w-3 h-3' />
                      Kiểm tra lần cuối: {server.lastChecked ? formatDateTime(server.lastChecked) : 'Chưa kiểm tra'}
                    </div>
                    <div className='flex items-center gap-1'>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='text-muted-foreground hover:text-foreground hover:bg-accent'
                        onClick={() => setDetailsId(id)}
                      >
                        <BarChart3 className='w-3 h-3 mr-1' />
                        Chi tiết
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='text-muted-foreground hover:text-foreground hover:bg-accent'
                        onClick={() => handleCheck(id)}
                        disabled={checking || checkingAll}
                      >
                        {checking ? <Loader2 className='w-3 h-3 mr-1 animate-spin' /> : <PlugZap className='w-3 h-3 mr-1' />}
                        Kiểm tra
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      <CGServerMetricsDialog server={detailsServer} onOpenChange={(open) => !open && setDetailsId(null)} />
    </div>
  )
}

export function ServerStatusView() {
  const [activeTab, setActiveTab] = useState('system')

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className='space-y-4'>
      <TabsList className='bg-muted border border-border'>
        <TabsTrigger value='system'>Trạng thái hệ thống</TabsTrigger>
        <TabsTrigger value='cg-servers'>Trạng thái Server CG</TabsTrigger>
      </TabsList>

      <TabsContent value='system'>
        <SystemTab />
      </TabsContent>

      <TabsContent value='cg-servers'>
        <CGServersTab />
      </TabsContent>
    </Tabs>
  )
}
