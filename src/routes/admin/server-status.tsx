import { createFileRoute } from '@tanstack/react-router'
import { ServerStatusView } from '@/features/admin/server-status'

export const Route = createFileRoute('/admin/server-status')({
  component: ServerStatusView,
})
