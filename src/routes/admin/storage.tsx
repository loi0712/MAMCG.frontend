import { createFileRoute } from '@tanstack/react-router'
import { StorageView } from '@/features/admin/storage'

export const Route = createFileRoute('/admin/storage')({
  component: StorageView,
})
