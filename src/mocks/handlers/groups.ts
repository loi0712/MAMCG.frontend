import { http, HttpResponse } from 'msw'
import { apiUrls } from '@/api/config/endpoints'
import type { Group, GroupRequest } from '@/features/admin/api/groups'
import { groups, nextId, users } from '../db'
import { api, notFound, paginate, splitIds } from './utils'

const toGroupUsers = (userIds: string | null | undefined) =>
  splitIds(userIds)
    .map((id) => users.find((u) => u.id === id))
    .filter((u) => u !== undefined)
    .map((u) => ({ id: u.id, fullName: u.fullName, email: u.email, isActive: u.isActive }))

export const groupHandlers = [
  http.get(api(apiUrls.group.list), ({ request }) => {
    const { page, totalCount } = paginate(groups, new URL(request.url), (g) => `${g.name} ${g.description}`)
    return HttpResponse.json({ groups: page, totalCount })
  }),

  http.post(api(apiUrls.group.create), async ({ request }) => {
    const data = (await request.json()) as GroupRequest
    const created: Group = {
      id: nextId(),
      name: data.name,
      description: data.description ?? null,
      users: toGroupUsers(data.userIds),
    }
    groups.push(created)
    return HttpResponse.json(created)
  }),

  http.put(api(apiUrls.group.update(':id' as unknown as number)), async ({ params, request }) => {
    const group = groups.find((g) => g.id === Number(params.id))
    if (!group) return notFound()
    const data = (await request.json()) as GroupRequest
    if (data.name !== undefined) group.name = data.name
    if (data.description !== undefined) group.description = data.description ?? null
    if (data.userIds !== undefined) group.users = toGroupUsers(data.userIds)
    return HttpResponse.json(group)
  }),

  http.delete(api(apiUrls.group.delete(':id' as unknown as number)), ({ params }) => {
    const index = groups.findIndex((g) => g.id === Number(params.id))
    if (index < 0) return notFound()
    groups.splice(index, 1)
    return HttpResponse.json(true)
  }),
]
