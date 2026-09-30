import { useEffect, useMemo, useRef, useState } from 'react'

export interface MetricSample {
  time: number
  value: number | null
}

interface MetricLineChartProps {
  title: string
  samples: MetricSample[]
  unit?: string
  // Trục y cố định (vd. CPU 0–100); mặc định tự co theo dữ liệu, luôn bắt đầu từ 0
  maxValue?: number
  // Giá trị nguyên (số kênh): làm tròn vạch chia và dùng đường bậc thang
  integer?: boolean
  formatTime: (time: number) => string
  height?: number
}

const PAD = { top: 12, right: 12, bottom: 22, left: 40 }

const niceMax = (value: number, integer?: boolean) => {
  if (value <= 0) return integer ? 1 : 10
  const exp = 10 ** Math.floor(Math.log10(value))
  const step = [1, 2, 2.5, 5, 10].map((m) => m * exp).find((s) => s >= value / 4) ?? exp * 10
  const max = Math.ceil(value / step) * step
  return integer ? Math.max(1, Math.ceil(max)) : max
}

const formatValue = (value: number, integer?: boolean) =>
  value.toLocaleString('vi-VN', { maximumFractionDigits: integer ? 0 : 1 })

// Biểu đồ đường SVG nhẹ (không dùng thư viện): 1 chuỗi số liệu, 1 trục, di chuột để xem giá trị
export function MetricLineChart({ title, samples, unit = '', maxValue, integer, formatTime, height = 160 }: MetricLineChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  const [hover, setHover] = useState<number | null>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const valid = useMemo(() => samples.filter((s): s is { time: number; value: number } => s.value != null), [samples])

  const geometry = useMemo(() => {
    if (valid.length === 0 || width <= 0) return null
    const minT = samples[0].time
    const maxT = samples[samples.length - 1].time
    const yMax = maxValue ?? niceMax(Math.max(...valid.map((s) => s.value)), integer)
    const innerW = width - PAD.left - PAD.right
    const innerH = height - PAD.top - PAD.bottom
    const x = (t: number) => PAD.left + (maxT === minT ? innerW / 2 : ((t - minT) / (maxT - minT)) * innerW)
    const y = (v: number) => PAD.top + innerH - (Math.min(v, yMax) / yMax) * innerH

    // Ngắt đường khi thiếu số liệu (null)
    const segments: string[] = []
    let current = ''
    let prevY: number | null = null
    for (const s of samples) {
      if (s.value == null) {
        if (current) segments.push(current)
        current = ''
        prevY = null
        continue
      }
      const px = x(s.time)
      const py = y(s.value)
      if (!current) current = `M${px},${py}`
      else current += integer && prevY != null ? `H${px}V${py}` : `L${px},${py}`
      prevY = py
    }
    if (current) segments.push(current)

    const ticks = [0, 0.5, 1].map((f) => ({ value: yMax * f, y: y(yMax * f) }))
    return { x, y, segments, ticks, minT, maxT, innerW }
  }, [samples, valid, width, height, maxValue, integer])

  const latest = valid.at(-1)
  const hovered = hover != null ? valid[hover] : null

  const handleMove = (e: React.PointerEvent<SVGRectElement>) => {
    if (!geometry) return
    const rect = e.currentTarget.getBoundingClientRect()
    const px = e.clientX - rect.left + PAD.left
    let best = 0
    let bestDist = Infinity
    valid.forEach((s, i) => {
      const d = Math.abs(geometry.x(s.time) - px)
      if (d < bestDist) {
        bestDist = d
        best = i
      }
    })
    setHover(best)
  }

  return (
    <div className='bg-muted rounded-lg border border-border p-3'>
      <div className='mb-2 flex items-baseline justify-between gap-2'>
        <div className='text-sm text-muted-foreground'>{title}</div>
        <div className='text-sm text-foreground'>
          {latest ? `${formatValue(latest.value, integer)}${unit}` : '—'}
        </div>
      </div>
      <div ref={containerRef} className='relative w-full' style={{ height }}>
        {valid.length === 0 ? (
          <div className='flex h-full items-center justify-center text-xs text-muted-foreground'>Chưa có số liệu</div>
        ) : (
          geometry && (
            <>
              <svg width={width} height={height} role='img' aria-label={title} className='block'>
                {geometry.ticks.map((t) => (
                  <g key={t.value}>
                    <line
                      x1={PAD.left}
                      x2={width - PAD.right}
                      y1={t.y}
                      y2={t.y}
                      className='stroke-border'
                      strokeWidth={1}
                      strokeDasharray={t.value === 0 ? undefined : '2 4'}
                    />
                    <text x={PAD.left - 6} y={t.y} dy='0.32em' textAnchor='end' className='fill-muted-foreground text-[10px]'>
                      {formatValue(t.value, integer)}
                    </text>
                  </g>
                ))}
                <text x={PAD.left} y={height - 6} className='fill-muted-foreground text-[10px]'>
                  {formatTime(geometry.minT)}
                </text>
                <text x={width - PAD.right} y={height - 6} textAnchor='end' className='fill-muted-foreground text-[10px]'>
                  {formatTime(geometry.maxT)}
                </text>

                {geometry.segments.map((d, i) => (
                  <path key={i} d={d} fill='none' className='stroke-primary' strokeWidth={2} strokeLinejoin='round' strokeLinecap='round' />
                ))}
                {/* Điểm đơn lẻ (không nối được thành đường) vẫn hiển thị */}
                {valid.length === 1 && (
                  <circle cx={geometry.x(valid[0].time)} cy={geometry.y(valid[0].value)} r={4} className='fill-primary' />
                )}

                {hovered && (
                  <g pointerEvents='none'>
                    <line
                      x1={geometry.x(hovered.time)}
                      x2={geometry.x(hovered.time)}
                      y1={PAD.top}
                      y2={height - PAD.bottom}
                      className='stroke-muted-foreground'
                      strokeWidth={1}
                    />
                    <circle
                      cx={geometry.x(hovered.time)}
                      cy={geometry.y(hovered.value)}
                      r={4}
                      className='fill-primary stroke-muted'
                      strokeWidth={2}
                    />
                  </g>
                )}

                <rect
                  x={PAD.left}
                  y={0}
                  width={Math.max(0, geometry.innerW)}
                  height={height}
                  fill='transparent'
                  onPointerMove={handleMove}
                  onPointerLeave={() => setHover(null)}
                />
              </svg>
              {hovered && (
                <div
                  className='pointer-events-none absolute top-0 z-10 rounded border border-border bg-card px-2 py-1 text-xs shadow-md whitespace-nowrap'
                  style={{
                    left: Math.min(Math.max(geometry.x(hovered.time) + 8, 0), Math.max(0, width - 150)),
                  }}
                >
                  <div className='text-muted-foreground'>{formatTime(hovered.time)}</div>
                  <div className='text-foreground'>
                    {formatValue(hovered.value, integer)}
                    {unit}
                  </div>
                </div>
              )}
            </>
          )
        )}
      </div>
    </div>
  )
}
