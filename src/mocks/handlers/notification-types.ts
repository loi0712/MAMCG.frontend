import { http, HttpResponse } from 'msw'
import { apiUrls } from '@/api/config/endpoints'
import type { NotificationTypeDetail, NotificationTypeRequest } from '@/features/admin/api/notification-types'
import { api, notFound, paginate } from './utils'
import { transitions } from './workflows'

// Mock danh mục loại thông báo (NotificationTypeController): trùng tên → 409, đang dùng ở bước chuyển → 409

const id = ':id' as unknown as number
let seq = 10

export const notificationTypes: NotificationTypeDetail[] = [
  {
    id: 1,
    name: 'Giao việc duyệt',
    description: 'Báo người duyệt khi nội dung được gửi duyệt',
    inAppTemplate: 'Bạn được giao duyệt "{{item}}" ở bước {{status}} (quy trình {{workflow}}).',
    emailSubject: 'Có nội dung chờ duyệt',
    emailTemplate: null,
    smsTemplate: null,
  },
  {
    id: 2,
    name: 'Thông báo hệ thống',
    description: 'Thông báo do quản trị viên hoặc hệ thống gửi',
    inAppTemplate: null,
    emailSubject: null,
    emailTemplate: null,
    smsTemplate: null,
  },
]

const error = (status: number, title: string) => HttpResponse.json({ title, status }, { status })
const usage = (typeId: number) => transitions.filter((t) => t.notificationTypeId === typeId).length
const clean = (v: string | null | undefined) => (v && v.trim() ? v.trim() : null)

const validate = (data: NotificationTypeRequest, exceptId?: number) => {
  const name = data.name?.trim()
  if (!name) return error(400, 'Tên loại thông báo là bắt buộc.')
  if (name.length > 255) return error(400, 'Tên loại thông báo không được vượt quá 255 ký tự.')
  if (notificationTypes.some((t) => t.id !== exceptId && t.name.toLowerCase() === name.toLowerCase()))
    return error(409, `Đã có loại thông báo "${name}".`)
  return null
}

const fields = (data: NotificationTypeRequest) => ({
  name: data.name.trim(),
  description: clean(data.description),
  inAppTemplate: clean(data.inAppTemplate),
  emailSubject: clean(data.emailSubject),
  emailTemplate: clean(data.emailTemplate),
  smsTemplate: clean(data.smsTemplate),
})

export const notificationTypeHandlers = [
  http.get(api(apiUrls.notificationType.list), ({ request }) => {
    const url = new URL(request.url)
    // Backend kẹp pageSize trong 1..200
    url.searchParams.set('pageSize', String(Math.min(200, Math.max(1, Number(url.searchParams.get('pageSize') ?? 20)))))
    const { page, totalCount } = paginate([...notificationTypes].reverse(), url, (t) => `${t.name} ${t.description ?? ''}`)
    return HttpResponse.json({
      notificationTypes: page.map((t) => ({ id: t.id, name: t.name, description: t.description, transitionCount: usage(t.id) })),
      totalCount,
    })
  }),

  http.get(api(apiUrls.notificationType.details(id)), ({ params }) => {
    const item = notificationTypes.find((t) => t.id === Number(params.id))
    return item ? HttpResponse.json(item) : notFound()
  }),

  http.post(api(apiUrls.notificationType.create), async ({ request }) => {
    const data = (await request.json()) as NotificationTypeRequest
    const invalid = validate(data)
    if (invalid) return invalid
    const created = { id: ++seq, ...fields(data) }
    notificationTypes.push(created)
    return HttpResponse.json(created)
  }),

  http.put(api(apiUrls.notificationType.details(id)), async ({ params, request }) => {
    const item = notificationTypes.find((t) => t.id === Number(params.id))
    if (!item) return error(404, `Không tìm thấy loại thông báo ${params.id}.`)
    const data = (await request.json()) as NotificationTypeRequest
    const invalid = validate(data, item.id)
    if (invalid) return invalid
    Object.assign(item, fields(data))
    return HttpResponse.json(item)
  }),

  http.delete(api(apiUrls.notificationType.details(id)), ({ params }) => {
    const index = notificationTypes.findIndex((t) => t.id === Number(params.id))
    if (index < 0) return error(404, `Không tìm thấy loại thông báo ${params.id}.`)
    const inUse = usage(notificationTypes[index].id)
    if (inUse > 0)
      return error(409, `Loại thông báo đang được dùng ở ${inUse} bước chuyển quy trình. Bỏ chọn loại thông báo ở các bước chuyển trước khi xoá.`)
    notificationTypes.splice(index, 1)
    return HttpResponse.json(true)
  }),
]
