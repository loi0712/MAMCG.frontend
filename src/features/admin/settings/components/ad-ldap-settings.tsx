import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Pencil, Plus, RefreshCw, TestTube, Trash2, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { AdminPagination } from '../../components/admin-pagination'
import { AdminTableState } from '../../components/admin-table-state'
import {
  formatDateTime,
  formatSyncInterval,
  isLdapSyncStatusFailed,
  type LdapConfiguration,
  useDeleteLdapConfiguration,
  useLdapConfigurations,
} from '../../api/settings'
import { LdapFormDialog } from './ldap-form-dialog'
import { LdapSyncDialog } from './ldap-sync-dialog'
import { LdapTestDialog } from './ldap-test-dialog'
import { LdapUsersDialog } from './ldap-users-dialog'

const PAGE_SIZE = 10

export function ADLDAPSettings() {
  const [page, setPage] = useState(1)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<LdapConfiguration | null>(null)
  const [testing, setTesting] = useState<LdapConfiguration | null>(null)
  const [deleting, setDeleting] = useState<LdapConfiguration | null>(null)
  const [syncing, setSyncing] = useState<LdapConfiguration | null>(null)
  const [previewing, setPreviewing] = useState<LdapConfiguration | null>(null)

  const { data, isLoading, isError } = useLdapConfigurations({ pageNumber: page, pageSize: PAGE_SIZE })
  const configs = data?.items ?? []
  const deleteConfig = useDeleteLdapConfiguration()

  // Backend dùng cấu hình đang kích hoạt có ID nhỏ nhất để xác thực đăng nhập
  const primaryId = configs
    .filter((c) => c.isActive)
    .reduce<number | undefined>((min, c) => (min === undefined || (c.id ?? 0) < min ? c.id : min), undefined)

  const openForm = (config: LdapConfiguration | null) => {
    setEditing(config)
    setFormOpen(true)
  }

  const confirmDelete = async () => {
    if (!deleting?.id) return
    await deleteConfig.mutateAsync(deleting.id)
    setDeleting(null)
  }

  return (
    <div className='space-y-4'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-primary'>Cấu hình kết nối AD/LDAP</h2>
          <p className='text-sm text-muted-foreground mt-1'>
            Cấu hình kết nối với Active Directory hoặc LDAP server dùng cho đăng nhập
          </p>
        </div>
        <Button
          className='bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2'
          onClick={() => openForm(null)}
        >
          <Plus className='w-4 h-4' />
          Thêm cấu hình
        </Button>
      </div>

      <Card className='bg-card border-border p-4 text-sm text-muted-foreground'>
        Khi đăng nhập, hệ thống xác thực qua cấu hình <span className='text-foreground'>đang kích hoạt</span> có ID nhỏ
        nhất (được đánh dấu “Đang dùng”). Dùng nút kiểm tra để thử kết nối và thử đăng nhập một tài khoản.
        <p className='mt-2'>
          Đồng bộ người dùng tạo/cập nhật tài khoản hệ thống từ LDAP theo ánh xạ thuộc tính. Người dùng đồng bộ đăng nhập
          bằng <span className='text-foreground'>mật khẩu LDAP</span>; tài khoản nội bộ trùng tên đăng nhập được bỏ qua.
          Nên <span className='text-foreground'>xem trước</span> trước khi đồng bộ thật. Lịch sử đồng bộ xem tại{' '}
          <Link to='/admin/logs' className='text-primary underline underline-offset-2'>
            Nhật ký
          </Link>
          .
        </p>
      </Card>

      {/* Table */}
      <div className='border border-border rounded-lg overflow-hidden'>
        <Table>
          <TableHeader>
            <TableRow className='bg-card border-border hover:bg-card'>
              <TableHead className='text-muted-foreground w-16'>ID</TableHead>
              <TableHead className='text-muted-foreground'>Địa chỉ Server</TableHead>
              <TableHead className='text-muted-foreground'>Base DN</TableHead>
              <TableHead className='text-muted-foreground'>Bind DN</TableHead>
              <TableHead className='text-muted-foreground'>SSL</TableHead>
              <TableHead className='text-muted-foreground'>Trạng thái</TableHead>
              <TableHead className='text-muted-foreground'>Đồng bộ</TableHead>
              <TableHead className='text-muted-foreground'>Cập nhật</TableHead>
              <TableHead className='text-muted-foreground text-right'>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AdminTableState
              colSpan={9}
              isLoading={isLoading}
              isError={isError}
              isEmpty={configs.length === 0}
              emptyText='Chưa có cấu hình AD/LDAP nào'
            />
            {configs.map((config) => (
              <TableRow key={config.id} className='border-border hover:bg-accent'>
                <TableCell className='text-muted-foreground font-mono text-xs'>{config.id}</TableCell>
                <TableCell className='text-foreground font-mono'>{config.serverUrl}</TableCell>
                <TableCell className='text-foreground'>{config.baseDn || '—'}</TableCell>
                <TableCell className='text-foreground'>{config.bindDn || <span className='text-muted-foreground'>Ẩn danh</span>}</TableCell>
                <TableCell>
                  {config.useSsl ? (
                    <Badge variant='outline' className='border-green-500 text-green-400'>
                      SSL
                    </Badge>
                  ) : (
                    <span className='text-muted-foreground'>—</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className='flex gap-1'>
                    {config.isActive ? (
                      <Badge variant='outline' className='border-green-500 text-green-400'>
                        Kích hoạt
                      </Badge>
                    ) : (
                      <Badge variant='outline' className='border-border text-muted-foreground'>
                        Tắt
                      </Badge>
                    )}
                    {config.id === primaryId && page === 1 && (
                      <Badge variant='outline' className='border-primary text-primary'>
                        Đang dùng
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className='text-sm max-w-64'>
                  <div className='flex flex-wrap items-center gap-1'>
                    {config.syncEnabled && (config.syncIntervalMinutes ?? 0) > 0 ? (
                      <Badge variant='outline' className='border-primary text-primary'>
                        Tự động · {formatSyncInterval(config.syncIntervalMinutes)}
                      </Badge>
                    ) : (
                      <Badge variant='outline' className='border-border text-muted-foreground'>
                        Thủ công
                      </Badge>
                    )}
                  </div>
                  {config.lastSyncAt ? (
                    <div className='mt-1' title={config.lastSyncStatus ?? undefined}>
                      <div className='text-muted-foreground text-xs'>Lần cuối: {formatDateTime(config.lastSyncAt)}</div>
                      <div
                        className={`text-xs truncate ${
                          isLdapSyncStatusFailed(config.lastSyncStatus) ? 'text-red-400' : 'text-green-500'
                        }`}
                      >
                        {config.lastSyncStatus || '—'}
                      </div>
                    </div>
                  ) : (
                    <div className='text-muted-foreground text-xs mt-1'>Chưa đồng bộ</div>
                  )}
                </TableCell>
                <TableCell className='text-muted-foreground text-sm'>{formatDateTime(config.modifiedAt)}</TableCell>
                <TableCell>
                  <div className='flex gap-2 justify-end'>
                    <Button
                      variant='ghost'
                      size='sm'
                      aria-label='Kiểm tra kết nối'
                      title='Kiểm tra kết nối'
                      className='text-primary hover:text-primary/80 hover:bg-accent'
                      onClick={() => setTesting(config)}
                    >
                      <TestTube className='w-4 h-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      aria-label='Xem người dùng LDAP'
                      title='Xem người dùng LDAP'
                      className='text-primary hover:text-primary/80 hover:bg-accent'
                      onClick={() => setPreviewing(config)}
                    >
                      <Users className='w-4 h-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      aria-label='Xem trước đồng bộ'
                      title='Xem trước đồng bộ'
                      className='text-primary hover:text-primary/80 hover:bg-accent'
                      onClick={() => setSyncing(config)}
                    >
                      <RefreshCw className='w-4 h-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      aria-label='Sửa'
                      className='text-primary hover:text-primary/80 hover:bg-accent'
                      onClick={() => openForm(config)}
                    >
                      <Pencil className='w-4 h-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      aria-label='Xoá'
                      className='text-red-400 hover:text-red-300 hover:bg-accent'
                      onClick={() => setDeleting(config)}
                    >
                      <Trash2 className='w-4 h-4' />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AdminPagination page={page} pageSize={PAGE_SIZE} totalCount={data?.totalCount ?? 0} onPageChange={setPage} />

      <LdapFormDialog open={formOpen} onOpenChange={setFormOpen} config={editing} />

      <LdapTestDialog key={testing?.id ?? 0} config={testing} onOpenChange={(open) => !open && setTesting(null)} />

      <LdapSyncDialog key={`sync-${syncing?.id ?? 0}`} config={syncing} onOpenChange={(open) => !open && setSyncing(null)} />

      <LdapUsersDialog
        key={`users-${previewing?.id ?? 0}`}
        config={previewing}
        onOpenChange={(open) => !open && setPreviewing(null)}
      />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title='Xoá cấu hình AD/LDAP'
        desc={`Xoá cấu hình "${deleting?.serverUrl}"? Người dùng sẽ không đăng nhập qua server này được nữa.`}
        cancelBtnText='Huỷ'
        confirmText='Xoá'
        destructive
        isLoading={deleteConfig.isPending}
        handleConfirm={confirmDelete}
      />
    </div>
  )
}
