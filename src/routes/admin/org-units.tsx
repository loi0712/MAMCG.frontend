import { createFileRoute } from '@tanstack/react-router'
import { OrgUnitsView } from '@/features/admin/org-units'

export const Route = createFileRoute('/admin/org-units')({
  component: OrgUnitsView,
})
