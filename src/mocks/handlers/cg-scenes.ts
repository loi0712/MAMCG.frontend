import { http, HttpResponse } from 'msw'
import { apiUrls } from '@/api/config/endpoints'
import { api } from './utils'
import { mockAssets } from './assets'

/**
 * CG template/scene giả. Giống backend: tên scene phải là segment an toàn; cần ít nhất 1 thiết kế
 * được gán (mã scene = CG_ + mã thiết kế đầu tiên); duyệt theo hành động của workflow item.
 */

const templates = [
  {
    id: 1,
    name: 'Lower third 2 dòng',
    jsonContent: {
      SceneName: 'LowerThird2',
      FolderPath: 'D:\\Templates\\LowerThird2',
      ScenePath: 'D:\\Templates\\LowerThird2\\LowerThird2.t2s',
      PreviewPath: '',
      Background: 'BanTin',
      Variables: {
        Logo: { DisplayName: 'Logo chương trình', IsRequiredAsset: true, Value: '', W: 200, H: 200, X: 40, Y: 860, Color: null },
        Line1: { DisplayName: 'Dòng 1', IsRequiredAsset: false, Value: 'Tiêu đề', W: 1200, H: 60, X: 260, Y: 870, Color: '[255,255,255]' },
        Line2: { DisplayName: 'Dòng 2', IsRequiredAsset: false, Value: 'Phụ đề', W: 1200, H: 40, X: 260, Y: 940, Color: '[200,200,200]' },
      },
    },
  },
  {
    id: 2,
    name: 'Bảng tỉ số thể thao',
    jsonContent: {
      SceneName: 'ScoreBoard',
      FolderPath: 'D:\\Templates\\ScoreBoard',
      ScenePath: 'D:\\Templates\\ScoreBoard\\ScoreBoard.t2s',
      PreviewPath: '',
      Background: 'Black',
      Variables: {
        HomeLogo: { DisplayName: 'Logo đội nhà', IsRequiredAsset: true, Value: '', W: 120, H: 120, X: 60, Y: 40, Color: null },
        AwayLogo: { DisplayName: 'Logo đội khách', IsRequiredAsset: true, Value: '', W: 120, H: 120, X: 460, Y: 40, Color: null },
        Score: { DisplayName: 'Tỉ số', IsRequiredAsset: false, Value: '0 - 0', W: 200, H: 80, X: 220, Y: 60, Color: null },
      },
    },
  },
]

type SceneVariable = { displayName?: string | null; isRequiredAsset?: boolean; assetId?: number | null; value?: string | null }
type Scene = {
  id: number
  code: string
  workflowItemId: number
  status: '3' | '6' | '2'
  createdAt: string
  content: { sceneName: string; folderPath: string; scenePath: string; previewPath: string; background?: string | null; variables: Record<string, SceneVariable> }
  histories: { id: number; status: string; color: string; assignedBy: string; assignedTo: string; action: string; actionTime: string; deadline: null; comment: string }[]
}

const STATUS: Record<string, { name: string; color: string }> = {
  '2': { name: 'Thiết kế đồ hoạ', color: '#3b82f6' },
  '3': { name: 'Duyệt cấp 1', color: '#f59e0b' },
  '6': { name: 'Duyệt trung tâm', color: '#22c55e' },
}
const ACTIONS: Record<string, { id: string; name: string; color: string; requireUpload: boolean; to: '2' | '3' | '6' }[]> = {
  '2': [{ id: '10', name: 'Gửi duyệt', color: '#3b82f6', requireUpload: false, to: '3' }],
  '3': [
    { id: '11', name: 'Duyệt', color: '#22c55e', requireUpload: false, to: '6' },
    { id: '12', name: 'Trả lại', color: '#ef4444', requireUpload: false, to: '2' },
  ],
  '6': [],
}

const now = () => new Date().toLocaleString('vi-VN')
const scenes: Scene[] = [
  {
    id: 1,
    code: 'CG_TT09260006',
    workflowItemId: 501,
    status: '3',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    content: {
      sceneName: 'LowerThird2',
      folderPath: 'D:\\Templates\\LowerThird2',
      scenePath: 'D:\\Templates\\LowerThird2\\LowerThird2.t2s',
      previewPath: '',
      background: 'BanTin',
      variables: {
        Logo: { displayName: 'Logo chương trình', isRequiredAsset: true, assetId: 6, value: '\\\\obj\\\\logo\\\\logo.png' },
        Line1: { displayName: 'Dòng 1', value: 'Bản tin tối' },
        Line2: { displayName: 'Dòng 2', value: 'Phát sóng 19h' },
      },
    },
    histories: [
      { id: 1, status: 'Duyệt cấp 1', color: '#f59e0b', assignedBy: 'Quản trị hệ thống', assignedTo: 'Nguyễn Văn An', action: 'Tạo mới', actionTime: now(), deadline: null, comment: '' },
    ],
  },
]
let nextSceneId = 2

const problem = (status: number, title: string) => HttpResponse.json({ status, title }, { status })
const SEGMENT = /^[A-Za-z0-9._-]{1,100}$/

const listDto = (s: Scene) => ({
  id: s.id,
  workflowItemId: s.workflowItemId,
  code: s.code,
  createdAt: s.createdAt,
  fields: [
    { id: 1, fieldName: 'ID', dataType: 'singleline', displayName: 'Mã', value: s.code, color: null },
    { id: 4, fieldName: 'Status', dataType: 'workflowstatus', displayName: 'Trạng thái', value: STATUS[s.status].name, color: STATUS[s.status].color },
    { id: 6, fieldName: 'AssignedTo', dataType: 'user', displayName: 'Người xử lý', value: 'Nguyễn Văn An', color: null },
    { id: 7, fieldName: 'Title', dataType: 'singleline', displayName: 'Tiêu đề', value: s.content.variables.Line1?.value ?? s.content.sceneName, color: null },
  ],
})

const detailDto = (s: Scene) => ({
  success: true,
  message: null,
  id: s.id,
  code: s.code,
  workflowItem: {
    id: s.workflowItemId,
    histories: s.histories,
    actions: ACTIONS[s.status].map((a) => ({ id: a.id, name: a.name, color: a.color, requireUpload: a.requireUpload })),
  },
  fields: listDto(s).fields.map((f) => ({ fieldName: f.fieldName, displayName: f.displayName, value: f.value })),
  scenes: [s.content],
  backgrounds: [
    { name: 'BanTin', value: '/storage/previewcgs/background/bantin.png' },
    { name: 'Black', value: '/storage/previewcgs/background/black.png' },
  ],
})

export const cgSceneHandlers = [
  http.get(api(apiUrls.cgScene.templates), () => HttpResponse.json(templates)),

  http.get(api(apiUrls.cgScene.list), ({ request }) => {
    const url = new URL(request.url)
    const pageNumber = Math.max(1, Number(url.searchParams.get('pageNumber') ?? 1))
    const pageSize = Math.min(200, Math.max(1, Number(url.searchParams.get('pageSize') ?? 20)))
    const items = [...scenes].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    return HttpResponse.json({
      cgScenes: items.slice((pageNumber - 1) * pageSize, pageNumber * pageSize).map(listDto),
      totalCount: items.length,
    })
  }),

  http.get(api(apiUrls.cgScene.details(':id' as unknown as number)), ({ params }) => {
    const s = scenes.find((x) => x.id === Number(params.id))
    if (!s) return HttpResponse.json({ success: false, message: `Không tồn tại CGScene với ID: ${params.id}` })
    return HttpResponse.json(detailDto(s))
  }),

  http.post(api(apiUrls.cgScene.create), async ({ request }) => {
    const body = (await request.json()) as {
      cgTemplateId?: number
      jsonContent?: Scene['content']
    }
    const content = body.jsonContent
    const name = content?.sceneName ?? ''
    if (!SEGMENT.test(name) || name.includes('..'))
      return problem(400, "Giá trị 'SceneName' không hợp lệ (chỉ cho phép chữ, số, '.', '_', '-', tối đa 100 ký tự).")
    if (!templates.some((t) => t.id === body.cgTemplateId))
      return HttpResponse.json({ success: false, message: 'Không tìm thấy CGSceneTemplate' })
    const assetIds = Object.values(content?.variables ?? {})
      .map((v) => v.assetId)
      .filter((v): v is number => !!v)
      .sort((a, b) => a - b)
    if (assetIds.length === 0) return HttpResponse.json({ success: false, message: 'Không tìm thấy AssetId trong Variables' })
    const first = mockAssets.find((a) => a.id === assetIds[0] && !a.isDeleted)
    if (!first?.code) return HttpResponse.json({ success: false, message: `Không tìm thấy ID cho AssetId: ${assetIds[0]}` })
    const scene: Scene = {
      id: nextSceneId++,
      code: `CG_${first.code}`,
      workflowItemId: 500 + nextSceneId,
      status: '3',
      createdAt: new Date().toISOString(),
      content: { ...content!, variables: content!.variables ?? {} },
      histories: [
        { id: 1, status: 'Duyệt cấp 1', color: '#f59e0b', assignedBy: 'Quản trị hệ thống', assignedTo: 'Nguyễn Văn An', action: 'Tạo mới', actionTime: now(), deadline: null, comment: '' },
      ],
    }
    scenes.push(scene)
    return HttpResponse.json(detailDto(scene))
  }),

  http.put(api(apiUrls.cgScene.approval(':id' as unknown as number)), async ({ request, params }) => {
    const s = scenes.find((x) => x.id === Number(params.id))
    if (!s) return problem(404, `Không tìm thấy CG scene id ${params.id}.`)
    const body = (await request.json()) as { actionId?: number; comment?: string }
    const action = ACTIONS[s.status].find((a) => a.id === String(body.actionId))
    if (!action) return problem(409, 'Hành động không hợp lệ với trạng thái hiện tại.')
    s.status = action.to
    s.histories.push({
      id: s.histories.length + 1,
      status: STATUS[action.to].name,
      color: STATUS[action.to].color,
      assignedBy: 'Quản trị hệ thống',
      assignedTo: 'Nguyễn Văn An',
      action: action.name,
      actionTime: now(),
      deadline: null,
      comment: body.comment ?? '',
    })
    return HttpResponse.json({ success: true, message: null })
  }),
]
