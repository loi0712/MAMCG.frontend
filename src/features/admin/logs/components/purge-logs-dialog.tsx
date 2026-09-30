import { useState } from 'react'
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { cn } from '@/shared/lib/utils'
import { LOG_KIND_LABELS, type LogKind, usePurgeLogs } from '../../api/logs'

type Preset = '30' | '90' | '180' | 'custom'

const PRESETS: Array<{ value: Preset; label: string }> = [
  { value: '30', label: 'Cũ hơn 30 ngày' },
  { value: '90', label: 'Cũ hơn 90 ngày' },
  { value: '180', label: 'Cũ hơn 180 ngày' },
  { value: 'custom', label: 'Trước ngày...' },
]

// Date → ISO giờ địa phương không kèm múi giờ (backend lưu giờ Việt Nam)
const toLocalIso = (date: Date) =>
  new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().replace('Z', '')

const todayStr = () => toLocalIso(new Date()).slice(0, 10)

// Mốc "xoá trước" theo lựa chọn; null khi chưa chọn ngày hợp lệ
const resolveBefore = (preset: Preset, date: string): Date | null => {
  if (preset !== 'custom') return new Date(Date.now() - Number(preset) * 86_400_000)
  if (!date || date > todayStr()) return null
  return new Date(`${date}T00:00:00`)
}

interface PurgeLogsDialogProps {
  kind: LogKind
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PurgeLogsDialog({ kind, open, onOpenChange }: PurgeLogsDialogProps) {
  const [preset, setPreset] = useState<Preset>('90')
  const [date, setDate] = useState('')
  const [confirming, setConfirming] = useState(false)
  const purge = usePurgeLogs()

  const before = resolveBefore(preset, date)
  const label = LOG_KIND_LABELS[kind]

  const handleOpenChange = (next: boolean) => {
    if (purge.isPending) return
    if (!next) setConfirming(false)
    onOpenChange(next)
  }

  const handleConfirm = async () => {
    if (!before) return
    try {
      await purge.mutateAsync({ kind, before: toLocalIso(before) })
      setConfirming(false)
      onOpenChange(false)
    } catch {
      // Lỗi đã được toast toàn cục
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='bg-card border-border sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='text-primary'>Xoá nhật ký {label}</DialogTitle>
          <DialogDescription>
            {confirming ? 'Kiểm tra lại trước khi xoá.' : 'Chọn mốc thời gian: các dòng nhật ký tạo trước mốc này sẽ bị xoá.'}
          </DialogDescription>
        </DialogHeader>

        {confirming && before ? (
          <div className='flex gap-3 rounded-md border border-red-500/40 bg-red-900/10 p-4 text-sm'>
            <AlertTriangle className='h-5 w-5 shrink-0 text-red-400' />
            <div className='space-y-1'>
              <p className='text-foreground'>
                Xoá toàn bộ nhật ký <span className='font-medium'>{label}</span> được tạo trước{' '}
                <span className='font-medium'>{before.toLocaleString('vi-VN')}</span>?
              </p>
              <p className='text-red-400'>Hành động này không thể hoàn tác.</p>
            </div>
          </div>
        ) : (
          <div className='space-y-3'>
            <div className='grid grid-cols-2 gap-2'>
              {PRESETS.map((p) => (
                <button
                  key={p.value}
                  type='button'
                  onClick={() => setPreset(p.value)}
                  className={cn(
                    'rounded-md border px-3 py-2 text-left text-sm transition-colors',
                    preset === p.value
                      ? 'border-primary bg-primary/10 text-foreground'
                      : 'border-border text-muted-foreground hover:bg-accent'
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
            {preset === 'custom' && (
              <Input
                type='date'
                aria-label='Xoá trước ngày'
                value={date}
                max={todayStr()}
                onChange={(e) => setDate(e.target.value)}
                className='bg-muted border-border text-foreground'
              />
            )}
            <p className='text-muted-foreground text-xs'>
              Mốc xoá: {before ? before.toLocaleString('vi-VN') : 'chưa chọn ngày (không được ở tương lai)'}
            </p>
          </div>
        )}

        <DialogFooter>
          {confirming ? (
            <>
              <Button variant='outline' disabled={purge.isPending} onClick={() => setConfirming(false)}>
                Quay lại
              </Button>
              <Button variant='destructive' disabled={purge.isPending} onClick={handleConfirm}>
                {purge.isPending ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Trash2 className='mr-2 h-4 w-4' />}
                Xoá nhật ký
              </Button>
            </>
          ) : (
            <>
              <Button variant='outline' onClick={() => handleOpenChange(false)}>
                Huỷ
              </Button>
              <Button variant='destructive' disabled={!before} onClick={() => setConfirming(true)}>
                Tiếp tục
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
