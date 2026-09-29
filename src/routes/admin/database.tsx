import { createFileRoute } from '@tanstack/react-router'
import { DatabaseView } from '@/features/admin/database'

export const Route = createFileRoute('/admin/database')({
  component: DatabaseView,
})
