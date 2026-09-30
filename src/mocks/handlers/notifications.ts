import { http, HttpResponse } from 'msw'
import { apiUrls } from '@/api/config/endpoints'
import type { InboxNotification, SendNotificationRequest } from '@/features/admin/api/notifications'
import { users } from '../db'
import { api, notFound, paginate } from './utils'

const id = ':id' as unknown as number

// Người dùng mock đang đăng nhập (auth mock mặc định trả users[0] — admin)
const MOCK_USER_ID = users[0]?.id ?? 'u-1'

const ago = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString()

let seq = 100

const notification = (
  subject: string,
  message: string,
  severity: string,
  minutesAgo: number,
  isRead: boolean,
  url: string | null = null
): InboxNotification => ({
  id: ++seq,
  notifyTypeId: 1,
  notifyTypeName: 'Thông báo hệ thống',
  subject,
  message,
  url,
  severity,
  channel: 'in_app',
  fromUserId: 'system',
  relatedEntityType: null,
  relatedEntityId: null,
  isRead,
  createdAt: ago(minutesAgo),
})

// Hộp thư của người dùng mock (mới nhất trước)
const inbox: InboxNotification[] = [
  notification('Upload hoàn tất', 'Nguyễn Văn An đã tải lên thành công 5 video vào thư mục Projects/Q4.', 'success', 5, false),
  notification('Dung lượng lưu trữ', 'Storage primary đã dùng 75% dung lượng. Vui lòng xem xét mở rộng hoặc lưu trữ dữ liệu cũ.', 'warning', 40, false, '/admin/storage'),
  notification('CG server mất kết nối', 'Không kết nối được CG Server - Backup (192.168.1.103:5250).', 'error', 90, false, '/admin/logs'),
  notification('Backup thành công', 'Sao lưu cơ sở dữ liệu tự động đã hoàn tất.', 'success', 180, true),
  notification('Cập nhật hệ thống', 'Phiên bản mới đã sẵn sàng. Xem chi tiết tại Cài đặt.', 'info', 300, true),
  notification('Đăng nhập thất bại', 'Phát hiện 3 lần đăng nhập thất bại liên tiếp từ IP 192.168.1.200.', 'warning', 600, true),
  notification('Bảo trì định kỳ', 'Bảo trì hệ thống lúc 02:00 sáng mai, dự kiến 30 phút.', 'info', 1200, true),
  ...Array.from({ length: 8 }, (_, i) =>
    notification(`Phê duyệt thiết kế #${i + 1}`, `Thiết kế CG #${i + 1} đã được phê duyệt.`, 'info', 1500 + i * 60, true)
  ),
]

const unreadCount = () => inbox.filter((n) => !n.isRead).length

export const notificationHandlers = [
  http.get(api(apiUrls.notification.mine), ({ request }) => {
    const url = new URL(request.url)
    const isRead = url.searchParams.get('isRead')
    const severity = url.searchParams.get('severity')?.toLowerCase()
    const filtered = inbox.filter(
      (n) => (isRead === null || String(n.isRead) === isRead) && (!severity || n.severity === severity)
    )
    const { page, totalCount } = paginate(filtered, url, (n) => `${n.subject} ${n.message}`)
    return HttpResponse.json({ items: page, totalCount, unreadCount: unreadCount() })
  }),

  http.get(api(apiUrls.notification.unreadCount), () => HttpResponse.json({ count: unreadCount() })),

  // Đặt trước /me/read/:id và /me/:id để không bị khớp nhầm
  http.put(api(apiUrls.notification.markAllRead), () => {
    let updated = 0
    inbox.forEach((n) => {
      if (!n.isRead) {
        n.isRead = true
        updated++
      }
    })
    return HttpResponse.json({ updated })
  }),

  http.put(api(apiUrls.notification.markRead(id)), ({ params }) => {
    const item = inbox.find((n) => n.id === Number(params.id))
    if (!item) return notFound()
    item.isRead = true
    return new HttpResponse(null, { status: 204 })
  }),

  http.delete(api(apiUrls.notification.deleteRead), () => {
    const before = inbox.length
    for (let i = inbox.length - 1; i >= 0; i--) if (inbox[i].isRead) inbox.splice(i, 1)
    return HttpResponse.json({ deleted: before - inbox.length })
  }),

  http.delete(api(apiUrls.notification.delete(id)), ({ params }) => {
    const index = inbox.findIndex((n) => n.id === Number(params.id))
    if (index < 0) return notFound()
    inbox.splice(index, 1)
    return new HttpResponse(null, { status: 204 })
  }),

  http.post(api(apiUrls.notification.send), async ({ request }) => {
    const data = (await request.json()) as SendNotificationRequest
    const toUserIds = [...new Set((data.toUserIds ?? []).map((x) => x.trim()).filter(Boolean))]
    if (!data.message?.trim()) {
      return HttpResponse.json({ title: 'Nội dung thông báo không được để trống.', status: 400 }, { status: 400 })
    }
    if (toUserIds.length === 0) {
      return HttpResponse.json({ title: 'Cần chọn ít nhất một người nhận.', status: 400 }, { status: 400 })
    }
    // Chỉ lưu hộp thư của người dùng mock; người nhận khác chỉ được đếm
    if (toUserIds.includes(MOCK_USER_ID)) {
      inbox.unshift({
        ...notification(data.subject || 'Thông báo hệ thống', data.message, data.severity ?? 'info', 0, false, data.url ?? null),
        fromUserId: MOCK_USER_ID,
      })
    }
    return HttpResponse.json({ sent: toUserIds.length })
  }),
]
