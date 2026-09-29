import { useEffect, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'

const DAYS = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy']

type DashboardHeaderProps = {
  title: string
  subtitle?: string
}

export function DashboardHeader({ title, subtitle }: DashboardHeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const dayName = DAYS[currentTime.getDay()]
  const dateStr = currentTime.toLocaleDateString('vi-VN')
  const timeStr = currentTime.toLocaleTimeString('vi-VN')

  return (
    <div className='bg-card flex items-center justify-between border-b px-6 py-3'>
      <div>
        <h1 className='text-primary mb-1 text-2xl font-semibold'>{title}</h1>
        {subtitle && <p className='text-muted-foreground text-sm'>{subtitle}</p>}
      </div>
      <div className='flex items-center gap-3'>
        <div className='text-right'>
          <div className='text-muted-foreground text-sm'>
            {dayName}, {dateStr}
          </div>
          <div className='font-mono text-xl'>{timeStr}</div>
        </div>
        <div className='bg-border h-12 w-px' />
        <div className='flex items-center gap-2 rounded border border-green-500/50 bg-green-500/10 px-4 py-2'>
          <CheckCircle2 className='h-5 w-5 text-green-600 dark:text-green-400' />
          <div>
            <div className='text-sm text-green-600 dark:text-green-400'>Hệ thống</div>
            <div className='text-xs text-green-700 dark:text-green-300'>
              Hoạt động bình thường
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
