import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiUrls } from '@/api/config/endpoints'
import type { components } from '@/api/generated/schema'
import { axios } from '@/shared/lib/axios'
import { type PagedParams, toPagedQuery } from './common'

// ===========================================
// TYPES (Configuration: /api/EmailTemplate, /api/EmailLog)
// ===========================================

type Schemas = components['schemas']

export type EmailTemplate = Schemas['EmailTemplateDto']
export type EmailTemplateRequest = Schemas['EmailTemplateUpsertDto']
export type EmailPreviewRequest = Schemas['EmailPreviewDto']
export type EmailPreviewResult = Schemas['EmailPreviewResult']
export type EmailTemplateTestRequest = Schemas['EmailTemplateTestDto']
export type SystemEvent = Schemas['EventVariablesDto']
export type NotifyOutcome = Schemas['NotifyOutcome']
export type EmailLog = Schemas['EmailLogDto']
export type EmailSendResult = Schemas['ConnectionTestResult']

export interface EmailTemplatesResponse {
  items: EmailTemplate[]
  totalCount: number
}

export interface EmailLogsResponse {
  items: EmailLog[]
  totalCount: number
}

export interface EmailLogParams extends PagedParams {
  status?: EmailLogStatus
  eventCode?: string
  from?: string
  to?: string
}

// Trạng thái nhật ký email phía backend (EmailLogStatuses)
export const EMAIL_LOG_STATUSES = ['Sent', 'Failed', 'Skipped'] as const
export type EmailLogStatus = (typeof EMAIL_LOG_STATUSES)[number]

export const EMAIL_LOG_STATUS_LABEL: Record<string, string> = {
  Sent: 'Đã gửi',
  Failed: 'Thất bại',
  Skipped: 'Bỏ qua',
}

// Nhóm người nhận của sự kiện (khoá email.notify.recipient.<nhóm>)
export const RECIPIENT_GROUP_LABEL: Record<string, string> = {
  admin: 'Quản trị viên',
  tech: 'Kỹ thuật',
  security: 'Bảo mật',
}

// Mức độ mặc định của sự kiện (low | medium | high | critical)
export const SEVERITY_LABEL: Record<string, string> = {
  low: 'Thấp',
  medium: 'Trung bình',
  high: 'Cao',
  critical: 'Nghiêm trọng',
}

// ===========================================
// API FUNCTIONS
// ===========================================

export const getEmailTemplates = async (params: PagedParams) => {
  const res = await axios.get<EmailTemplatesResponse>(apiUrls.emailTemplate.list, { params: toPagedQuery(params) })
  return res.data
}

export const getEmailTemplate = async (id: number) => {
  const res = await axios.get<EmailTemplate>(apiUrls.emailTemplate.details(id))
  return res.data
}

export const getSystemEvents = async () => {
  const res = await axios.get<SystemEvent[]>(apiUrls.emailTemplate.events)
  return res.data
}

export const createEmailTemplate = async (data: EmailTemplateRequest) => {
  const res = await axios.post<EmailTemplate>(apiUrls.emailTemplate.create, data)
  return res.data
}

export const updateEmailTemplate = async ({ id, data }: { id: number; data: EmailTemplateRequest }) => {
  const res = await axios.put<EmailTemplate>(apiUrls.emailTemplate.update(id), data)
  return res.data
}

export const deleteEmailTemplate = async (id: number) => {
  await axios.delete(apiUrls.emailTemplate.delete(id))
}

export const resetEmailTemplate = async (id: number) => {
  const res = await axios.post<EmailTemplate>(apiUrls.emailTemplate.reset(id))
  return res.data
}

export const previewEmailTemplate = async (data: EmailPreviewRequest) => {
  const res = await axios.post<EmailPreviewResult>(apiUrls.emailTemplate.preview, data)
  return res.data
}

export const sendTestEmailTemplate = async ({ id, data }: { id: number; data: EmailTemplateTestRequest }) => {
  const res = await axios.post<EmailSendResult>(apiUrls.emailTemplate.sendTest(id), data)
  return res.data
}

export const triggerTestEvent = async (code: string) => {
  const res = await axios.post<NotifyOutcome>(apiUrls.emailTemplate.triggerEvent(code))
  return res.data
}

export const getEmailLogs = async ({ status, eventCode, from, to, ...paged }: EmailLogParams) => {
  const res = await axios.get<EmailLogsResponse>(apiUrls.emailLog.list, {
    params: {
      ...toPagedQuery(paged),
      ...(status ? { status } : {}),
      ...(eventCode ? { eventCode } : {}),
      ...(from ? { from } : {}),
      ...(to ? { to } : {}),
    },
  })
  return res.data
}

// before: thời điểm theo giờ máy chủ (không kèm múi giờ), vd. 2026-09-01T00:00:00
export const purgeEmailLogs = async (before: string) => {
  const res = await axios.delete<{ deleted: number }>(apiUrls.emailLog.purge, { params: { before } })
  return res.data
}

// ===========================================
// CUSTOM HOOKS
// ===========================================

export const useEmailTemplates = (params: PagedParams) =>
  useQuery({
    queryKey: ['admin-email-templates', params],
    queryFn: () => getEmailTemplates(params),
    placeholderData: keepPreviousData,
  })

export const useEmailTemplate = (id: number | undefined) =>
  useQuery({
    queryKey: ['admin-email-template', id],
    queryFn: () => getEmailTemplate(id as number),
    enabled: !!id,
  })

// Danh mục sự kiện cố định phía backend
export const useSystemEvents = () =>
  useQuery({ queryKey: ['admin-email-events'], queryFn: getSystemEvents, staleTime: Infinity })

const useInvalidateTemplates = () => {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ['admin-email-templates'] })
    queryClient.invalidateQueries({ queryKey: ['admin-email-template'] })
  }
}

export const useCreateEmailTemplate = () => {
  const invalidate = useInvalidateTemplates()
  return useMutation({
    mutationFn: createEmailTemplate,
    onSuccess: () => {
      toast.success('Đã thêm mẫu email')
      invalidate()
    },
  })
}

export const useUpdateEmailTemplate = () => {
  const invalidate = useInvalidateTemplates()
  return useMutation({
    mutationFn: updateEmailTemplate,
    onSuccess: () => {
      toast.success('Đã cập nhật mẫu email')
      invalidate()
    },
  })
}

export const useDeleteEmailTemplate = () => {
  const invalidate = useInvalidateTemplates()
  return useMutation({
    mutationFn: deleteEmailTemplate,
    onSuccess: () => {
      toast.success('Đã xoá mẫu email')
      invalidate()
    },
  })
}

export const useResetEmailTemplate = () => {
  const invalidate = useInvalidateTemplates()
  return useMutation({
    mutationFn: resetEmailTemplate,
    onSuccess: () => {
      toast.success('Đã khôi phục nội dung mặc định')
      invalidate()
    },
  })
}

// Xem trước với biến mẫu; không toast (gọi liên tục khi đang gõ)
export const usePreviewEmailTemplate = (data: EmailPreviewRequest | null) =>
  useQuery({
    queryKey: ['admin-email-template-preview', data],
    queryFn: () => previewEmailTemplate(data as EmailPreviewRequest),
    enabled: !!data,
    placeholderData: keepPreviousData,
    retry: false,
  })

const useInvalidateLogs = () => {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['admin-email-logs'] })
}

// Backend trả 200 kể cả khi gửi thất bại (success=false)
export const useSendTestEmailTemplate = () => {
  const invalidateLogs = useInvalidateLogs()
  return useMutation({
    mutationFn: sendTestEmailTemplate,
    onSuccess: (result) => {
      if (result.success) toast.success(`${result.message ?? 'Đã gửi email thử'} (${result.elapsedMs ?? 0} ms)`)
      else toast.error(result.message ?? 'Gửi email thử thất bại')
      invalidateLogs()
    },
  })
}

// Phát thử sự kiện qua đúng quy tắc thông báo; reason giải thích vì sao không gửi
export const useTriggerTestEvent = () => {
  const invalidateLogs = useInvalidateLogs()
  return useMutation({
    mutationFn: triggerTestEvent,
    onSuccess: (result) => {
      if (result.sent) toast.success('Đã gửi email sự kiện thử', { description: result.reason ?? undefined })
      else toast.warning('Không gửi email', { description: result.reason ?? 'Không rõ lý do' })
      invalidateLogs()
    },
  })
}

export const useEmailLogs = (params: EmailLogParams, enabled = true) =>
  useQuery({
    queryKey: ['admin-email-logs', params],
    queryFn: () => getEmailLogs(params),
    placeholderData: keepPreviousData,
    enabled,
  })

export const usePurgeEmailLogs = () => {
  const invalidate = useInvalidateLogs()
  return useMutation({
    mutationFn: purgeEmailLogs,
    onSuccess: (result) => {
      toast.success(`Đã xoá ${result.deleted} bản ghi nhật ký email`)
      invalidate()
    },
  })
}
