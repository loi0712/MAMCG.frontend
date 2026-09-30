import { useState } from 'react'
import { AlertCircle, Info, RefreshCw } from 'lucide-react'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { type LdapConfiguration, useLdapUsers } from '../../api/settings'

type LdapUsersDialogProps = {
  config: LdapConfiguration | null
  onOpenChange: (open: boolean) => void
}

const LIMITS = [20, 50, 100, 200]

// Xem thử người dùng đọc được từ LDAP theo ánh xạ thuộc tính của cấu hình (không lưu gì)
export function LdapUsersDialog({ config, onOpenChange }: LdapUsersDialogProps) {
  const [limit, setLimit] = useState(20)
  const { data, isLoading, isFetching, isError, refetch } = useLdapUsers(config?.id, limit)
  const users = data ?? []

  const mapping = [
    ['Tên đăng nhập', config?.attrUsername],
    ['Họ tên', config?.attrFullName],
    ['Email', config?.attrEmail],
    ['Điện thoại', config?.attrPhone],
    ['Phòng ban', config?.attrDepartment],
    ['Chức vụ', config?.attrTitle],
  ] as const

  return (
    <Dialog open={!!config} onOpenChange={onOpenChange}>
      <DialogContent className='bg-card border-border text-foreground sm:max-w-5xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='text-primary'>Người dùng LDAP</DialogTitle>
          <DialogDescription className='font-mono text-xs break-all'>
            {config?.serverUrl}
            {config?.baseDn ? ` — ${config.baseDn}` : ''}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='bg-muted border border-border rounded p-3 text-xs text-muted-foreground flex gap-2'>
            <Info className='w-4 h-4 mt-0.5 shrink-0 text-primary' />
            <div className='space-y-1'>
              <p>
                Dữ liệu đọc trực tiếp từ LDAP theo bộ lọc đồng bộ và ánh xạ thuộc tính đã lưu; chưa có gì được ghi vào
                hệ thống.
              </p>
              <p className='flex flex-wrap gap-x-3 gap-y-1'>
                {mapping.map(([label, attr]) => (
                  <span key={label}>
                    {label}: <span className='font-mono text-foreground'>{attr || '—'}</span>
                  </span>
                ))}
              </p>
            </div>
          </div>

          <div className='flex items-center justify-between gap-2'>
            <span className='text-sm text-muted-foreground'>
              {isLoading ? 'Đang tải...' : `${users.length} người dùng${users.length >= limit ? ` (tối đa ${limit})` : ''}`}
            </span>
            <div className='flex items-center gap-2'>
              <Select value={String(limit)} onValueChange={(v) => setLimit(Number(v))}>
                <SelectTrigger className='bg-muted border-border text-foreground w-32 h-9'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LIMITS.map((l) => (
                    <SelectItem key={l} value={String(l)}>
                      Tối đa {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type='button'
                variant='outline'
                size='sm'
                aria-label='Tải lại'
                title='Tải lại'
                className='border-border text-foreground hover:bg-accent h-9'
                onClick={() => refetch()}
                disabled={isFetching}
              >
                <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>

          <div className='border border-border rounded-lg overflow-hidden'>
            <div className='max-h-[50vh] overflow-auto'>
              <Table>
                <TableHeader>
                  <TableRow className='bg-card border-border hover:bg-card'>
                    <TableHead className='text-muted-foreground'>Tên đăng nhập</TableHead>
                    <TableHead className='text-muted-foreground'>Họ tên</TableHead>
                    <TableHead className='text-muted-foreground'>Email</TableHead>
                    <TableHead className='text-muted-foreground'>Điện thoại</TableHead>
                    <TableHead className='text-muted-foreground'>Phòng ban</TableHead>
                    <TableHead className='text-muted-foreground'>Chức vụ</TableHead>
                    <TableHead className='text-muted-foreground'>Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading && (
                    <TableRow className='border-border hover:bg-transparent'>
                      <TableCell colSpan={7} className='text-center text-muted-foreground py-6'>
                        <span className='inline-flex items-center gap-2'>
                          <RefreshCw className='w-4 h-4 animate-spin' />
                          Đang đọc danh sách người dùng từ LDAP...
                        </span>
                      </TableCell>
                    </TableRow>
                  )}
                  {isError && !isFetching && (
                    <TableRow className='border-border hover:bg-transparent'>
                      <TableCell colSpan={7} className='text-center text-destructive py-6'>
                        <span className='inline-flex items-center gap-2'>
                          <AlertCircle className='w-4 h-4' />
                          Không đọc được người dùng từ LDAP. Hãy kiểm tra kết nối và cấu hình.
                        </span>
                      </TableCell>
                    </TableRow>
                  )}
                  {!isLoading && !isError && users.length === 0 && (
                    <TableRow className='border-border hover:bg-transparent'>
                      <TableCell colSpan={7} className='text-center text-muted-foreground py-6'>
                        Không tìm thấy người dùng nào
                      </TableCell>
                    </TableRow>
                  )}
                  {users.map((user) => (
                    <TableRow
                      key={user.externalId ?? user.distinguishedName ?? user.username}
                      className='border-border hover:bg-accent'
                      title={user.distinguishedName ?? undefined}
                    >
                      <TableCell className='text-foreground font-mono text-xs'>{user.username}</TableCell>
                      <TableCell className='text-foreground'>{user.fullName || '—'}</TableCell>
                      <TableCell className='text-foreground'>{user.email || '—'}</TableCell>
                      <TableCell className='text-foreground'>{user.phone || '—'}</TableCell>
                      <TableCell className='text-foreground'>{user.department || '—'}</TableCell>
                      <TableCell className='text-foreground'>{user.title || '—'}</TableCell>
                      <TableCell>
                        {user.disabled ? (
                          <Badge variant='outline' className='border-red-500 text-red-400'>
                            Bị khoá
                          </Badge>
                        ) : (
                          <Badge variant='outline' className='border-green-500 text-green-400'>
                            Hoạt động
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
