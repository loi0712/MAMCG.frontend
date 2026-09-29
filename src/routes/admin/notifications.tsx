import { createFileRoute } from '@tanstack/react-router'
import { NotificationsView } from '@/features/admin/notifications'

export const Route = createFileRoute('/admin/notifications')({
  component: NotificationsView,
})
