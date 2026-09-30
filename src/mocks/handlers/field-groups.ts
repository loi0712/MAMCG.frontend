import { http, HttpResponse } from 'msw'
import { apiUrls } from '@/api/config/endpoints'
import type { FieldGroupDetail, FieldGroupListItem, FieldGroupRequest } from '@/features/admin/api/field-groups'
import { fields } from '../db'
import { api, notFound, paginate } from './utils'

const id = ':id' as unknown as number
const now = () => new Date().toISOString()
let seq = 100

interface MockFieldGroup {
  id: number
  name: string
  description: string | null
  displayOrder: number
  isActive: boolean
  fieldIds: number[]
  createdAt: string
  modifiedAt: string
}

const fieldGroups: MockFieldGroup[] = [
  { id: 1, name: 'Thông tin cơ bản', description: 'Các trường thông tin cơ bản', displayOrder: 1, isActive: true, fieldIds: [1, 2, 7], createdAt: now(), modifiedAt: now() },
  { id: 2, name: 'Phân loại nội dung', description: 'Loại thiết kế, chuyên mục', displayOrder: 2, isActive: true, fieldIds: [4, 8, 9], createdAt: now(), modifiedAt: now() },
  { id: 3, name: 'Kỹ thuật', description: null, displayOrder: 3, isActive: false, fieldIds: [5, 6], createdAt: now(), modifiedAt: now() },
]

// Trường đã bị xoá khỏi db sẽ tự biến mất khỏi nhóm (như khoá ngoại phía backend)
const existingFieldIds = (g: MockFieldGroup) => g.fieldIds.filter((fid) => fields.some((f) => f.id === fid))

const toListItem = (g: MockFieldGroup): FieldGroupListItem => ({
  id: g.id,
  name: g.name,
  description: g.description,
  displayOrder: g.displayOrder,
  isActive: g.isActive,
  fieldCount: existingFieldIds(g).length,
  createdAt: g.createdAt,
  modifiedAt: g.modifiedAt,
})

const toDetail = (g: MockFieldGroup): FieldGroupDetail => {
  return {
    id: g.id,
    name: g.name,
    description: g.description,
    displayOrder: g.displayOrder,
    isActive: g.isActive,
    createdAt: g.createdAt,
    modifiedAt: g.modifiedAt,
    fields: existingFieldIds(g).map((fid, index) => {
      const f = fields.find((x) => x.id === fid)!
      return {
        id: f.id,
        fieldName: f.fieldName,
        displayName: f.displayName,
        dataTypeId: f.dataType?.id ?? 0,
        dataTypeName: f.dataType?.name ?? null,
        isRequired: f.isRequired,
        isSystemField: false,
        displayOrder: index + 1,
      }
    }),
  }
}

const error = (status: number, title: string) => HttpResponse.json({ title, status }, { status })

const validateFieldIds = (fieldIds: number[] | null | undefined) => {
  const missing = (fieldIds ?? []).filter((fid) => !fields.some((f) => f.id === fid))
  return missing.length ? error(400, `Không tìm thấy trường: ${missing.join(', ')}.`) : null
}

const validate = (data: FieldGroupRequest, exceptId?: number) => {
  const name = data.name?.trim()
  if (!name) return error(400, 'Tên nhóm trường không được để trống.')
  if (fieldGroups.some((g) => g.name === name && g.id !== exceptId))
    return error(409, `Nhóm trường '${name}' đã tồn tại.`)
  return validateFieldIds(data.fieldIds)
}

const dedupe = (ids: number[] | null | undefined) => [...new Set(ids ?? [])]

export const fieldGroupHandlers = [
  http.get(api(apiUrls.fieldGroup.list), ({ request }) => {
    const url = new URL(request.url)
    const isActive = url.searchParams.get('isActive')
    const source = fieldGroups
      .filter((g) => isActive === null || String(g.isActive) === isActive)
      .sort((a, b) => a.displayOrder - b.displayOrder || a.id - b.id)
    const { page, totalCount } = paginate(source, url, (g) => `${g.name} ${g.description ?? ''}`)
    return HttpResponse.json({ items: page.map(toListItem), totalCount })
  }),

  http.get(api(apiUrls.fieldGroup.details(id)), ({ params }) => {
    const group = fieldGroups.find((g) => g.id === Number(params.id))
    return group ? HttpResponse.json(toDetail(group)) : notFound()
  }),

  http.post(api(apiUrls.fieldGroup.create), async ({ request }) => {
    const data = (await request.json()) as FieldGroupRequest
    const invalid = validate(data)
    if (invalid) return invalid
    const created: MockFieldGroup = {
      id: ++seq,
      name: data.name.trim(),
      description: data.description?.trim() || null,
      displayOrder: data.displayOrder ?? 0,
      isActive: data.isActive ?? true,
      fieldIds: dedupe(data.fieldIds),
      createdAt: now(),
      modifiedAt: now(),
    }
    fieldGroups.push(created)
    return HttpResponse.json(toDetail(created))
  }),

  http.put(api(apiUrls.fieldGroup.update(id)), async ({ params, request }) => {
    const group = fieldGroups.find((g) => g.id === Number(params.id))
    if (!group) return notFound()
    const data = (await request.json()) as FieldGroupRequest
    const invalid = validate(data, group.id)
    if (invalid) return invalid
    Object.assign(group, {
      name: data.name.trim(),
      description: data.description?.trim() || null,
      displayOrder: data.displayOrder ?? 0,
      isActive: data.isActive,
      modifiedAt: now(),
    })
    if (data.fieldIds) group.fieldIds = dedupe(data.fieldIds)
    return HttpResponse.json(toDetail(group))
  }),

  http.put(api(apiUrls.fieldGroup.fields(id)), async ({ params, request }) => {
    const group = fieldGroups.find((g) => g.id === Number(params.id))
    if (!group) return notFound()
    const { fieldIds } = (await request.json()) as { fieldIds: number[] | null }
    const invalid = validateFieldIds(fieldIds)
    if (invalid) return invalid
    group.fieldIds = dedupe(fieldIds)
    group.modifiedAt = now()
    return HttpResponse.json(toDetail(group))
  }),

  http.delete(api(apiUrls.fieldGroup.delete(id)), ({ params }) => {
    const index = fieldGroups.findIndex((g) => g.id === Number(params.id))
    if (index < 0) return notFound()
    fieldGroups.splice(index, 1)
    return new HttpResponse(null, { status: 204 })
  }),
]
