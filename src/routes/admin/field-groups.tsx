import { createFileRoute } from '@tanstack/react-router'
import { FieldGroupsView } from '@/features/admin/field-groups'

export const Route = createFileRoute('/admin/field-groups')({
  component: FieldGroupsView,
})
