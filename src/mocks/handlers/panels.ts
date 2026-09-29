import { http, HttpResponse } from 'msw'
import { apiUrls } from '@/api/config/endpoints'
import type { PanelRequest } from '@/features/admin/api/panels'
import { fields, nextId, panels, type MockPanel } from '../db'
import { api, notFound, paginate, splitIds } from './utils'

const id = ':id' as unknown as number

const toDetail = (p: MockPanel) => ({
  id: p.id,
  panelName: p.panelName,
  description: p.description,
  visibilityRules: p.visibilityRules,
  index: p.index,
  fields: p.fieldIds.map((fid) => fields.find((f) => f.id === fid)).filter((f) => f !== undefined),
})

const parseFieldIds = (ids: string | null | undefined) => splitIds(ids).map(Number)

export const panelHandlers = [
  http.get(api(apiUrls.panel.list), ({ request }) => {
    const { page, totalCount } = paginate(panels, new URL(request.url), (p) => p.panelName)
    return HttpResponse.json({ panels: page.map((p) => ({ id: p.id, panelName: p.panelName })), totalCount })
  }),

  http.get(api(apiUrls.panel.details(id)), ({ params }) => {
    const panel = panels.find((p) => p.id === Number(params.id))
    return panel ? HttpResponse.json(toDetail(panel)) : notFound()
  }),

  http.post(api(apiUrls.panel.create), async ({ request }) => {
    const data = (await request.json()) as PanelRequest
    const created: MockPanel = {
      id: nextId(),
      panelName: data.panelName,
      description: data.description ?? null,
      visibilityRules: data.visibilityRules ?? null,
      index: data.index ?? panels.length + 1,
      fieldIds: parseFieldIds(data.fieldIds),
    }
    panels.push(created)
    return HttpResponse.json(toDetail(created))
  }),

  http.put(api(apiUrls.panel.update(id)), async ({ params, request }) => {
    const panel = panels.find((p) => p.id === Number(params.id))
    if (!panel) return notFound()
    const data = (await request.json()) as PanelRequest
    if (data.panelName !== undefined) panel.panelName = data.panelName
    if (data.description !== undefined) panel.description = data.description ?? null
    if (data.visibilityRules !== undefined) panel.visibilityRules = data.visibilityRules ?? null
    if (data.index !== undefined && data.index !== null) panel.index = data.index
    if (data.fieldIds !== undefined) panel.fieldIds = parseFieldIds(data.fieldIds)
    return HttpResponse.json(toDetail(panel))
  }),

  http.delete(api(apiUrls.panel.delete(id)), ({ params }) => {
    const index = panels.findIndex((p) => p.id === Number(params.id))
    if (index < 0) return notFound()
    panels.splice(index, 1)
    return HttpResponse.json(true)
  }),
]
