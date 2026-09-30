import { useEffect, useState } from 'react'
import { HardDrive, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { type BackupDatabase, useRunBackup } from '../../api/backup'

type BackupRunDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  databases: BackupDatabase[]
}

// Chọn CSDL cho lượt "Backup ngay"; mặc định theo cấu hình (không chọn gì trong cấu hình = tất cả)
export function BackupRunDialog({ open, onOpenChange, databases }: BackupRunDialogProps) {
  const runBackup = useRunBackup()
  const [selected, setSelected] = useState<string[]>([])

  const allNames = databases.map((d) => d.connectionName ?? '').filter(Boolean)

  useEffect(() => {
    if (!open) return
    const configured = databases.filter((d) => d.selected).map((d) => d.connectionName ?? '')
    setSelected(configured.length ? configured : databases.map((d) => d.connectionName ?? '').filter(Boolean))
  }, [open, databases])

  const toggle = (name: string) =>
    setSelected((prev) => (prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]))

  const allChecked = allNames.length > 0 && selected.length === allNames.length

  const submit = async () => {
    await runBackup.mutateAsync({ databases: selected })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='bg-card border-border text-foreground sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle className='text-primary flex items-center gap-2'>
            <HardDrive className='h-5 w-5' />
            Backup ngay
          </DialogTitle>
          <DialogDescription>
            Chạy backup nền với thư mục và tuỳ chọn trong cấu hình. Tiến độ được cập nhật trong lịch sử.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-2'>
          <label className='flex cursor-pointer items-center gap-3 px-3 text-sm'>
            <Checkbox
              checked={allChecked ? true : selected.length > 0 ? 'indeterminate' : false}
              onCheckedChange={() => setSelected(allChecked ? [] : allNames)}
            />
            <span className='text-foreground'>Chọn tất cả</span>
            <span className='text-muted-foreground ml-auto text-xs'>
              {selected.length}/{allNames.length}
            </span>
          </label>
          <div className='border-border divide-border max-h-80 divide-y overflow-y-auto rounded-md border'>
            {databases.length === 0 && (
              <div className='text-muted-foreground p-4 text-center text-sm'>Không có CSDL nào</div>
            )}
            {databases.map((db) => {
              const name = db.connectionName ?? ''
              return (
                <label key={name} className='hover:bg-accent flex cursor-pointer items-center gap-3 px-3 py-2'>
                  <Checkbox checked={selected.includes(name)} onCheckedChange={() => toggle(name)} />
                  <div className='min-w-0'>
                    <div className='text-foreground text-sm'>{name}</div>
                    <div className='text-muted-foreground truncate font-mono text-xs'>
                      {db.databaseName ?? '—'} · {db.server ?? '—'}
                    </div>
                  </div>
                </label>
              )
            })}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant='outline'
            className='border-border text-foreground hover:bg-accent'
            onClick={() => onOpenChange(false)}
          >
            Huỷ
          </Button>
          <Button
            className='bg-primary hover:bg-primary/90 text-primary-foreground'
            disabled={selected.length === 0 || runBackup.isPending}
            onClick={submit}
          >
            {runBackup.isPending ? (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            ) : (
              <HardDrive className='mr-2 h-4 w-4' />
            )}
            Backup {selected.length} CSDL
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
