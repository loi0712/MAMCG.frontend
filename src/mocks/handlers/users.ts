import { http, HttpResponse } from 'msw'
import { apiUrls } from '@/api/config/endpoints'
import type { CreateUserRequest, UpdateUserRequest, User } from '@/features/admin/api/users'
import { departments, positions, users } from '../db'
import { api, notFound, paginate } from './utils'

const withRelations = (u: User, data: UpdateUserRequest): User => ({
  ...u,
  ...(data.fullName !== undefined && { fullName: data.fullName }),
  ...(data.email !== undefined && { email: data.email }),
  ...(data.phoneNumber !== undefined && { phoneNumber: data.phoneNumber ?? null }),
  ...(data.isActive !== undefined && { isActive: data.isActive }),
  ...(data.departmentId !== undefined && {
    department: departments.find((d) => d.id === data.departmentId) ?? null,
  }),
  ...(data.positionId !== undefined && {
    position: positions.find((p) => p.id === data.positionId) ?? null,
  }),
})

export const userHandlers = [
  http.get(api(apiUrls.user.list), ({ request }) => {
    const { page, totalCount } = paginate(
      users,
      new URL(request.url),
      (u) => `${u.fullName} ${u.username} ${u.email}`
    )
    return HttpResponse.json({ users: page, totalCount })
  }),

  http.get(api(apiUrls.user.details(':id')), ({ params }) => {
    const user = users.find((u) => u.id === params.id)
    if (!user) return notFound()
    return HttpResponse.json({ user, positions, departments })
  }),

  http.post(api(apiUrls.user.create), async ({ request }) => {
    const data = (await request.json()) as CreateUserRequest
    if (users.some((u) => u.username === data.username)) {
      return HttpResponse.json({ error: 'Username already exists' }, { status: 400 })
    }
    const created = withRelations(
      {
        id: crypto.randomUUID(),
        username: data.username,
        fullName: null,
        email: null,
        phoneNumber: null,
        gender: null,
        dateOfBirth: null,
        address: null,
        department: null,
        position: null,
        imageUrl: null,
        isActive: true,
      },
      data
    )
    users.push(created)
    return HttpResponse.json(created)
  }),

  http.put(api(apiUrls.user.update(':id')), async ({ params, request }) => {
    const index = users.findIndex((u) => u.id === params.id)
    if (index < 0) return notFound()
    users[index] = withRelations(users[index], (await request.json()) as UpdateUserRequest)
    return HttpResponse.json(users[index])
  }),

  http.delete(api(apiUrls.user.delete(':id')), ({ params }) => {
    const index = users.findIndex((u) => u.id === params.id)
    if (index < 0) return notFound()
    users.splice(index, 1)
    return HttpResponse.json(true)
  }),

  http.get(api(apiUrls.department.list), () =>
    HttpResponse.json({ departments, totalCount: departments.length })
  ),
  http.get(api(apiUrls.position.list), () =>
    HttpResponse.json({ positions, totalCount: positions.length })
  ),
]
