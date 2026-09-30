import { createFileRoute } from '@tanstack/react-router'
import { TasksPage } from '@/features/tasks'

// Bộ lọc "Công việc của tôi" giữ trên URL để menu "Công việc" và F5 mở đúng danh sách
export type TasksSearchParams = {
  statusId?: number
  overdue?: boolean
  search?: string
  page?: number
}

export const Route = createFileRoute('/_authenticated/tasks')({
  validateSearch: (search: Record<string, unknown>): TasksSearchParams => {
    const statusId = Number(search.statusId)
    const page = Number(search.page)
    const overdue = search.overdue === true || search.overdue === 'true' ? true : search.overdue === false || search.overdue === 'false' ? false : undefined
    return {
      statusId: Number.isInteger(statusId) && statusId > 0 ? statusId : undefined,
      overdue,
      search: typeof search.search === 'string' && search.search.trim() ? search.search : undefined,
      page: Number.isInteger(page) && page > 1 ? page : undefined,
    }
  },
  component: TasksPage,
})
