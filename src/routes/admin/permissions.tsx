import { createFileRoute } from '@tanstack/react-router'
import { PermissionsView } from '@/features/admin/permissions'

export const Route = createFileRoute('/admin/permissions')({
  component: PermissionsView,
})
