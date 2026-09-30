import { useState } from 'react'
import { Loader2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { usePurgeEmailLogs } from '../../api/email-templates'

type EmailLogPurgeDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const todayIso = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const daysAgoIso = (days: number) => {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// Xoá nhật ký email tạo trước 00:00 của ngày chọn (giờ máy chủ)
export function EmailLogPurgeDialog({ open, onOpenChange }: EmailLogPurgeDialogProps) {
  const [date, setDate] = useState(() => daysAgoIso(30))
  const purge = usePurgeEmailLogs()
  const valid = !!date && date <= todayIso()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!valid) return
    await purge.mutateAsync(`${date}T00:00:00`)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='bg-card border-border text-foreground'>
        <DialogHeader>
          <DialogTitle className='text-primary'>Xoá nhật ký email cũ</DialogTitle>
          <DialogDescription className='text-muted-foreground'>
            Xoá vĩnh viễn mọi bản ghi nhật ký email tạo trước ngày được chọn. Hành động này không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className='space-y-4' noValidate>
          <div className='space-y-2'>
            <Label htmlFor='email-log-purge-before' className='text-foreground'>
              Xoá bản ghi trước ngày
            </Label>
            <Input
              id='email-log-purge-before'
              type='date'
              value={date}
              max={todayIso()}
              onChange={(e) => setDate(e.target.value)}
              className='bg-muted border-border text-foreground w-48'
            />
            <div className='flex flex-wrap gap-2'>
              {[7, 30, 90].map((days) => (
                <Button
                  key={days}
                  type='button'
                  variant='outline'
                  size='sm'
                  className='border-border text-muted-foreground hover:bg-accent h-7 text-xs'
                  onClick={() => setDate(daysAgoIso(days))}
                >
                  Giữ {days} ngày gần nhất
                </Button>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              className='border-border text-muted-foreground hover:bg-accent'
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button type='submit' variant='destructive' disabled={!valid || purge.isPending}>
              {purge.isPending ? <Loader2 className='h-4 w-4 animate-spin' /> : <Trash2 className='h-4 w-4' />}
              Xoá nhật ký
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
