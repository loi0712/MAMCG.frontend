import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiUrls } from '@/api/config/endpoints'
import type { components } from '@/api/generated/schema'
import { axios } from '@/shared/lib/axios'

// ===========================================
// TYPES (Content: /api/Notification — hộp thư của người đang đăng nhập)
// ===========================================

type Schemas = components['schemas']

export type InboxNotification = Schemas['InboxNotificationDto']
export type SendNotificationRequest = Schemas['SendNotificationDto']
export type SendNotificationResult = Schemas['SendNotificationResult']

export const NOTIFICATION_SEVERITIES = ['info', 'success', 'warning', 'error'] as const
export type NotificationSeverity = (typeof NOTIFICATION_SEVERITIES)[number]

export interface NotificationsResponse {
  items: InboxNotification[]
  totalCount: number
  unreadCount: number
}

export interface NotificationParams {
  pageNumber?: number
  pageSize?: number
  isRead?: boolean
  severity?: NotificationSeverity
  searchTerm?: string
}

// Mức độ không xác định thì coi như "info"
export const toSeverity = (value: string | null | undefined): NotificationSeverity =>
  NOTIFICATION_SEVERITIES.find((s) => s === value?.toLowerCase()) ?? 'info'

// ===========================================
// API FUNCTIONS
// ===========================================

export const getMyNotifications = async (params: NotificationParams) => {
  const query = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ''))
  const res = await axios.get<Schemas['InboxPagedResult']>(apiUrls.notification.mine, { params: query })
  return {
    items: res.data.items ?? [],
    totalCount: res.data.totalCount ?? 0,
    unreadCount: res.data.unreadCount ?? 0,
  } satisfies NotificationsResponse
}

export const getUnreadNotificationCount = async () => {
  const res = await axios.get<{ count: number }>(apiUrls.notification.unreadCount)
  return res.data.count
}

export const markNotificationRead = async (id: number) => {
  await axios.put(apiUrls.notification.markRead(id))
}

export const markAllNotificationsRead = async () => {
  const res = await axios.put<{ updated: number }>(apiUrls.notification.markAllRead)
  return res.data.updated
}

export const deleteNotification = async (id: number) => {
  await axios.delete(apiUrls.notification.delete(id))
}

export const deleteReadNotifications = async () => {
  const res = await axios.delete<{ deleted: number }>(apiUrls.notification.deleteRead)
  return res.data.deleted
}

export const sendNotification = async (data: SendNotificationRequest) => {
  const res = await axios.post<SendNotificationResult>(apiUrls.notification.send, data)
  return res.data
}

// ===========================================
// CUSTOM HOOKS
// ===========================================

export const useMyNotifications = (params: NotificationParams) =>
  useQuery({
    queryKey: ['notifications', 'list', params],
    queryFn: () => getMyNotifications(params),
    placeholderData: keepPreviousData,
  })

// Dùng cho chuông thông báo trên header
export const useUnreadNotificationCount = () =>
  useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: getUnreadNotificationCount,
    refetchInterval: 60_000,
  })

const useInvalidateNotifications = () => {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
}

export const useMarkNotificationRead = () => {
  const invalidate = useInvalidateNotifications()
  return useMutation({ mutationFn: markNotificationRead, onSuccess: invalidate })
}

export const useMarkAllNotificationsRead = () => {
  const invalidate = useInvalidateNotifications()
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: (updated) => {
      toast.success(`Đã đánh dấu ${updated} thông báo là đã đọc`)
      invalidate()
    },
  })
}

export const useDeleteNotification = () => {
  const invalidate = useInvalidateNotifications()
  return useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      toast.success('Đã xoá thông báo')
      invalidate()
    },
  })
}

export const useDeleteReadNotifications = () => {
  const invalidate = useInvalidateNotifications()
  return useMutation({
    mutationFn: deleteReadNotifications,
    onSuccess: (deleted) => {
      toast.success(`Đã xoá ${deleted} thông báo đã đọc`)
      invalidate()
    },
  })
}

export const useSendNotification = () => {
  const invalidate = useInvalidateNotifications()
  return useMutation({
    mutationFn: sendNotification,
    onSuccess: (result) => {
      toast.success(`Đã gửi thông báo tới ${result.sent ?? 0} người dùng`)
      // Người gửi có thể nằm trong danh sách nhận
      invalidate()
    },
  })
}
