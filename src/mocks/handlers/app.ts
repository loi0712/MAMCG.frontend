import { http, HttpResponse } from 'msw'
import { apiUrls } from '@/api/config/endpoints'
import { api } from './utils'

// Phản hồi rỗng cho các màn hình người dùng, để app chạy được khi không có backend
export const appHandlers = [
  http.get(api(apiUrls.folder.list), () => HttpResponse.json([])),
  http.get(api(apiUrls.asset.list), () => HttpResponse.json({ assets: [], totalCount: 0 })),
  http.get(api(apiUrls.category.list), () => HttpResponse.json({ data: [], totalCount: 0 })),
  http.get(api(apiUrls.category.details(':id' as unknown as number)), () =>
    HttpResponse.json({ category: null, categoryGroups: [] })
  ),
]
