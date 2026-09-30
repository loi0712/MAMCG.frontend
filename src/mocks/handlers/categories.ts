import { http, HttpResponse } from 'msw'
import { apiUrls } from '@/api/config/endpoints'
import { api } from './utils'
import { countAssetsUsingCategory } from './assets'

/**
 * Chuyên mục & nhóm chuyên mục giả. Quy tắc giống backend:
 * trùng mã → 409; xoá nhóm còn chuyên mục / chuyên mục đang được thiết kế dùng → 409 kèm lý do.
 */

type Group = { id: number; name: string; description: string | null; isDeleted: boolean }
type Category = { id: number; code: string; name: string; description: string | null; groupId: number; isDeleted: boolean }

const groups: Group[] = [
  { id: 1, name: 'Thời sự', description: 'Các chương trình tin tức', isDeleted: false },
  { id: 2, name: 'Giải trí', description: null, isDeleted: false },
  { id: 3, name: 'Nhóm trống', description: 'Chưa có chuyên mục', isDeleted: false },
]

const categories: Category[] = [
  { id: 1, code: 'TT', name: 'Bản tin thời sự', description: 'Bản tin sáng, trưa, tối', groupId: 1, isDeleted: false },
  { id: 2, code: 'THT', name: 'Thể thao', description: null, groupId: 2, isDeleted: false },
  { id: 3, code: 'TTI', name: 'Thời tiết', description: null, groupId: 1, isDeleted: false },
  { id: 4, code: 'PTL', name: 'Phim tài liệu', description: 'Chưa có thiết kế nào', groupId: 2, isDeleted: false },
]

let nextGroupId = 10
let nextCategoryId = 10

const problem = (status: number, title: string) => HttpResponse.json({ status, title }, { status })
const liveGroups = () => groups.filter((g) => !g.isDeleted)
const liveCategories = () => categories.filter((c) => !c.isDeleted)
const groupDto = (g: Group | undefined) => (g ? { id: g.id, name: g.name, description: g.description } : null)
const categoryDetail = (c: Category) => ({
  id: c.id,
  code: c.code,
  name: c.name,
  description: c.description,
  group: groupDto(groups.find((g) => g.id === c.groupId)),
})

const paging = (url: URL) => ({
  pageNumber: Math.max(1, Number(url.searchParams.get('pageNumber') ?? 1)),
  pageSize: Math.min(200, Math.max(1, Number(url.searchParams.get('pageSize') ?? 20))),
  term: (url.searchParams.get('searchTerm') ?? '').trim().toLowerCase(),
})

type CategoryBody = { name?: string; groupId?: number; code?: string; description?: string }

export const categoryHandlers = [
  // ----- Chuyên mục -----
  http.get(api(apiUrls.category.list), ({ request }) => {
    const url = new URL(request.url)
    const { pageNumber, pageSize, term } = paging(url)
    const groupId = Number(url.searchParams.get('groupId') ?? 0)
    const items = liveCategories()
      .filter((c) => !groupId || c.groupId === groupId)
      .filter((c) => !term || [c.name, c.code, c.description ?? ''].some((v) => v.toLowerCase().includes(term)))
      .sort((a, b) => a.name.localeCompare(b.name, 'vi'))
    return HttpResponse.json({
      categories: items.slice((pageNumber - 1) * pageSize, pageNumber * pageSize).map((c) => ({
        id: c.id,
        name: c.name,
        groupId: c.groupId,
        code: c.code,
        description: c.description,
        groupName: groups.find((g) => g.id === c.groupId)?.name ?? null,
      })),
      totalCount: items.length,
    })
  }),

  http.get(api(apiUrls.category.details(':id' as unknown as number)), ({ params }) => {
    const c = liveCategories().find((x) => x.id === Number(params.id))
    return HttpResponse.json({
      category: c ? categoryDetail(c) : null,
      categoryGroups: liveGroups().map((g) => ({ id: g.id, name: g.name })),
    })
  }),

  http.post(api(apiUrls.category.create), async ({ request }) => {
    const body = (await request.json()) as CategoryBody
    if (categories.some((c) => c.code === body.code)) return problem(409, 'Mã chuyên mục đã tồn tại')
    if (!liveGroups().some((g) => g.id === Number(body.groupId))) return problem(400, 'Nhóm chuyên mục không tồn tại')
    const c: Category = {
      id: nextCategoryId++,
      code: body.code ?? '',
      name: body.name ?? '',
      description: body.description || null,
      groupId: Number(body.groupId),
      isDeleted: false,
    }
    categories.push(c)
    return HttpResponse.json(categoryDetail(c))
  }),

  http.put(api(apiUrls.category.update(':id' as unknown as number)), async ({ request, params }) => {
    const c = liveCategories().find((x) => x.id === Number(params.id))
    if (!c) return problem(404, 'Không tìm thấy chuyên mục')
    const body = (await request.json()) as CategoryBody
    if (body.code && categories.some((x) => x.id !== c.id && x.code === body.code)) return problem(409, 'Mã chuyên mục đã tồn tại')
    if (body.groupId && body.groupId !== c.groupId && !liveGroups().some((g) => g.id === Number(body.groupId)))
      return problem(400, 'Nhóm chuyên mục không tồn tại')
    c.name = body.name ?? c.name
    c.code = body.code ?? c.code
    c.groupId = body.groupId ?? c.groupId
    c.description = body.description ?? c.description
    return HttpResponse.json(categoryDetail(c))
  }),

  http.delete(api(apiUrls.category.delete(':id' as unknown as number)), ({ params }) => {
    const c = liveCategories().find((x) => x.id === Number(params.id))
    if (!c) return problem(404, 'Không tìm thấy chuyên mục')
    const used = countAssetsUsingCategory(c.id)
    if (used > 0) return problem(409, `Không thể xoá chuyên mục '${c.name}' vì đang được sử dụng bởi ${used} tài sản.`)
    c.isDeleted = true
    return HttpResponse.json(true)
  }),

  // ----- Nhóm chuyên mục -----
  http.get(api(apiUrls.categoryGroup.list), ({ request }) => {
    const { pageNumber, pageSize, term } = paging(new URL(request.url))
    const items = liveGroups()
      .filter((g) => !term || g.name.toLowerCase().includes(term) || (g.description ?? '').toLowerCase().includes(term))
      .sort((a, b) => a.name.localeCompare(b.name, 'vi'))
    return HttpResponse.json({
      categoryGroups: items.slice((pageNumber - 1) * pageSize, pageNumber * pageSize).map((g) => ({
        id: g.id,
        name: g.name,
        description: g.description,
        categoryCount: liveCategories().filter((c) => c.groupId === g.id).length,
      })),
      totalCount: items.length,
    })
  }),

  http.post(api(apiUrls.categoryGroup.create), async ({ request }) => {
    const body = (await request.json()) as { name?: string; description?: string }
    const g: Group = { id: nextGroupId++, name: body.name ?? '', description: body.description || null, isDeleted: false }
    groups.push(g)
    return HttpResponse.json(groupDto(g))
  }),

  http.put(api(apiUrls.categoryGroup.update(':id' as unknown as number)), async ({ request, params }) => {
    const g = liveGroups().find((x) => x.id === Number(params.id))
    if (!g) return problem(404, 'Không tìm thấy nhóm chuyên mục')
    const body = (await request.json()) as { name?: string; description?: string }
    g.name = body.name ?? g.name
    g.description = body.description ?? g.description
    return HttpResponse.json(groupDto(g))
  }),

  http.delete(api(apiUrls.categoryGroup.delete(':id' as unknown as number)), ({ params }) => {
    const g = liveGroups().find((x) => x.id === Number(params.id))
    if (!g) return problem(404, 'Không tìm thấy nhóm chuyên mục')
    const count = liveCategories().filter((c) => c.groupId === g.id).length
    if (count > 0) return problem(409, `Không thể xoá nhóm chuyên mục '${g.name}' vì đang được sử dụng bởi ${count} chuyên mục.`)
    g.isDeleted = true
    return HttpResponse.json(true)
  }),
]
