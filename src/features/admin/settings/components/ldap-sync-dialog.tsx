import { useEffect, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { AlertCircle, CheckCircle, Eye, Info, RefreshCw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ConfirmDialog } from '@/components/confirm-dialog'
import {
  type LdapConfiguration,
  type LdapSyncAction,
  type LdapSyncResult,
  useSyncLdapConfiguration,
} from '../../api/settings'

type LdapSyncDialogProps = {
  config: LdapConfiguration | null
  onOpenChange: (open: boolean) => void
}

const ACTIONS: Record<LdapSyncAction, { label: string; className: string }> = {
  create: { label: 'Tạo mới', className: 'border-green-500 text-green-400' },
  update: { label: 'Cập nhật', className: 'border-primary text-primary' },
  deactivate: { label: 'Khoá', className: 'border-red-500 text-red-400' },
  skip: { label: 'Bỏ qua', className: 'border-yellow-500 text-yellow-500' },
}

const actionInfo = (action: string | null | undefined) =>
  ACTIONS[(action ?? '') as LdapSyncAction] ?? { label: action ?? '—', className: 'border-border text-muted-foreground' }

// Backend trả tối đa 500 thay đổi
const MAX_CHANGES = 500

function SyncCounters({ result }: { result: LdapSyncResult }) {
  const items = [
    { label: 'Tìm thấy', value: result.found, className: 'text-foreground' },
    { label: 'Tạo mới', value: result.created, className: 'text-green-400' },
    { label: 'Cập nhật', value: result.updated, className: 'text-primary' },
    { label: 'Không đổi', value: result.unchanged, className: 'text-muted-foreground' },
    { label: 'Khoá', value: result.deactivated, className: 'text-red-400' },
    { label: 'Bỏ qua', value: result.skipped, className: 'text-yellow-500' },
  ]
  return (
    <div className='grid grid-cols-3 sm:grid-cols-6 gap-2'>
      {items.map((item) => (
        <div key={item.label} className='bg-muted border border-border rounded p-2 text-center'>
          <div className={`text-lg font-semibold ${item.className}`}>{item.value ?? 0}</div>
          <div className='text-xs text-muted-foreground'>{item.label}</div>
        </div>
      ))}
    </div>
  )
}

// Xem trước đồng bộ (dry run) rồi xác nhận đồng bộ thật.
// Nơi dùng đặt key theo id cấu hình để làm mới trạng thái khi đổi cấu hình.
export function LdapSyncDialog({ config, onOpenChange }: LdapSyncDialogProps) {
  const sync = useSyncLdapConfiguration()
  const [result, setResult] = useState<LdapSyncResult | null>(null)
  const [confirming, setConfirming] = useState(false)
  const started = useRef(false)

  const run = async (dryRun: boolean) => {
    if (!config?.id) return
    try {
      const res = await sync.mutateAsync({ id: config.id, dryRun })
      setResult(res)
    } catch {
      // Lỗi HTTP (vd. 409 đang đồng bộ) đã được hiển thị bởi bộ xử lý lỗi chung
    }
  }

  // Tự chạy xem trước khi mở
  useEffect(() => {
    if (!config?.id || started.current) return
    started.current = true
    void run(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config?.id])

  const handleConfirm = async () => {
    await run(false)
    setConfirming(false)
  }

  const changes = result?.changes ?? []
  const isPreview = result?.dryRun ?? true
  const hasChanges = !!result && (result.created ?? 0) + (result.updated ?? 0) + (result.deactivated ?? 0) > 0

  return (
    <Dialog open={!!config} onOpenChange={onOpenChange}>
      <DialogContent className='bg-card border-border text-foreground sm:max-w-4xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='text-primary'>
            {result && !isPreview ? 'Kết quả đồng bộ LDAP' : 'Xem trước đồng bộ LDAP'}
          </DialogTitle>
          <DialogDescription className='font-mono text-xs break-all'>
            {config?.serverUrl}
            {config?.baseDn ? ` — ${config.baseDn}` : ''}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='bg-muted border border-border rounded p-3 text-xs text-muted-foreground flex gap-2'>
            <Info className='w-4 h-4 mt-0.5 shrink-0 text-primary' />
            <span>
              Người dùng đồng bộ đăng nhập bằng <span className='text-foreground'>mật khẩu LDAP</span>. Tài khoản nội bộ
              trùng tên đăng nhập được bỏ qua. Phòng ban/chức vụ chưa có sẽ được tạo tự động. Lịch sử đồng bộ xem tại{' '}
              <Link to='/admin/logs' className='text-primary underline underline-offset-2'>
                Nhật ký → Đồng bộ LDAP
              </Link>
              .
            </span>
          </div>

          {sync.isPending && !result && (
            <div className='flex items-center gap-2 text-sm text-muted-foreground py-6 justify-center'>
              <RefreshCw className='w-4 h-4 animate-spin' />
              Đang đọc danh sách người dùng từ LDAP...
            </div>
          )}

          {result && (
            <>
              {result.success ? (
                <div className='bg-green-900/20 border border-green-500 rounded p-3 text-sm text-green-600 flex gap-2'>
                  <CheckCircle className='w-4 h-4 mt-0.5 shrink-0' />
                  <span className='break-all'>
                    {result.message} ({result.elapsedMs ?? 0} ms)
                  </span>
                </div>
              ) : (
                <div className='bg-red-900/20 border border-red-500 rounded p-3 text-sm text-destructive flex gap-2'>
                  <AlertCircle className='w-4 h-4 mt-0.5 shrink-0' />
                  <span className='break-all'>{result.message ?? 'Đồng bộ thất bại'}</span>
                </div>
              )}

              {result.success && (
                <>
                  <SyncCounters result={result} />
                  {((result.departmentsCreated ?? 0) > 0 || (result.positionsCreated ?? 0) > 0) && (
                    <p className='text-xs text-muted-foreground'>
                      {isPreview ? 'Sẽ tạo' : 'Đã tạo'} {result.departmentsCreated ?? 0} phòng ban mới,{' '}
                      {result.positionsCreated ?? 0} chức vụ mới.
                    </p>
                  )}

                  <div className='border border-border rounded-lg overflow-hidden'>
                    <div className='max-h-80 overflow-y-auto'>
                      <Table>
                        <TableHeader>
                          <TableRow className='bg-card border-border hover:bg-card'>
                            <TableHead className='text-muted-foreground w-28'>Thao tác</TableHead>
                            <TableHead className='text-muted-foreground'>Tên đăng nhập</TableHead>
                            <TableHead className='text-muted-foreground'>Họ tên</TableHead>
                            <TableHead className='text-muted-foreground'>Chi tiết</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {changes.length === 0 && (
                            <TableRow className='border-border hover:bg-transparent'>
                              <TableCell colSpan={4} className='text-center text-muted-foreground py-6'>
                                Không có thay đổi nào
                              </TableCell>
                            </TableRow>
                          )}
                          {changes.map((change, index) => {
                            const info = actionInfo(change.action)
                            return (
                              <TableRow key={`${change.action}-${change.username}-${index}`} className='border-border'>
                                <TableCell>
                                  <Badge variant='outline' className={info.className}>
                                    {info.label}
                                  </Badge>
                                </TableCell>
                                <TableCell className='text-foreground font-mono text-xs'>{change.username}</TableCell>
                                <TableCell className='text-foreground'>{change.fullName || '—'}</TableCell>
                                <TableCell className='text-muted-foreground text-sm whitespace-normal break-all'>
                                  {change.detail || '—'}
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                  {changes.length >= MAX_CHANGES && (
                    <p className='text-xs text-muted-foreground'>Chỉ hiển thị {MAX_CHANGES} thay đổi đầu tiên.</p>
                  )}
                </>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            className='border-border text-foreground hover:bg-accent'
            onClick={() => onOpenChange(false)}
          >
            Đóng
          </Button>
          <Button
            type='button'
            variant='outline'
            className='border-border text-foreground hover:bg-accent flex items-center gap-2'
            onClick={() => run(true)}
            disabled={sync.isPending}
          >
            {sync.isPending ? <RefreshCw className='w-4 h-4 animate-spin' /> : <Eye className='w-4 h-4' />}
            Xem trước lại
          </Button>
          {isPreview && (
            <Button
              type='button'
              className='bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2'
              onClick={() => setConfirming(true)}
              disabled={sync.isPending || !result?.success}
            >
              <RefreshCw className='w-4 h-4' />
              Đồng bộ ngay
            </Button>
          )}
        </DialogFooter>
      </DialogContent>

      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title='Đồng bộ người dùng từ LDAP'
        desc={
          hasChanges
            ? `Áp dụng các thay đổi: tạo ${result?.created ?? 0}, cập nhật ${result?.updated ?? 0}, khoá ${
                result?.deactivated ?? 0
              } người dùng. Kết quả thực tế có thể khác nếu dữ liệu LDAP thay đổi sau khi xem trước.`
            : 'Bản xem trước không có thay đổi nào. Vẫn chạy đồng bộ để cập nhật thời điểm đồng bộ?'
        }
        cancelBtnText='Huỷ'
        confirmText='Đồng bộ ngay'
        destructive={(result?.deactivated ?? 0) > 0}
        isLoading={sync.isPending}
        handleConfirm={handleConfirm}
      />
    </Dialog>
  )
}
