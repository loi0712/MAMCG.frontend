// routes/_authenticated/assets.tsx
import { Assets } from '@/features/asset'
import { createFileRoute } from '@tanstack/react-router'

export type AssetsSearchParams = {
  page?: number
  pageSize?: number
  folderId?: string
  status?: string[]
  category?: string[]
  name?: string
  type?: string[]
  approved?: string[]
  searchTerm?: string
}

export const Route = createFileRoute('/_authenticated/assets/')({
  validateSearch: (search: Record<string, unknown>): AssetsSearchParams => {
    // Handle both string and number for folderId
    let folderId: string = '0'
    if (search.folderId) {
      // Remove quotes if they exist and convert to string
      const rawFolderId = String(search.folderId)
      folderId = rawFolderId.replace(/^"|"$/g, '')
    }
    
    return {
      page: search.page ? Number(search.page) : undefined,
      pageSize: search.pageSize ? Number(search.pageSize) : undefined,
      folderId,
      status: Array.isArray(search.status) ? search.status : undefined,
      category: Array.isArray(search.category) ? search.category : undefined,
      name: search.name as string,
      type: Array.isArray(search.type) ? search.type : undefined,
      approved: Array.isArray(search.approved) ? search.approved : undefined,
      searchTerm: typeof search.searchTerm === 'string' ? (search.searchTerm as string) : undefined,
    }
  },
  component: Assets,
})
