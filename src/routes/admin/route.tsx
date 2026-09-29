import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/features/auth/require-auth'
import { AdminLayout } from '@/features/admin/components/admin-layout'

export const Route = createFileRoute('/admin')({
  beforeLoad: ({ location }) => requireAuth(location),
  component: AdminLayout,
})
