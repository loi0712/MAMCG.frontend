import { useCallback, useEffect, useState } from 'react'
import { AlertTriangle, Bell, CheckCircle, ExternalLink, Info, Loader2, Search, Send, Trash2, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { AdminPagination } from '../components/admin-pagination'
import {
  type InboxNotification,
  NOTIFICATION_SEVERITIES,
  type NotificationSeverity,
  toSeverity,
  useDeleteNotification,
  useDeleteReadNotifications,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useMyNotifications,
} from '../api/notifications'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { NotificationTypesTab } from './components/notification-types-tab'
import { SendNotificationDialog } from './components/send-notification-dialog'

const PAGE_SIZE = 10

type ReadFilter = 'all' | 'unread' | 'read'

const SEVERITY_CONFIG: Record<
  NotificationSeverity,
  { label: string; Icon: typeof Info; iconClass: string; badgeClass: string }
> = {
  info: { label: 'Thông tin', Icon: Info, iconClass: 'text-blue-400', badgeClass: 'border-blue-500 text-blue-400' },
  success: { label: 'Thành công', Icon: CheckCircle, iconClass: 'text-green-400', badgeClass: 'border-green-500 text-green-400' },
  warning: { label: 'Cảnh báo', Icon: AlertTriangle, iconClass: 'text-yellow-400', badgeClass: 'border-yellow-500 text-yellow-400' },
  error: { label: 'Lỗi', Icon: XCircle, iconClass: 'text-red-400', badgeClass: 'border-red-500 text-red-400' },
}

const formatDateTime = (value?: string) => (value ? new Date(value).toLocaleString('vi-VN') : '')

// Chỉ mở liên kết nội bộ (/...) hoặc http(s)
const safeUrl = (url?: string | null) => (url && /^(\/|https?:\/\/)/i.test(url) ? url : null)

export function NotificationsView() {
  return (
    <Tabs defaultValue='inbox' className='space-y-2'>
      <TabsList>
        <TabsTrigger value='inbox'>Hộp thư</TabsTrigger>
        <TabsTrigger value='types'>Loại thông báo</TabsTrigger>
      </TabsList>
      <TabsContent value='inbox'>
        <InboxTab />
      </TabsContent>
      <TabsContent value='types'>
        <NotificationTypesTab />
      </TabsContent>
    </Tabs>
  )
}

function InboxTab() {
  const [page, setPage] = useState(1)
  const [term, setTerm] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [readFilter, setReadFilter] = useState<ReadFilter>('all')
  const [severity, setSeverity] = useState<NotificationSeverity | 'all'>('all')
  const [sendOpen, setSendOpen] = useState(false)
  const [confirmDeleteRead, setConfirmDeleteRead] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(term.trim())
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [term])

  const { data, isLoading, isError } = useMyNotifications({
    pageNumber: page,
    pageSize: PAGE_SIZE,
    searchTerm,
    isRead: readFilter === 'all' ? undefined : readFilter === 'read',
    severity: severity === 'all' ? undefined : severity,
  })
  const notifications = data?.items ?? []
  const unreadCount = data?.unreadCount ?? 0
  const totalCount = data?.totalCount ?? 0

  const markRead = useMarkNotificationRead()
  const markAllRead = useMarkAllNotificationsRead()
  const deleteOne = useDeleteNotification()
  const deleteRead = useDeleteReadNotifications()

  // Xoá mục cuối của trang cuối: lùi về trang trước
  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
    if (data && page > totalPages) setPage(totalPages)
  }, [data, totalCount, page])

  const handleDeleteRead = async () => {
    await deleteRead.mutateAsync()
    setConfirmDeleteRead(false)
  }

  const openLink = useCallback(
    (n: InboxNotification) => {
      if (!n.isRead && n.id !== undefined) markRead.mutate(n.id)
    },
    [markRead]
  )

  return (
    <div className='space-y-4'>
      {/* Header */}
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div className='flex items-center gap-3'>
          <Bell className='text-primary h-6 w-6' />
          <div>
            <h3 className='text-primary'>Thông báo của tôi</h3>
            <p className='text-muted-foreground mt-1 text-sm'>{unreadCount} thông báo chưa đọc</p>
          </div>
        </div>
        <div className='flex flex-wrap items-center gap-2'>
          <Button variant='outline' onClick={() => setSendOpen(true)}>
            <Send className='h-4 w-4' />
            Gửi thông báo
          </Button>
          <Button
            variant='outline'
            className='border-red-500 text-red-400 hover:bg-red-900/20'
            onClick={() => setConfirmDeleteRead(true)}
          >
            <Trash2 className='h-4 w-4' />
            Xoá thông báo đã đọc
          </Button>
          <Button
            onClick={() => markAllRead.mutate()}
            className='bg-primary hover:bg-primary/90 text-primary-foreground'
            disabled={unreadCount === 0 || markAllRead.isPending}
          >
            Đánh dấu tất cả đã đọc
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className='bg-card border-border p-4'>
        <div className='flex flex-wrap items-center gap-4'>
          <div className='relative min-w-56 flex-1'>
            <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
            <Input
              placeholder='Tìm trong tiêu đề, nội dung...'
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className='bg-muted border-border text-foreground pl-10'
            />
          </div>
          <Select
            value={readFilter}
            onValueChange={(v) => {
              setReadFilter(v as ReadFilter)
              setPage(1)
            }}
          >
            <SelectTrigger className='bg-muted border-border text-foreground w-40'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className='bg-card border-border'>
              <SelectItem value='all'>Tất cả</SelectItem>
              <SelectItem value='unread'>Chưa đọc</SelectItem>
              <SelectItem value='read'>Đã đọc</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={severity}
            onValueChange={(v) => {
              setSeverity(v as NotificationSeverity | 'all')
              setPage(1)
            }}
          >
            <SelectTrigger className='bg-muted border-border text-foreground w-40'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className='bg-card border-border'>
              <SelectItem value='all'>Mọi mức độ</SelectItem>
              {NOTIFICATION_SEVERITIES.map((s) => (
                <SelectItem key={s} value={s}>
                  {SEVERITY_CONFIG[s].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Notifications List */}
      <div className='space-y-3'>
        {isLoading &&
          Array.from({ length: 3 }, (_, i) => (
            <Card key={i} className='border-border bg-card p-4'>
              <div className='flex items-start gap-4'>
                <Skeleton className='mt-1 h-5 w-5 rounded-full' />
                <div className='flex-1 space-y-2'>
                  <Skeleton className='h-4 w-1/3' />
                  <Skeleton className='h-3 w-1/5' />
                  <Skeleton className='h-4 w-2/3' />
                </div>
              </div>
            </Card>
          ))}

        {!isLoading && isError && (
          <Card className='border-border bg-card text-destructive p-8 text-center text-sm'>
            Không tải được thông báo. Vui lòng thử lại.
          </Card>
        )}

        {!isLoading && !isError && notifications.length === 0 && (
          <Card className='border-border bg-card text-muted-foreground p-8 text-center text-sm'>
            {readFilter === 'unread' ? 'Không có thông báo chưa đọc' : 'Không có thông báo'}
          </Card>
        )}

        {notifications.map((notification) => {
          const sev = SEVERITY_CONFIG[toSeverity(notification.severity)]
          const url = safeUrl(notification.url)
          const id = notification.id ?? 0
          return (
            <Card
              key={id}
              className={`border-border p-4 transition-all ${
                notification.isRead ? 'bg-card' : 'bg-muted border-l-4 border-l-cyan-500'
              }`}
            >
              <div className='flex items-start gap-4'>
                <div className='mt-1'>
                  <sev.Icon className={`h-5 w-5 ${sev.iconClass}`} />
                </div>
                <div className='min-w-0 flex-1'>
                  <div className='mb-2 flex items-start justify-between gap-2'>
                    <div className='min-w-0'>
                      <div className='flex items-center gap-2'>
                        <h4 className='text-foreground break-words'>
                          {notification.subject || notification.notifyTypeName || 'Thông báo'}
                        </h4>
                        {!notification.isRead && <div className='bg-primary h-2 w-2 shrink-0 rounded-full' />}
                      </div>
                      <div className='text-muted-foreground mt-1 text-xs'>
                        {formatDateTime(notification.createdAt)}
                        {notification.subject && notification.notifyTypeName && ` · ${notification.notifyTypeName}`}
                      </div>
                    </div>
                    <div className='flex shrink-0 items-center gap-2'>
                      <Badge variant='outline' className={sev.badgeClass}>
                        {sev.label}
                      </Badge>
                      <Button
                        variant='ghost'
                        size='sm'
                        aria-label='Xoá thông báo'
                        disabled={deleteOne.isPending && deleteOne.variables === id}
                        onClick={() => deleteOne.mutate(id)}
                        className='text-muted-foreground hover:bg-red-900/20 hover:text-red-400'
                      >
                        {deleteOne.isPending && deleteOne.variables === id ? (
                          <Loader2 className='h-4 w-4 animate-spin' />
                        ) : (
                          <Trash2 className='h-4 w-4' />
                        )}
                      </Button>
                    </div>
                  </div>
                  <p className='text-muted-foreground text-sm break-words whitespace-pre-line'>{notification.message}</p>
                  <div className='mt-2 flex items-center gap-4'>
                    {!notification.isRead && (
                      <Button
                        variant='link'
                        size='sm'
                        disabled={markRead.isPending && markRead.variables === id}
                        onClick={() => markRead.mutate(id)}
                        className='text-primary hover:text-primary/80 h-auto p-0'
                      >
                        Đánh dấu đã đọc
                      </Button>
                    )}
                    {url && (
                      <a
                        href={url}
                        onClick={() => openLink(notification)}
                        className='text-primary hover:text-primary/80 inline-flex items-center gap-1 text-sm'
                      >
                        <ExternalLink className='h-3 w-3' />
                        Xem chi tiết
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <AdminPagination page={page} pageSize={PAGE_SIZE} totalCount={totalCount} onPageChange={setPage} />

      <SendNotificationDialog open={sendOpen} onOpenChange={setSendOpen} />

      <ConfirmDialog
        open={confirmDeleteRead}
        onOpenChange={setConfirmDeleteRead}
        title='Xoá thông báo đã đọc'
        desc='Xoá tất cả thông báo đã đọc của bạn? Hành động này không thể hoàn tác.'
        cancelBtnText='Huỷ'
        confirmText='Xoá'
        destructive
        isLoading={deleteRead.isPending}
        handleConfirm={handleDeleteRead}
      />
    </div>
  )
}
