import { createFileRoute } from '@tanstack/react-router'
import { SettingsView } from '@/features/admin/settings'

export const Route = createFileRoute('/admin/settings')({
  component: SettingsView,
})
