import { createFileRoute } from '@tanstack/react-router'
import { DashboardView } from '@/features/admin/dashboard'

export const Route = createFileRoute('/admin/dashboard')({
  component: DashboardView,
})
