import { createFileRoute } from '@tanstack/react-router'
import { RoleGroupsView } from '@/features/admin/roles'

export const Route = createFileRoute('/admin/roles')({
  component: RoleGroupsView,
})
