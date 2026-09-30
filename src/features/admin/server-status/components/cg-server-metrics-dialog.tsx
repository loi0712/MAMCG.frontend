import { useMemo, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/shared/lib/utils'
import {
  CG_METRICS_MAX_LIMIT,
  CG_SERVER_REFRESH_MS,
  type CGServer,
  type CGServerMetricPoint,
  useCGServerMetrics,
} from '../../api/cg-servers'
import { formatDateTime } from '../../api/system'
import { CGServerMetricsPanel } from './cg-server-metrics-panel'
import { type MetricSample, MetricLineChart } from './metric-line-chart'

const HOUR = 3_600_000

const RANGES = [
  { key: '1h', label: '1 giờ', ms: HOUR },
  { key: '6h', label: '6 giờ', ms: 6 * HOUR },
  { key: '24h', label: '24 giờ', ms: 24 * HOUR },
  { key: '7d', label: '7 ngày', ms: 7 * 24 * HOUR },
] as const

type RangeKey = (typeof RANGES)[number]['key']

// Số điểm tối đa vẽ trên biểu đồ; nhiều hơn thì gộp trung bình theo nhóm
const MAX_CHART_POINTS = 240

type NumericKey = 'latencyMs' | 'cpuPercent' | 'activeChannels' | 'memoryMb'

function toSamples(points: CGServerMetricPoint[], key: NumericKey): MetricSample[] {
  const samples = points.map((p) => ({ time: new Date(p.recordedAt ?? 0).getTime(), value: p[key] ?? null }))
  if (samples.length <= MAX_CHART_POINTS) return samples
  const size = Math.ceil(samples.length / MAX_CHART_POINTS)
  const result: MetricSample[] = []
  for (let i = 0; i < samples.length; i += size) {
    const group = samples.slice(i, i + size)
    const values = group.map((s) => s.value).filter((v): v is number => v != null)
    result.push({
      time: group[Math.floor(group.length / 2)].time,
      value: values.length ? values.reduce((a, b) => a + b, 0) / values.length : null,
    })
  }
  return result
}

interface CGServerMetricsDialogProps {
  server: CGServer | null
  onOpenChange: (open: boolean) => void
}

export function CGServerMetricsDialog({ server, onOpenChange }: CGServerMetricsDialogProps) {
  const [range, setRange] = useState<RangeKey>('6h')
  const rangeMs = RANGES.find((r) => r.key === range)?.ms ?? 6 * HOUR
  const { data, isLoading, isError, isFetching, refetch } = useCGServerMetrics(server?.id, rangeMs, {
    refetchInterval: server ? CG_SERVER_REFRESH_MS : undefined,
  })
  const points = useMemo(() => data ?? [], [data])

  const formatTime = (time: number) =>
    new Date(time).toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      ...(rangeMs > 24 * HOUR ? { day: '2-digit', month: '2-digit' } : {}),
    })

  const latency = useMemo(() => toSamples(points, 'latencyMs'), [points])
  const cpu = useMemo(() => toSamples(points, 'cpuPercent'), [points])
  const channels = useMemo(() => toSamples(points, 'activeChannels'), [points])
  const memory = useMemo(() => toSamples(points, 'memoryMb'), [points])
  const hasAppMetrics = points.some((p) => p.cpuPercent != null || p.activeChannels != null || p.memoryMb != null)
  const heartbeats = points.filter((p) => p.source === 'heartbeat').length

  return (
    <Dialog open={!!server} onOpenChange={onOpenChange}>
      <DialogContent className='bg-card border-border max-h-[90vh] overflow-y-auto sm:max-w-4xl'>
        <DialogHeader>
          <DialogTitle className='text-primary'>{server?.serverName ?? 'CG server'}</DialogTitle>
          <DialogDescription>
            {server?.ipAddress ?? '—'}
            {server?.port != null && `:${server.port}`}
            {server?.version && ` • ${server.version}`}
            {server?.location && ` • ${server.location}`}
          </DialogDescription>
        </DialogHeader>

        {server && <CGServerMetricsPanel server={server} />}

        <div className='flex flex-wrap items-center justify-between gap-3 pt-2'>
          <h4 className='text-foreground'>Lịch sử số liệu</h4>
          <div className='flex items-center gap-2'>
            <div className='bg-muted flex rounded-md border border-border p-0.5' role='group' aria-label='Khoảng thời gian'>
              {RANGES.map((r) => (
                <button
                  key={r.key}
                  type='button'
                  onClick={() => setRange(r.key)}
                  aria-pressed={range === r.key}
                  className={cn(
                    'rounded px-3 py-1 text-xs transition-colors',
                    range === r.key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <Button
              variant='outline'
              size='sm'
              className='border-border text-foreground hover:bg-accent'
              onClick={() => refetch()}
              disabled={isFetching}
              aria-label='Làm mới lịch sử'
            >
              <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className='text-muted-foreground py-10 text-center text-sm'>Đang tải số liệu...</div>
        ) : isError && !data ? (
          <div className='text-destructive py-10 text-center text-sm'>Không tải được lịch sử số liệu.</div>
        ) : points.length === 0 ? (
          <div className='text-muted-foreground py-10 text-center text-sm'>
            Chưa có số liệu trong khoảng thời gian này. Backend ghi một điểm mỗi lượt giám sát (60 giây) hoặc khi CG app gửi heartbeat.
          </div>
        ) : (
          <div className='space-y-3'>
            <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
              <MetricLineChart title='Độ trễ kết nối' unit=' ms' samples={latency} formatTime={formatTime} />
              <MetricLineChart title='CPU' unit='%' maxValue={100} samples={cpu} formatTime={formatTime} />
              <MetricLineChart title='Kênh đang phát' integer samples={channels} formatTime={formatTime} />
              <MetricLineChart title='RAM' unit=' MB' samples={memory} formatTime={formatTime} />
            </div>
            <div className='text-muted-foreground flex flex-wrap justify-between gap-2 text-xs'>
              <span>
                {points.length.toLocaleString('vi-VN')} điểm ({heartbeats.toLocaleString('vi-VN')} heartbeat) • từ{' '}
                {formatDateTime(points[0]?.recordedAt)} đến {formatDateTime(points.at(-1)?.recordedAt)}
                {points.length >= CG_METRICS_MAX_LIMIT && ` • chỉ lấy ${CG_METRICS_MAX_LIMIT.toLocaleString('vi-VN')} điểm gần nhất`}
              </span>
              {!hasAppMetrics && <span>CG app chưa báo CPU/RAM/kênh — chỉ có độ trễ kết nối</span>}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
