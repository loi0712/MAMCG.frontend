import { http, HttpResponse } from 'msw'
import { apiUrls } from '@/api/config/endpoints'
import type { OrgUnitRequest } from '@/features/admin/api/lookups'
import type { CreateUserRequest, UpdateUserRequest, User } from '@/features/admin/api/users'
import { departments, nextId, positions, users } from '../db'
import { checkPasswordPolicy, isDirectoryAccount, revokeUserSessions } from './auth'
import { api, notFound, paginate } from './utils'

const badRequest = (title: string) => HttpResponse.json({ title, status: 400 }, { status: 400 })
const conflict = (title: string) => HttpResponse.json({ title, status: 409 }, { status: 409 })

// Như UserCsvExporter: ô bắt đầu bằng = + - @ bị thêm dấu ' (chống CSV injection), bọc "" khi cần
const csvCell = (value: string | null | undefined) => {
  let v = value ?? ''
  if (/^[=+\-@\t\r]/.test(v)) v = `'${v}`
  return /[",\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v
}

// CRUD phòng ban/chức vụ: chống trùng tên, chặn xoá khi còn người dùng (409)
const orgUnitHandlers = (
  kind: 'department' | 'position',
  items: Array<{ id: number; name: string; description: string | null }>,
  label: string
) => {
  const usersOf = (id: number) => users.filter((u) => (kind === 'department' ? u.department?.id : u.position?.id) === id).length
  const duplicate = (name: string, exceptId?: number) =>
    items.some((i) => i.id !== exceptId && i.name.trim().toLowerCase() === name.trim().toLowerCase())
  const urls = kind === 'department' ? apiUrls.department : apiUrls.position
  const listKey = kind === 'department' ? 'departments' : 'positions'
  return [
    http.get(api(urls.list), ({ request }) => {
      const { page, totalCount } = paginate(items, new URL(request.url), (i) => `${i.name} ${i.description ?? ''}`)
      return HttpResponse.json({ [listKey]: page.map((i) => ({ ...i, userCount: usersOf(i.id) })), totalCount })
    }),
    http.post(api(urls.create), async ({ request }) => {
      const data = (await request.json()) as OrgUnitRequest
      const name = data.name?.trim() ?? ''
      if (!name) return badRequest(`Vui lòng nhập tên ${label}`)
      if (duplicate(name)) return conflict(`${label[0].toUpperCase()}${label.slice(1)} "${name}" đã tồn tại`)
      const created = { id: nextId(), name, description: data.description ?? null }
      items.push(created)
      return HttpResponse.json(created, { status: 201 })
    }),
    http.put(api(urls.update(':id' as unknown as number)), async ({ params, request }) => {
      const item = items.find((i) => i.id === Number(params.id))
      if (!item) return notFound()
      const data = (await request.json()) as OrgUnitRequest
      const name = data.name?.trim() ?? item.name
      if (!name) return badRequest(`Vui lòng nhập tên ${label}`)
      if (duplicate(name, item.id)) return conflict(`${label[0].toUpperCase()}${label.slice(1)} "${name}" đã tồn tại`)
      item.name = name
      item.description = data.description ?? item.description
      // Người dùng giữ bản sao phòng ban/chức vụ: cập nhật tên hiển thị
      users.forEach((u) => {
        const ref = kind === 'department' ? u.department : u.position
        if (ref?.id === item.id) Object.assign(ref, item)
      })
      return HttpResponse.json(item)
    }),
    http.delete(api(urls.delete(':id' as unknown as number)), ({ params }) => {
      const index = items.findIndex((i) => i.id === Number(params.id))
      if (index < 0) return notFound()
      const count = usersOf(items[index].id)
      if (count > 0) {
        return conflict(
          kind === 'department'
            ? `Phòng ban đang có ${count} người dùng, không thể xoá. Hãy chuyển họ sang phòng ban khác trước.`
            : `Chức vụ đang được gán cho ${count} người dùng, không thể xoá. Hãy đổi chức vụ của họ trước.`
        )
      }
      items.splice(index, 1)
      return HttpResponse.json(true)
    }),
  ]
}

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

  http.get(api(apiUrls.user.export), ({ request }) => {
    const term = (new URL(request.url).searchParams.get('searchTerm') ?? '').trim().toLowerCase()
    const rows = users
      .filter((u) => !term || `${u.fullName} ${u.username} ${u.email}`.toLowerCase().includes(term))
      .sort((a, b) => (a.username ?? '').localeCompare(b.username ?? ''))
      .map((u) => [
        u.username, u.fullName, u.email, u.phoneNumber, u.department?.name, u.position?.name,
        u.isActive ? 'Hoạt động' : 'Ngừng hoạt động', isDirectoryAccount(u.username) ? 'AD/LDAP' : 'Nội bộ', '', '',
      ])
    const header = ['Tên đăng nhập', 'Họ tên', 'Email', 'Điện thoại', 'Phòng ban', 'Chức vụ', 'Trạng thái', 'Loại tài khoản', 'Đăng nhập gần nhất', 'Ngày tạo']
    const csv = [header, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n')
    return new HttpResponse(`\uFEFF${csv}\r\n`, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename=nguoi-dung_mock.csv',
      },
    })
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
    const policyError = checkPasswordPolicy(data.password, data.username)
    if (policyError) return badRequest(policyError)
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
    const data = (await request.json()) as UpdateUserRequest
    if (data.password) {
      const policyError = checkPasswordPolicy(data.password, users[index].username)
      if (policyError) return badRequest(policyError)
    }
    // Khoá tài khoản hoặc đặt mật khẩu mới: thu hồi mọi phiên (như UpdateUserCommandHandler)
    if (data.password || (users[index].isActive && data.isActive === false)) revokeUserSessions(users[index].id)
    users[index] = withRelations(users[index], data)
    return HttpResponse.json(users[index])
  }),

  http.delete(api(apiUrls.user.delete(':id')), ({ params }) => {
    const index = users.findIndex((u) => u.id === params.id)
    if (index < 0) return notFound()
    revokeUserSessions(users[index].id)
    users.splice(index, 1)
    return HttpResponse.json(true)
  }),

  ...orgUnitHandlers('department', departments, 'phòng ban'),
  ...orgUnitHandlers('position', positions, 'chức vụ'),
]
