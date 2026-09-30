import { Link } from '@tanstack/react-router'
import { Bell, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/shared/lib/utils'
import { useMyAccess } from '@/features/admin/api/permissions'
import {
  type InboxNotification,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useMyNotifications,
  useUnreadNotificationCount,
} from '@/features/admin/api/notifications'

const RECENT = { pageNumber: 1, pageSize: 5 }

// Chỉ mở liên kết nội bộ (/...) hoặc http(s)
const safeUrl = (url?: string | null) => (url && /^(\/|https?:\/\/)/i.test(url) ? url : null)

/** Chuông thông báo trên header: số chưa đọc (realtime / polling) + 5 thông báo gần nhất. */
export function NotificationDropdown() {
  const { data: unread = 0 } = useUnreadNotificationCount()
  const { data } = useMyNotifications(RECENT)
  const { data: access } = useMyAccess()
  const markRead = useMarkNotificationRead()
  const markAllRead = useMarkAllNotificationsRead()
  const items = data?.items ?? []

  const openItem = (n: InboxNotification) => {
    if (!n.isRead && n.id !== undefined) markRead.mutate(n.id)
    const url = safeUrl(n.url)
    if (url) window.location.assign(url)
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button size='icon' variant='ghost' aria-label='Thông báo' className='relative rounded-full'>
          <Bell aria-hidden='true' />
          {unread > 0 && (
            <span className='bg-destructive absolute -top-0.5 -right-0.5 min-w-4 rounded-full px-1 text-[10px] leading-4 text-white'>
              {unread > 99 ? '99+' : unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-80' align='end'>
        <DropdownMenuLabel className='flex items-center justify-between font-normal'>
          <span className='text-sm font-medium'>Thông báo</span>
          <span className='text-muted-foreground text-xs'>{unread} chưa đọc</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.length === 0 && <p className='text-muted-foreground px-2 py-4 text-center text-xs'>Không có thông báo</p>}
        {items.map((n) => (
          <DropdownMenuItem key={n.id} className='flex flex-col items-start gap-0.5' onSelect={() => openItem(n)}>
            <span className={cn('flex w-full items-center gap-1.5 text-sm', !n.isRead && 'font-medium')}>
              {!n.isRead && <span className='bg-primary h-1.5 w-1.5 shrink-0 rounded-full' />}
              <span className='truncate'>{n.subject || n.notifyTypeName || 'Thông báo'}</span>
              {safeUrl(n.url) && <ExternalLink className='text-muted-foreground ms-auto h-3 w-3 shrink-0' />}
            </span>
            <span className='text-muted-foreground line-clamp-2 text-xs'>{n.message}</span>
            <span className='text-muted-foreground text-[10px]'>
              {n.createdAt ? new Date(n.createdAt).toLocaleString('vi-VN') : ''}
            </span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <div className='flex items-center justify-between px-1 py-1'>
          <Button
            variant='ghost'
            size='sm'
            className='h-7 text-xs'
            disabled={unread === 0 || markAllRead.isPending}
            onClick={() => markAllRead.mutate()}
          >
            Đánh dấu tất cả đã đọc
          </Button>
          {/* Hộp thư đầy đủ nằm trong trang quản trị */}
          {access?.isAdmin && (
            <Button variant='link' size='sm' className='h-7 text-xs' asChild>
              <Link to='/admin/notifications'>Xem tất cả</Link>
            </Button>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
