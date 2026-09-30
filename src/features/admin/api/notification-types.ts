import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiUrls } from '@/api/config/endpoints'
import { axios } from '@/shared/lib/axios'
import { type PagedParams, toPagedQuery } from './common'

// ===========================================
// TYPES (Content: /api/NotificationType — NotificationTypeDto)
// ===========================================

export interface NotificationTypeListItem {
  id: number
  name: string
  description: string | null
  // Số bước chuyển quy trình đang dùng loại này (> 0 thì không xoá được)
  transitionCount: number
}

export interface NotificationTypesResponse {
  notificationTypes: NotificationTypeListItem[]
  totalCount: number
}

export interface NotificationTypeDetail {
  id: number
  name: string
  description: string | null
  // Mẫu nội dung trong ứng dụng; biến {{item}}, {{workflow}}, {{status}}, {{deadline}}
  inAppTemplate: string | null
  emailSubject: string | null
  emailTemplate: string | null
  smsTemplate: string | null
}

export type NotificationTypeRequest = Omit<NotificationTypeDetail, 'id'>

// Đủ cho ô chọn loại thông báo (backend giới hạn 200/trang)
export const ALL_NOTIFICATION_TYPES: PagedParams = { pageNumber: 1, pageSize: 200 }

// ===========================================
// API FUNCTIONS
// ===========================================

export const getNotificationTypes = async (params: PagedParams) => {
  const res = await axios.get<NotificationTypesResponse>(apiUrls.notificationType.list, { params: toPagedQuery(params) })
  return {
    notificationTypes: res.data.notificationTypes ?? [],
    totalCount: res.data.totalCount ?? 0,
  } satisfies NotificationTypesResponse
}

export const getNotificationType = async (id: number) => {
  const res = await axios.get<NotificationTypeDetail>(apiUrls.notificationType.details(id))
  return res.data
}

export const createNotificationType = async (data: NotificationTypeRequest) => {
  const res = await axios.post<NotificationTypeDetail>(apiUrls.notificationType.create, data)
  return res.data
}

export const updateNotificationType = async ({ id, data }: { id: number; data: NotificationTypeRequest }) => {
  const res = await axios.put<NotificationTypeDetail>(apiUrls.notificationType.details(id), data)
  return res.data
}

export const deleteNotificationType = async (id: number) => {
  const res = await axios.delete<boolean>(apiUrls.notificationType.details(id))
  return res.data
}

// ===========================================
// CUSTOM HOOKS
// ===========================================

export const useNotificationTypes = (params: PagedParams) =>
  useQuery({
    queryKey: ['notification-types', params],
    queryFn: () => getNotificationTypes(params),
    placeholderData: keepPreviousData,
  })

export const useNotificationType = (id: number | undefined) =>
  useQuery({
    queryKey: ['notification-type', id],
    queryFn: () => getNotificationType(id!),
    enabled: !!id,
  })

const useInvalidateNotificationTypes = () => {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ['notification-types'] })
    queryClient.invalidateQueries({ queryKey: ['notification-type'] })
  }
}

export const useCreateNotificationType = () => {
  const invalidate = useInvalidateNotificationTypes()
  return useMutation({
    mutationFn: createNotificationType,
    onSuccess: () => {
      toast.success('Đã thêm loại thông báo')
      invalidate()
    },
  })
}

export const useUpdateNotificationType = () => {
  const invalidate = useInvalidateNotificationTypes()
  return useMutation({
    mutationFn: updateNotificationType,
    onSuccess: () => {
      toast.success('Đã cập nhật loại thông báo')
      invalidate()
    },
  })
}

export const useDeleteNotificationType = () => {
  const invalidate = useInvalidateNotificationTypes()
  return useMutation({
    mutationFn: deleteNotificationType,
    onSuccess: () => {
      toast.success('Đã xoá loại thông báo')
      invalidate()
    },
  })
}
