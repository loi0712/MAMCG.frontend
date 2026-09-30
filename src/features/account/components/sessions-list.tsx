import { useState } from 'react'
import { LogOut, Monitor, Smartphone } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AdminTableState } from '@/features/admin/components/admin-table-state'
import { type UserSession, useMySessions, useRevokeOtherSessions, useRevokeSession } from '../api'

const formatDateTime = (value?: string | null) => (value ? new Date(value).toLocaleString('vi-VN') : '—')

// Mô tả ngắn gọn trình duyệt + hệ điều hành từ User-Agent
export function describeUserAgent(ua?: string | null): { label: string; mobile: boolean } {
  if (!ua) return { label: 'Không rõ thiết bị', mobile: false }
  const browser = /Edg\//.test(ua)
    ? 'Edge'
    : /OPR\//.test(ua)
      ? 'Opera'
      : /Chrome\//.test(ua)
        ? 'Chrome'
        : /Firefox\//.test(ua)
          ? 'Firefox'
          : /Safari\//.test(ua)
            ? 'Safari'
            : 'Trình duyệt khác'
  const os = /Windows/.test(ua)
    ? 'Windows'
    : /Android/.test(ua)
      ? 'Android'
      : /iPhone|iPad|iOS/.test(ua)
        ? 'iOS'
        : /Mac OS X|Macintosh/.test(ua)
          ? 'macOS'
          : /Linux/.test(ua)
            ? 'Linux'
            : 'Hệ điều hành khác'
  return { label: `${browser} trên ${os}`, mobile: /Mobile|Android|iPhone|iPad/.test(ua) }
}

export function SessionsList() {
  const { data: sessions = [], isLoading, isError } = useMySessions()
  const revoke = useRevokeSession()
  const revokeOthers = useRevokeOtherSessions()
  const [revoking, setRevoking] = useState<UserSession | null>(null)
  const [confirmOthers, setConfirmOthers] = useState(false)
  const others = sessions.filter((s) => !s.isCurrent).length

  return (
    <Card>
      <CardHeader className='flex flex-row items-start justify-between gap-4 space-y-0'>
        <div className='space-y-1.5'>
          <CardTitle>Phiên đăng nhập</CardTitle>
          <CardDescription>Các thiết bị đang đăng nhập bằng tài khoản của bạn. Đăng xuất phiên lạ nếu nghi ngờ lộ tài khoản.</CardDescription>
        </div>
        <Button variant='outline' disabled={others === 0 || revokeOthers.isPending} onClick={() => setConfirmOthers(true)}>
          <LogOut className='h-4 w-4' />
          Đăng xuất các phiên khác
        </Button>
      </CardHeader>
      <CardContent>
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Thiết bị</TableHead>
                <TableHead>Địa chỉ IP</TableHead>
                <TableHead>Hoạt động gần nhất</TableHead>
                <TableHead>Đăng nhập lúc</TableHead>
                <TableHead className='w-32 text-right'>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AdminTableState colSpan={5} isLoading={isLoading} isError={isError} isEmpty={sessions.length === 0} />
              {sessions.map((s) => {
                const device = describeUserAgent(s.userAgent)
                const Icon = device.mobile ? Smartphone : Monitor
                return (
                  <TableRow key={s.id}>
                    <TableCell>
                      <div className='flex items-center gap-2'>
                        <Icon className='text-muted-foreground h-4 w-4 shrink-0' />
                        <span className='font-medium' title={s.userAgent ?? undefined}>
                          {device.label}
                        </span>
                        {s.isCurrent && <Badge>Phiên hiện tại</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className='font-mono text-sm'>{s.ipAddress ?? '—'}</TableCell>
                    <TableCell>{formatDateTime(s.lastUsedAt)}</TableCell>
                    <TableCell>{formatDateTime(s.createdAt)}</TableCell>
                    <TableCell className='text-right'>
                      {!s.isCurrent && (
                        <Button variant='ghost' size='sm' onClick={() => setRevoking(s)}>
                          Đăng xuất
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <ConfirmDialog
        open={!!revoking}
        onOpenChange={(open) => !open && setRevoking(null)}
        title='Đăng xuất phiên'
        desc={`Đăng xuất phiên "${describeUserAgent(revoking?.userAgent).label}" (${revoking?.ipAddress ?? 'không rõ IP'})?`}
        cancelBtnText='Huỷ'
        confirmText='Đăng xuất'
        destructive
        isLoading={revoke.isPending}
        handleConfirm={async () => {
          if (!revoking) return
          await revoke.mutateAsync(revoking.id).catch(() => undefined)
          setRevoking(null)
        }}
      />
      <ConfirmDialog
        open={confirmOthers}
        onOpenChange={setConfirmOthers}
        title='Đăng xuất các phiên khác'
        desc={`Đăng xuất ${others} phiên trên các thiết bị khác? Phiên hiện tại vẫn giữ nguyên.`}
        cancelBtnText='Huỷ'
        confirmText='Đăng xuất'
        destructive
        isLoading={revokeOthers.isPending}
        handleConfirm={async () => {
          await revokeOthers.mutateAsync().catch(() => undefined)
          setConfirmOthers(false)
        }}
      />
    </Card>
  )
}
