import { createFileRoute } from '@tanstack/react-router'
import { CGSceneListPage } from '@/features/cg-scene/components/cg-scene-list'

export const Route = createFileRoute('/_authenticated/cg-scenes/')({
  component: CGSceneListPage,
})
