import { createFileRoute } from '@tanstack/react-router'
import { CGSceneCreatePage } from '@/features/cg-scene/components/cg-scene-create'

export const Route = createFileRoute('/_authenticated/cg-scenes/create')({
  component: CGSceneCreatePage,
})
