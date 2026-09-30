import { createFileRoute } from '@tanstack/react-router'
import { CGSceneDetailPage } from '@/features/cg-scene/components/cg-scene-details'

type CGSceneDetailsSearch = {
  id: string
}

export const Route = createFileRoute('/_authenticated/cg-scenes/details')({
  validateSearch: (search: Record<string, unknown>): CGSceneDetailsSearch => ({
    id: String(search.id ?? ''),
  }),
  component: CGSceneDetailsRoute,
})

function CGSceneDetailsRoute() {
  const { id } = Route.useSearch()
  return <CGSceneDetailPage key={id} id={Number.parseInt(id) || 0} />
}
