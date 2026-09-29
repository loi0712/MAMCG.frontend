import { HttpResponse } from 'msw'
import { env } from '@/config/env'

// URL đầy đủ tới backend, giống cách axios ghép baseURL + apiUrls
export const api = (path: string) => `${env.apiUrl}${path}`

// Phân trang + tìm kiếm như các endpoint /paged của backend
export function paginate<T>(items: T[], url: URL, text: (item: T) => string) {
  const pageNumber = Number(url.searchParams.get('pageNumber') ?? 1)
  const pageSize = Number(url.searchParams.get('pageSize') ?? 20)
  const term = (url.searchParams.get('searchTerm') ?? '').trim().toLowerCase()
  const filtered = term ? items.filter((i) => text(i).toLowerCase().includes(term)) : items
  const start = (pageNumber - 1) * pageSize
  return { page: filtered.slice(start, start + pageSize), totalCount: filtered.length }
}

export const notFound = () => new HttpResponse(null, { status: 404 })

export const splitIds = (ids: string | null | undefined) =>
  (ids ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
