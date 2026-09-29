import { createFileRoute } from '@tanstack/react-router'
import { LogsView } from '@/features/admin/logs'

export const Route = createFileRoute('/admin/logs')({
  component: LogsView,
})
