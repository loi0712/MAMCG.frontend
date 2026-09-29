import { http, HttpResponse } from 'msw'
import { apiUrls } from '@/api/config/endpoints'
import type { SavePermissionRequest } from '@/features/admin/api/permissions'
import { aces, permissionTree } from '../db'
import { api } from './utils'

export const permissionHandlers = [
  http.get(api(apiUrls.permission.tree), () => HttpResponse.json(permissionTree)),

  http.get(api(apiUrls.permission.byTarget), ({ request }) => {
    const url = new URL(request.url)
    const targetType = url.searchParams.get('targetType')
    const targetId = url.searchParams.get('targetId')
    const permissionIds = aces.get(`${targetType}:${targetId}`)
    return HttpResponse.json({
      permission: permissionIds ? { targetType, targetId, permissionIds } : null,
      permissionTree,
    })
  }),

  http.post(api(apiUrls.permission.create), async ({ request }) => {
    const data = (await request.json()) as SavePermissionRequest
    // Backend dùng int.Parse cho từng id: chuỗi rỗng gây lỗi 500
    if (!data.permissionIds || data.permissionIds.split(',').some((s) => !/^\d+$/.test(s.trim()))) {
      return HttpResponse.json({ error: 'Input string was not in a correct format.' }, { status: 500 })
    }
    aces.set(`${data.targetType}:${data.targetId}`, data.permissionIds)
    return HttpResponse.json(true)
  }),
]
