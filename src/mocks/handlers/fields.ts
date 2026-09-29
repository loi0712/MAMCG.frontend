import { http, HttpResponse } from 'msw'
import { apiUrls } from '@/api/config/endpoints'
import type { FieldDetail, FieldRequest } from '@/features/admin/api/fields'
import { dataTypes, fields, nextId, panels } from '../db'
import { api, notFound, paginate } from './utils'

const id = ':id' as unknown as number

export const fieldHandlers = [
  // Như backend: danh sách chỉ có id + tên hiển thị
  http.get(api(apiUrls.field.list), ({ request }) => {
    const { page, totalCount } = paginate(fields, new URL(request.url), (f) => `${f.fieldName} ${f.displayName}`)
    return HttpResponse.json({ fields: page.map((f) => ({ id: f.id, name: f.displayName })), totalCount })
  }),

  http.get(api(apiUrls.field.dataTypes), () => HttpResponse.json(dataTypes)),

  http.get(api(apiUrls.field.details(id)), ({ params }) => {
    const field = fields.find((f) => f.id === Number(params.id))
    return field ? HttpResponse.json(field) : notFound()
  }),

  http.post(api(apiUrls.field.create), async ({ request }) => {
    const data = (await request.json()) as FieldRequest
    const created: FieldDetail = {
      id: nextId(),
      fieldName: data.fieldName,
      displayName: data.displayName,
      dataType: dataTypes.find((d) => d.id === data.dataTypeId) ?? null,
      isRequired: data.isRequired,
      editable: data.editable,
      value: data.defaultValue || null,
    }
    fields.push(created)
    return HttpResponse.json(created)
  }),

  http.put(api(apiUrls.field.update(id)), async ({ params, request }) => {
    const field = fields.find((f) => f.id === Number(params.id))
    if (!field) return notFound()
    const data = (await request.json()) as Partial<FieldRequest>
    if (data.fieldName !== undefined) field.fieldName = data.fieldName
    if (data.displayName !== undefined) field.displayName = data.displayName
    if (data.dataTypeId !== undefined) field.dataType = dataTypes.find((d) => d.id === data.dataTypeId) ?? null
    if (data.isRequired !== undefined) field.isRequired = data.isRequired
    if (data.editable !== undefined) field.editable = data.editable
    return HttpResponse.json(field)
  }),

  http.delete(api(apiUrls.field.delete(id)), ({ params }) => {
    const index = fields.findIndex((f) => f.id === Number(params.id))
    if (index < 0) return notFound()
    const [removed] = fields.splice(index, 1)
    panels.forEach((p) => (p.fieldIds = p.fieldIds.filter((fid) => fid !== removed.id)))
    return HttpResponse.json(true)
  }),
]
