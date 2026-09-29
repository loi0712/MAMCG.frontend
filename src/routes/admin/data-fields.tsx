import { createFileRoute } from '@tanstack/react-router'
import { DataFieldsView } from '@/features/admin/data-fields'

export const Route = createFileRoute('/admin/data-fields')({
  component: DataFieldsView,
})
