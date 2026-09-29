import { createFileRoute } from '@tanstack/react-router'
import { DisplayPanelsView } from '@/features/admin/display-panels'

export const Route = createFileRoute('/admin/display-panels')({
  component: DisplayPanelsView,
})
