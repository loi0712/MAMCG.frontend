import { Cpu, HardDrive } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { type CGChannel, type CGServer, hasCGMetrics, isActiveChannelState } from '../../api/cg-servers'
import { formatBytes, formatDateTime, formatUptime } from '../../api/system'

const STATE_LABELS: Record<string, string> = {
  playing: 'Đang phát',
  play: 'Đang phát',
  onair: 'On air',
  'on-air': 'On air',
  on_air: 'On air',
  live: 'Live',
  running: 'Đang chạy',
  idle: 'Chờ',
  stopped: 'Dừng',
  stop: 'Dừng',
  error: 'Lỗi',
  failed: 'Lỗi',
}

export function ChannelStateBadge({ state }: { state?: string | null }) {
  const s = (state ?? '').trim().toLowerCase()
  const className = isActiveChannelState(s)
    ? 'border-green-500 text-green-400 bg-green-900/20'
    : s === 'error' || s === 'failed'
      ? 'border-red-500 text-red-400'
      : s === 'idle'
        ? 'border-blue-500 text-blue-400'
        : 'border-border text-muted-foreground'
  return (
    <Badge variant='outline' className={className}>
      {STATE_LABELS[s] ?? (state || '—')}
    </Badge>
  )
}

const formatFps = (fps?: number | null) =>
  fps != null && fps > 0 ? `${fps.toLocaleString('vi-VN', { maximumFractionDigits: 2 })} fps` : '—'

// Fps trung bình của các kênh có fps > 0 (như AvgFps phía backend)
export const averageFps = (channels: CGChannel[]) => {
  const values = channels.map((c) => c.fps ?? 0).filter((f) => f > 0)
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : null
}

export const formatLatency = (ms?: number | null) => (ms != null ? `${ms} ms` : '—')

export const formatMemoryMb = (mb?: number | null) => (mb != null ? formatBytes(mb * 1024 * 1024) : '—')

function InfoTile({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className='text-center p-3 bg-background rounded border border-border'>
      <div className='text-xs text-muted-foreground mb-1'>{label}</div>
      <div className='text-sm text-foreground'>{value}</div>
    </div>
  )
}

// Số liệu mới nhất của một CG server: ô tóm tắt, CPU/RAM, danh sách kênh
export function CGServerMetricsPanel({ server }: { server: CGServer }) {
  const channels = server.channels ?? []
  const reported = hasCGMetrics(server)
  const total = server.channelCount ?? (reported ? channels.length : null)
  const active = server.activeChannels ?? (reported ? channels.filter((c) => isActiveChannelState(c.state)).length : null)
  const cpu = server.cpuPercent

  return (
    <div className='space-y-3'>
      <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
        <InfoTile label='Uptime' value={formatUptime(server.uptimeSeconds)} />
        <InfoTile label='Kênh đang phát' value={total != null ? `${active ?? 0}/${total}` : '—'} />
        <InfoTile label='FPS TB' value={formatFps(averageFps(channels))} />
        <InfoTile label='Độ trễ' value={formatLatency(server.latencyMs)} />
      </div>

      {reported ? (
        <>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div>
              <div className='flex items-center justify-between text-xs mb-1'>
                <span className='text-muted-foreground flex items-center gap-1'>
                  <Cpu className='w-3 h-3' /> CPU
                </span>
                <span className='text-foreground'>
                  {cpu != null ? `${cpu.toLocaleString('vi-VN', { maximumFractionDigits: 1 })}%` : '—'}
                </span>
              </div>
              <Progress value={Math.min(100, Math.max(0, cpu ?? 0))} className='h-1.5' />
            </div>
            <div>
              <div className='flex items-center justify-between text-xs mb-1'>
                <span className='text-muted-foreground flex items-center gap-1'>
                  <HardDrive className='w-3 h-3' /> RAM đang dùng
                </span>
                <span className='text-foreground'>{formatMemoryMb(server.memoryMb)}</span>
              </div>
            </div>
          </div>

          {channels.length > 0 ? (
            <div className='rounded border border-border divide-y divide-border bg-background'>
              {channels.map((c) => (
                <div key={c.id} className='flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm'>
                  <div className='flex items-center gap-2 min-w-0'>
                    <span className='text-muted-foreground text-xs w-6 shrink-0'>#{c.id}</span>
                    <span className='text-foreground truncate'>{c.name || `Kênh ${c.id}`}</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    {c.format && (
                      <Badge variant='outline' className='border-border text-muted-foreground font-mono'>
                        {c.format}
                      </Badge>
                    )}
                    <Badge variant='outline' className='border-border text-muted-foreground'>
                      {formatFps(c.fps)}
                    </Badge>
                    <ChannelStateBadge state={c.state} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='text-xs text-muted-foreground'>CG app không báo kênh nào.</div>
          )}

          <div className='text-xs text-muted-foreground'>Số liệu cập nhật: {formatDateTime(server.metricsUpdatedAt)}</div>
        </>
      ) : (
        <div className='rounded border border-dashed border-border px-3 py-2 text-xs text-muted-foreground'>
          Chưa có số liệu — CG app chưa trả lời lệnh status hoặc chưa gửi heartbeat. Trạng thái vẫn được xác định qua kết nối TCP.
        </div>
      )}
    </div>
  )
}
