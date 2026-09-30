import { http, HttpResponse } from 'msw'
import { apiUrls } from '@/api/config/endpoints'
import { api, notFound } from './utils'

// Tài sản mẫu cho màn danh sách/chi tiết (dùng cho chế độ mock và E2E); khai báo trước appHandlers (danh sách rỗng)

const now = new Date()
const isoAgo = (days: number) => new Date(now.getTime() - days * 86_400_000).toISOString().replace('Z', '')

interface MockAsset {
  id: number
  code: string
  name: string
  extension: string
  size: number
  category: string
  status: string
  statusColor: string
  author: string
  description: string
  days: number
}

const mockAssets: MockAsset[] = [
  { id: 101, code: 'TS-0001', name: 'Lower third Thời sự 19h', extension: '.png', size: 245_760, category: 'Thời sự 19h', status: 'Chờ duyệt', statusColor: '#f59e0b', author: 'an.nguyen', description: 'Bar tên khách mời 2 dòng', days: 1 },
  { id: 102, code: 'TT-0002', name: 'Bảng tỉ số Thể thao 24/7', extension: '.mov', size: 18_874_368, category: 'Thể thao 24/7', status: 'Đã duyệt', statusColor: '#16a34a', author: 'binh.tran', description: 'Bảng tỉ số động', days: 2 },
  { id: 103, code: 'CB-0003', name: 'Khung thời tiết Chào buổi sáng', extension: '.psd', size: 52_428_800, category: 'Chào buổi sáng', status: 'Mới tạo', statusColor: '#64748b', author: 'cuong.le', description: 'Nền bản đồ thời tiết', days: 3 },
]

const listFields = (a: MockAsset) => [
  { id: 1, fieldName: 'ID', displayName: 'Mã', dataType: 'singleline', value: a.code, color: '' },
  { id: 2, fieldName: 'Status', displayName: 'Trạng thái', dataType: 'workflowstatus', value: a.status, color: a.statusColor },
  { id: 3, fieldName: 'Category', displayName: 'Chuyên mục', dataType: 'category', value: a.category, color: '' },
  { id: 4, fieldName: 'Author', displayName: 'Người tạo', dataType: 'user', value: a.author, color: '' },
  { id: 5, fieldName: 'FileName', displayName: 'Tên file', dataType: 'singleline', value: a.name + a.extension, color: '' },
  { id: 6, fieldName: 'Description', displayName: 'Mô tả', dataType: 'multiline', value: a.description, color: '' },
]

const base = (a: MockAsset) => ({
  id: a.id,
  name: a.name,
  filePath: '',
  extension: a.extension,
  size: a.size,
  isApproved: a.status === 'Đã duyệt',
  createdAt: isoAgo(a.days),
  modifiedAt: isoAgo(a.days),
  workflowItemId: a.id + 1000,
})

const detailField = (id: number, fieldName: string, displayName: string, dataType: string, value: string, editable = true) => ({
  id,
  fieldName,
  displayName,
  dataType: { id, name: dataType, datasource: null },
  isRequired: false,
  editable,
  value,
})

export const assetHandlers = [
  // Thư mục gốc (folderId=0) của màn tài sản; id không phải số (vd. folder-tree) thì để handler khác xử lý
  http.get(api(apiUrls.folder.details(':id')), ({ params }) => {
    if (!/^\d+$/.test(String(params.id))) return undefined
    return HttpResponse.json({
      folder: {
        id: Number(params.id) || 0,
        name: 'Tất cả tài sản',
        description: '',
        index: 0,
        level: 0,
        pathCode: '0',
        parentId: null,
        parentName: null,
        folderStyle: null,
        createdAt: isoAgo(30),
        modifiedAt: isoAgo(30),
        filters: [],
      },
      parentFolders: [],
      folderStyles: [],
      fields: [],
      operators: [],
    })
  }),

  http.get(api(apiUrls.asset.list), ({ request }) => {
    const url = new URL(request.url)
    const term = (url.searchParams.get('searchTerm') ?? '').trim().toLowerCase()
    const items = mockAssets.filter((a) => !term || `${a.name} ${a.code}`.toLowerCase().includes(term))
    return HttpResponse.json({ assets: items.map((a) => ({ ...base(a), fields: listFields(a) })), totalCount: items.length })
  }),

  http.get(api(apiUrls.asset.details(':id')), ({ params }) => {
    const a = mockAssets.find((x) => x.id === Number(params.id))
    if (!a) return notFound()
    return HttpResponse.json({
      asset: {
        ...base(a),
        workflowItem: {
          id: a.id + 1000,
          histories: [
            { id: 1, status: 'Mới tạo', color: '#64748b', assignedBy: a.author, assignedTo: a.author, action: 'Khởi tạo', actionTime: isoAgo(a.days), deadline: null, comment: '' },
          ],
          actions: [{ id: '2', name: 'Gửi duyệt', color: '#2563eb', requireUpload: false }],
        },
      },
      panels: [
        {
          id: 1,
          panelName: 'Thông tin chung',
          description: null,
          visibilityRules: null,
          fields: [
            detailField(1, 'ID', 'Mã', 'singleline', a.code, false),
            detailField(7, 'Name', 'Tên thiết kế', 'singleline', a.name),
            detailField(6, 'Description', 'Mô tả', 'multiline', a.description),
          ],
        },
      ],
    })
  }),
]
