import { http, HttpResponse } from 'msw'
import JSZip from 'jszip'
import { apiUrls } from '@/api/config/endpoints'
import { api, notFound } from './utils'

/**
 * Thiết kế (asset) giả: danh sách, xoá, thao tác hàng loạt, xuất CSV, thùng rác.
 * Quy tắc bám theo backend (Asset.Application.Assets.Bulk / Trash / Export).
 */

// ===========================================
// DỮ LIỆU
// ===========================================

type Status = { id: string; name: string; color: string }
type Action = { id: string; name: string; color: string; requireUpload: boolean; to: string }

const STATUSES: Record<string, Status> = {
  '2': { id: '2', name: 'Thiết kế đồ hoạ', color: '#3b82f6' },
  '3': { id: '3', name: 'Duyệt cấp 1', color: '#f59e0b' },
  '6': { id: '6', name: 'Duyệt trung tâm', color: '#22c55e' },
}

// Hành động quy trình theo trạng thái hiện tại
const ACTIONS: Record<string, Action[]> = {
  '2': [
    { id: '10', name: 'Gửi duyệt', color: '#3b82f6', requireUpload: false, to: '3' },
    { id: '13', name: 'Tải lên bản thiết kế', color: '#6366f1', requireUpload: true, to: '2' },
  ],
  '3': [
    { id: '11', name: 'Duyệt', color: '#22c55e', requireUpload: false, to: '6' },
    { id: '12', name: 'Trả lại', color: '#ef4444', requireUpload: false, to: '2' },
  ],
  '6': [],
}

const CATEGORIES: Record<string, string> = { '1': 'Bản tin thời sự', '2': 'Thể thao', '3': 'Thời tiết' }

type MockAsset = {
  id: number
  code: string | null
  name: string
  extension: string
  size: number
  status: string
  categoryId: string
  assignedTo: string
  title: string
  workflowItemId: number | null
  // Mô phỏng: thiết kế đang giao cho người khác → Content từ chối hành động
  lockedByOther?: boolean
  isDeleted: boolean
  purged: boolean
  deletedAt: string | null
  createdAt: string
}

// Ảnh thu nhỏ dạng data URI để chế độ mock không gọi /storage của backend thật
const thumb = (color: string, text: string) =>
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="90"><rect width="160" height="90" fill="${color}"/><text x="80" y="52" font-size="18" fill="white" text-anchor="middle" font-family="sans-serif">${text}</text></svg>`
  )
const THUMBS = [thumb('#1e3a8a', 'BẢN TIN'), thumb('#166534', 'THỂ THAO'), thumb('#9a3412', 'THỜI TIẾT')]

const day = (offset: number) => new Date(Date.now() + offset * 86400000).toISOString()

let nextId = 1
const make = (p: Partial<MockAsset> & Pick<MockAsset, 'name' | 'status'>): MockAsset => {
  const id = nextId++
  return {
    id,
    code: `TT0926${String(id).padStart(4, '0')}`,
    extension: '.png',
    size: 150_000 + id * 7_331,
    categoryId: String((id % 3) + 1),
    assignedTo: 'Trần Thị Bình',
    title: p.name,
    workflowItemId: 100 + id,
    isDeleted: false,
    purged: false,
    deletedAt: null,
    createdAt: day(-id),
    ...p,
  }
}

export const mockAssets: MockAsset[] = [
  make({ name: 'Bản tin sáng - logo góc', status: '3' }),
  make({ name: 'Bản tin trưa - lower third', status: '3' }),
  make({ name: 'Thể thao 24h - bảng tỉ số', status: '3', lockedByOther: true, assignedTo: 'Lê Văn Cường' }),
  make({ name: 'Thời tiết - bản đồ', status: '2' }),
  make({ name: 'Chào buổi sáng - intro', status: '2' }),
  make({ name: 'Bản tin tối - =HYPERLINK("x")', status: '6' }),
  make({ name: 'Tiêu điểm - nền', status: '6' }),
  make({ name: 'Phim tài liệu - title', status: '2', workflowItemId: null }),
  // Thùng rác: 1 mục trùng mã với thiết kế đang dùng (khôi phục → 409)
  make({ name: 'Bản tin sáng (bản cũ)', status: '3', code: 'TT09260001', isDeleted: true, deletedAt: day(-3) }),
  make({ name: 'Quảng cáo cũ', status: '2', isDeleted: true, deletedAt: day(-12) }),
]

const FIELD_DEFS = [
  { id: 1, fieldName: 'ID', displayName: 'Mã', dataType: 'singleline' },
  { id: 2, fieldName: 'Thumbnail', displayName: 'Ảnh', dataType: 'image' },
  { id: 3, fieldName: 'FileName', displayName: 'Tên file', dataType: 'singleline' },
  { id: 4, fieldName: 'Status', displayName: 'Trạng thái', dataType: 'workflowstatus' },
  { id: 5, fieldName: 'Category', displayName: 'Chuyên mục', dataType: 'category' },
  { id: 6, fieldName: 'AssignedTo', displayName: 'Người xử lý', dataType: 'user' },
  { id: 7, fieldName: 'Title', displayName: 'Tiêu đề', dataType: 'singleline' },
]

const fieldValues = (a: MockAsset): Record<string, string> => ({
  ID: a.code ?? '',
  Thumbnail: THUMBS[Number(a.categoryId) - 1],
  FileName: `${a.name}${a.extension}`,
  Status: STATUSES[a.status]?.name ?? '',
  Category: CATEGORIES[a.categoryId] ?? '',
  AssignedTo: a.assignedTo,
  Title: a.title,
})

const toListDto = (a: MockAsset) => {
  const values = fieldValues(a)
  return {
    id: a.id,
    name: a.name,
    filePath: JSON.stringify([`/storage/assets/Image/${a.id}${a.extension}`]),
    extension: a.extension,
    size: a.size,
    isApproved: a.status === '6',
    workflowItemId: a.workflowItemId,
    fields: FIELD_DEFS.map((f) => ({
      ...f,
      value: values[f.fieldName] ?? '',
      color: f.fieldName === 'Status' ? STATUSES[a.status]?.color ?? null : null,
    })),
  }
}

const active = () => mockAssets.filter((a) => !a.isDeleted)
const findActive = (id: number) => mockAssets.find((a) => a.id === id && !a.isDeleted)

// Cùng ngữ nghĩa với AssetListQuery: searchTerm là JSON bộ lọc động, không phải JSON → tìm theo tên
const applyFilter = (items: MockAsset[], searchTerm: string | null) => {
  const term = (searchTerm ?? '').trim()
  if (!term) return items
  try {
    const filters = JSON.parse(term) as { FieldId: number; Operator: string; Value: string }[]
    return items.filter((a) =>
      filters.every((f) => (f.FieldId === 4 ? a.status === String(f.Value) : true))
    )
  } catch {
    return items.filter((a) => a.name.toLowerCase().includes(term.toLowerCase()))
  }
}

const listFor = (url: URL) =>
  applyFilter(active(), url.searchParams.get('searchTerm')).sort((x, y) => y.createdAt.localeCompare(x.createdAt))

// ===========================================
// QUY TẮC HÀNG LOẠT (giống AssetBulkLimits)
// ===========================================

const LIMITS = { delete: 200, download: 200, action: 100 }

const normalizeIds = (ids: unknown, max: number): number[] | HttpResponse<null> => {
  const list = [...new Set((Array.isArray(ids) ? ids : []).map(Number).filter((n) => Number.isInteger(n) && n > 0))]
  if (list.length === 0) return badRequest('Chưa chọn tài sản nào.')
  if (list.length > max) return badRequest(`Chỉ được thao tác tối đa ${max} tài sản mỗi lần (đang chọn ${list.length}).`)
  return list
}

const problem = (status: number, title: string) =>
  HttpResponse.json({ status, title }, { status }) as unknown as HttpResponse<null>
const badRequest = (title: string) => problem(400, title)

const summary = (items: { id: number; ok: boolean; error: string | null }[]) => ({
  total: items.length,
  succeeded: items.filter((i) => i.ok).length,
  failed: items.filter((i) => !i.ok).length,
  items,
})

const actionsOf = (a: MockAsset) =>
  (ACTIONS[a.status] ?? []).map((x) => ({ id: x.id, name: x.name, color: x.color, requireUpload: x.requireUpload }))

// Tên entry ZIP an toàn (giống ZipEntryNamer)
const sanitize = (name: string, fallback: string) => {
  let r = Array.from(name, (ch) => (ch.charCodeAt(0) < 32 || '/\\:*?"<>|'.includes(ch) ? '_' : ch)).join('')
  while (r.includes('..')) r = r.replace('..', '.')
  r = r.trim().replace(/^[. ]+|[. ]+$/g, '')
  return r || fallback
}

// Ô CSV: chống công thức (tiền tố ') + đặt trong ngoặc kép khi cần (giống AssetCsv)
const csvCell = (v: string | null | undefined) => {
  if (!v) return ''
  let s = v
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`
  if (/[",;\r\n]/.test(s)) s = `"${s.replace(/"/g, '""')}"`
  return s
}

// ===========================================
// HANDLERS
// ===========================================

export const assetHandlers = [
  http.get(api(apiUrls.asset.list), ({ request }) => {
    const url = new URL(request.url)
    const pageNumber = Number(url.searchParams.get('pageNumber') ?? 1)
    const pageSize = Math.min(200, Math.max(1, Number(url.searchParams.get('pageSize') ?? 20)))
    const items = listFor(url)
    const page = items.slice((pageNumber - 1) * pageSize, pageNumber * pageSize)
    return HttpResponse.json({ assets: page.map(toListDto), totalCount: items.length })
  }),

  http.get(api(apiUrls.asset.export), ({ request }) => {
    const url = new URL(request.url)
    const rows = listFor(url).slice(0, 10_000)
    const header = ['Mã hệ thống', 'Tên file', 'Định dạng', 'Dung lượng (byte)', ...FIELD_DEFS.filter((f) => f.fieldName !== 'Thumbnail').map((f) => f.displayName)]
    const lines = [header.map(csvCell).join(',')]
    for (const a of rows) {
      const values = fieldValues(a)
      lines.push(
        [String(a.id), a.name, a.extension, String(a.size), ...FIELD_DEFS.filter((f) => f.fieldName !== 'Thumbnail').map((f) => values[f.fieldName])]
          .map(csvCell)
          .join(',')
      )
    }
    return new HttpResponse('﻿' + lines.join('\r\n') + '\r\n', {
      headers: { 'Content-Type': 'text/csv; charset=utf-8' },
    })
  }),

  http.delete(api(apiUrls.asset.delete(':id')), ({ params }) => {
    const asset = findActive(Number(params.id))
    if (!asset) return HttpResponse.json(false)
    asset.isDeleted = true
    asset.deletedAt = new Date().toISOString()
    return HttpResponse.json(true)
  }),

  http.post(api(apiUrls.asset.bulkDelete), async ({ request }) => {
    const body = (await request.json()) as { ids?: unknown }
    const ids = normalizeIds(body.ids, LIMITS.delete)
    if (!Array.isArray(ids)) return ids
    const items = ids.map((id) => {
      const asset = findActive(id)
      if (!asset) return { id, ok: false, error: 'Không tìm thấy tài sản hoặc tài sản đã bị xoá.' }
      asset.isDeleted = true
      asset.deletedAt = new Date().toISOString()
      return { id, ok: true, error: null }
    })
    return HttpResponse.json(summary(items))
  }),

  http.post(api(apiUrls.asset.bulkAvailableActions), async ({ request }) => {
    const body = (await request.json()) as { ids?: unknown }
    const ids = normalizeIds(body.ids, LIMITS.action)
    if (!Array.isArray(ids)) return ids
    const items = ids.map((id) => {
      const asset = findActive(id)
      if (!asset) return { id, error: 'Không tìm thấy tài sản hoặc tài sản đã bị xoá.', actions: [] }
      if (!asset.workflowItemId) return { id, error: 'Tài sản chưa tham gia quy trình duyệt.', actions: [] }
      return { id, error: null, actions: actionsOf(asset) }
    })
    const common = items.reduce(
      (acc, item, i) => (i === 0 ? item.actions : acc.filter((a) => item.actions.some((b) => b.id === a.id))),
      [] as ReturnType<typeof actionsOf>
    )
    return HttpResponse.json({ common, items })
  }),

  http.post(api(apiUrls.asset.bulkAction), async ({ request }) => {
    const body = (await request.json()) as { ids?: unknown; actionId?: number; comment?: string }
    if (!body.actionId || body.actionId <= 0) return badRequest('Chưa chọn hành động quy trình.')
    const ids = normalizeIds(body.ids, LIMITS.action)
    if (!Array.isArray(ids)) return ids
    const items = ids.map((id) => {
      const asset = findActive(id)
      if (!asset) return { id, ok: false, error: 'Không tìm thấy tài sản hoặc tài sản đã bị xoá.' }
      if (!asset.workflowItemId) return { id, ok: false, error: 'Tài sản chưa tham gia quy trình duyệt.' }
      const action = (ACTIONS[asset.status] ?? []).find((a) => a.id === String(body.actionId))
      if (!action) return { id, ok: false, error: 'Hành động không khả dụng ở trạng thái hiện tại của tài sản.' }
      if (action.requireUpload) return { id, ok: false, error: 'Hành động này yêu cầu tải lên file, hãy thực hiện trong trang chi tiết.' }
      if (asset.lockedByOther) return { id, ok: false, error: 'Bạn không phải người được giao xử lý thiết kế này.' }
      asset.status = action.to
      return { id, ok: true, error: null }
    })
    return HttpResponse.json(summary(items))
  }),

  http.post(api(apiUrls.asset.bulkDownload), async ({ request }) => {
    const body = (await request.json()) as { ids?: unknown }
    const ids = normalizeIds(body.ids, LIMITS.download)
    if (!Array.isArray(ids)) return ids
    const zip = new JSZip()
    const used = new Set<string>()
    const skipped: string[] = []
    for (const id of ids) {
      const asset = findActive(id)
      if (!asset) {
        skipped.push(`#${id}: không tìm thấy tài sản hoặc tài sản đã bị xoá`)
        continue
      }
      const base = sanitize(`${asset.code ? `${asset.code}_` : ''}${asset.name}${asset.extension}`, `tai-san-${id}${asset.extension}`)
      let name = base
      for (let i = 2; used.has(name.toLowerCase()); i++) name = base.replace(/(\.[^.]*)?$/, ` (${i})$1`)
      used.add(name.toLowerCase())
      zip.file(name, `Nội dung giả của thiết kế ${asset.name}`)
    }
    if (used.size === 0) return problem(404, 'Không có file nào để tải xuống (tài sản đã bị xoá hoặc file gốc không tồn tại).')
    if (skipped.length) zip.file('_BO_QUA.txt', 'Các tài sản không có trong file tải xuống:\r\n' + skipped.join('\r\n'))
    const content = await zip.generateAsync({ type: 'arraybuffer' })
    return new HttpResponse(content, { headers: { 'Content-Type': 'application/zip' } })
  }),

  // ----- Thùng rác (quản trị) -----
  http.get(api(apiUrls.asset.trash), ({ request }) => {
    const url = new URL(request.url)
    const pageNumber = Number(url.searchParams.get('pageNumber') ?? 1)
    const pageSize = Math.min(200, Math.max(1, Number(url.searchParams.get('pageSize') ?? 20)))
    const term = (url.searchParams.get('searchTerm') ?? '').toLowerCase()
    const items = mockAssets
      .filter((a) => a.isDeleted && !a.purged)
      .filter((a) => !term || a.name.toLowerCase().includes(term) || (a.code ?? '').toLowerCase().includes(term))
      .sort((x, y) => (y.deletedAt ?? '').localeCompare(x.deletedAt ?? ''))
    const activeCodes = new Set(active().map((a) => a.code))
    return HttpResponse.json({
      assets: items.slice((pageNumber - 1) * pageSize, pageNumber * pageSize).map((a) => ({
        id: a.id,
        name: a.name,
        code: a.code,
        extension: a.extension,
        size: a.size,
        thumbnail: THUMBS[Number(a.categoryId) - 1],
        createdAt: a.createdAt,
        deletedAt: a.deletedAt,
        codeConflict: !!a.code && activeCodes.has(a.code),
      })),
      totalCount: items.length,
      retentionDays: 30,
    })
  }),

  http.post(api(apiUrls.asset.restore(':id' as unknown as number)), ({ params }) => {
    const asset = mockAssets.find((a) => a.id === Number(params.id) && a.isDeleted && !a.purged)
    if (!asset) return problem(404, 'Không tìm thấy tài sản trong thùng rác.')
    if (asset.code && active().some((a) => a.code === asset.code))
      return problem(409, `Mã tài sản '${asset.code}' đã được một tài sản khác sử dụng, không thể khôi phục.`)
    asset.isDeleted = false
    asset.deletedAt = null
    return HttpResponse.json(true)
  }),

  http.delete(api(apiUrls.asset.purge(':id' as unknown as number)), ({ params }) => {
    const asset = mockAssets.find((a) => a.id === Number(params.id) && a.isDeleted && !a.purged)
    if (!asset) return problem(404, 'Không tìm thấy tài sản trong thùng rác.')
    asset.purged = true
    return HttpResponse.json(true)
  }),

  // Thông tin thư mục gốc (trang danh sách thiết kế cần để hiện đường dẫn thư mục)
  // (id không phải số, vd. /Folder/folder-tree → trả undefined để handler khác xử lý)
  http.get(api(apiUrls.folder.details(':id')), ({ params }) => {
    if (!/^\d+$/.test(String(params.id))) return undefined
    return HttpResponse.json({
      folder: null,
      parentFolders: [],
      folderStyles: [],
      fields: FIELD_DEFS.map((f) => ({ id: f.id, fieldName: f.fieldName, displayName: f.displayName, dataType: { id: f.id, name: f.dataType, datasource: null } })),
      operators: [],
      categoryGroups: [],
    })
  }),

  // Chi tiết tối giản cho khung xem trước
  http.get(api(apiUrls.asset.details(':id')), ({ params }) => {
    const asset = findActive(Number(params.id))
    if (!asset) return notFound()
    const values = fieldValues(asset)
    return HttpResponse.json({
      asset: {
        ...toListDto(asset),
        createdAt: asset.createdAt,
        modifiedAt: asset.createdAt,
        workflowItem: asset.workflowItemId
          ? { id: asset.workflowItemId, histories: [], actions: actionsOf(asset) }
          : { id: 0, histories: [], actions: [] },
      },
      panels: [
        {
          id: 1,
          panelName: 'Thông tin',
          description: null,
          visibilityRules: null,
          fields: FIELD_DEFS.filter((f) => f.fieldName !== 'Thumbnail').map((f) => ({
            id: f.id,
            fieldName: f.fieldName,
            displayName: f.displayName,
            dataType: { id: f.id, name: 'singleline', datasource: null },
            isRequired: false,
            editable: false,
            value: values[f.fieldName],
          })),
        },
      ],
    })
  }),
]

/** Chuyên mục đang được thiết kế (chưa xoá vĩnh viễn) sử dụng — dùng cho mock chặn xoá chuyên mục. */
export const countAssetsUsingCategory = (categoryId: number) =>
  mockAssets.filter((a) => !a.purged && a.categoryId === String(categoryId)).length
