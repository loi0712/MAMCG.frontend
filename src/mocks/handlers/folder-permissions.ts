import { http, HttpResponse } from 'msw'
import { apiUrls } from '@/api/config/endpoints'
import type { Permission, SaveFolderPermissionsRequest, TargetType } from '@/features/admin/api/permissions'
import type { TFolder } from '@/components/layout/types/folders'
import { groups, permissionTree, users } from '../db'
import { api } from './utils'

// Quyền "Quản trị hệ thống" (mã ADMIN) chỉ gán toàn hệ thống, không gán theo thư mục
const ADMIN_PERMISSION_ID = 9

const prune = (nodes: Permission[]): Permission[] =>
  nodes.filter((p) => p.id !== ADMIN_PERMISSION_ID).map((p) => ({ ...p, childrens: prune(p.childrens ?? []) }))

// Quyền theo thư mục: folderId -> danh sách (đối tượng, quyền)
const folderAces = new Map<string, Array<{ targetType: TargetType; targetId: string; permissionIds: string }>>([
  ['11', [{ targetType: 'GROUP', targetId: '2', permissionIds: '1,2,3,4' }]],
])

const folder = (id: number, name: string, level: number, childs: TFolder[] = []): TFolder => ({
  id,
  name,
  description: null,
  index: id,
  level,
  pathCode: null,
  parentId: null,
  folderStyle: 0,
  hasChilds: childs.length > 0,
  projectCode: null,
  childs,
})

// Cây thư mục mẫu để thử menu chuột phải (danh sách rỗng trước đây không mở được menu)
const folderTree: TFolder[] = [
  folder(10, 'Thời sự', 1, [folder(11, 'Bản tin 18h', 2), folder(12, 'Bản tin 19h', 2)]),
  folder(20, 'Thể thao', 1),
]

const flatten = (nodes: TFolder[], parent: TFolder | null = null): Array<{ node: TFolder; parent: TFolder | null }> =>
  nodes.flatMap((n) => [{ node: n, parent }, ...flatten(n.childs, n)])

export const folderPermissionHandlers = [
  http.get(api(apiUrls.folder.list), () => HttpResponse.json(folderTree)),

  // Chi tiết thư mục tối thiểu (màn tài sản mở thư mục "0" = tất cả)
  http.get(api(apiUrls.folder.details(':id')), ({ params }) => {
    const found = flatten(folderTree).find((f) => String(f.node.id) === params.id)
    const node = found?.node ?? folder(Number(params.id) || 0, 'Tất cả', 0)
    return HttpResponse.json({
      folder: {
        id: node.id, name: node.name, description: '', index: node.index ?? 0, level: node.level ?? 0, pathCode: '',
        parentId: found?.parent?.id ?? null, parentName: found?.parent?.name ?? null, folderStyle: 'Default',
        createdAt: '2026-09-01T08:00:00', modifiedAt: '2026-09-01T08:00:00', filters: [],
      },
      parentFolders: folderTree.map((f) => ({ id: f.id, name: f.name })),
      folderStyles: [],
      fields: [],
      operators: [],
    })
  }),

  http.get(api(apiUrls.permission.folder(':id')), ({ params }) =>
    HttpResponse.json({
      folderPermission: (folderAces.get(String(params.id)) ?? []).map((a) => ({ ...a, objectId: Number(params.id) })),
      permissionTree: prune(permissionTree),
      users: users.map((u) => ({ id: u.id, username: u.username, fullName: u.fullName, isActive: u.isActive })),
      groups: groups.map((g) => ({ id: g.id, name: g.name })),
    })
  ),

  // Thay toàn bộ quyền của thư mục; không nhận quyền quản trị hệ thống
  http.post(api(apiUrls.permission.folderSave), async ({ request }) => {
    const data = (await request.json()) as SaveFolderPermissionsRequest
    const invalid = data.permissions.some((p) => p.permissionIds.split(',').some((s) => !/^\d+$/.test(s.trim())))
    if (invalid) return HttpResponse.json({ title: 'Mã quyền không hợp lệ', status: 400 }, { status: 400 })
    const adminIds = new Set([ADMIN_PERMISSION_ID, ...(permissionTree.find((p) => p.id === ADMIN_PERMISSION_ID)?.childrens ?? []).map((c) => c.id)])
    if (data.permissions.some((p) => p.permissionIds.split(',').some((s) => adminIds.has(Number(s))))) {
      return HttpResponse.json({ title: 'Không thể gán quyền quản trị hệ thống theo thư mục.', status: 400 }, { status: 400 })
    }
    folderAces.set(String(data.folderId), data.permissions)
    return HttpResponse.json(true)
  }),
]
