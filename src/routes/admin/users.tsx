import { createFileRoute } from '@tanstack/react-router'
import { UsersView } from '@/features/admin/users'

export const Route = createFileRoute('/admin/users')({
  component: UsersView,
})
