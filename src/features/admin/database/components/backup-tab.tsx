import { useEffect, useRef, useState } from 'react'
import { HardDrive, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  formatBackupTime,
  useBackupConfig,
  useBackupDatabases,
  useBackupStatus,
  useInvalidateBackup,
} from '../../api/backup'
import { BackupConfigForm } from './backup-config-form'
import { BackupHistory } from './backup-history'
import { BackupRunDialog } from './backup-run-dialog'

export function BackupTab() {
  const [runOpen, setRunOpen] = useState(false)
  const { data: config, isLoading: configLoading } = useBackupConfig()
  const { data: databases = [], isLoading: databasesLoading } = useBackupDatabases()
  const { data: status } = useBackupStatus()
  const invalidate = useInvalidateBackup()
  const running = !!status?.running

  // Lượt backup vừa kết thúc: tải lại lịch sử/trạng thái lần cuối
  const wasRunning = useRef(false)
  useEffect(() => {
    if (wasRunning.current && !running) {
      toast.info('Lượt backup đã kết thúc, xem kết quả trong lịch sử')
      invalidate()
    }
    wasRunning.current = running
  }, [running, invalidate])

  const nextRunText = !status ? '—' : !status.scheduleEnabled ? 'Lịch đang tắt' : formatBackupTime(status.nextRunAt)

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <p className='text-muted-foreground text-sm'>
          Backup toàn bộ CSDL của hệ thống (SQL Server) theo lịch hoặc chạy ngay. File .bak được lưu trên máy chủ SQL
          Server.
        </p>
        <Button
          className='bg-primary hover:bg-primary/90 text-primary-foreground'
          disabled={running}
          onClick={() => setRunOpen(true)}
        >
          {running ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <HardDrive className='mr-2 h-4 w-4' />}
          {running ? 'Đang backup...' : 'Backup ngay'}
        </Button>
      </div>

      {/* Trạng thái */}
      <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
        <div className='bg-card border-border rounded-lg border p-4'>
          <div className='text-muted-foreground text-sm'>Trạng thái</div>
          <div className={`mt-2 flex items-center gap-2 text-2xl ${running ? 'text-blue-400' : 'text-green-400'}`}>
            {!status ? (
              '—'
            ) : running ? (
              <>
                <Loader2 className='h-5 w-5 animate-spin' /> Đang chạy
              </>
            ) : (
              'Sẵn sàng'
            )}
          </div>
        </div>
        <div className='bg-card border-border rounded-lg border p-4'>
          <div className='text-muted-foreground text-sm'>Lần chạy tiếp theo</div>
          <div className={`mt-2 text-lg ${status?.scheduleEnabled ? 'text-foreground' : 'text-muted-foreground'}`}>
            {nextRunText}
          </div>
        </div>
        <div className='bg-card border-border rounded-lg border p-4'>
          <div className='text-muted-foreground text-sm'>Thành công gần nhất</div>
          <div className='mt-2 text-lg text-green-400'>{formatBackupTime(status?.lastSuccessAt)}</div>
        </div>
        <div className='bg-card border-border rounded-lg border p-4'>
          <div className='text-muted-foreground text-sm'>Lỗi gần nhất</div>
          <div className='mt-2 text-lg text-red-400'>{formatBackupTime(status?.lastFailureAt)}</div>
        </div>
      </div>

      <BackupConfigForm config={config} databases={databases} isLoading={configLoading || databasesLoading} />

      <BackupHistory databases={databases} polling={running} />

      <BackupRunDialog open={runOpen} onOpenChange={setRunOpen} databases={databases} />
    </div>
  )
}
