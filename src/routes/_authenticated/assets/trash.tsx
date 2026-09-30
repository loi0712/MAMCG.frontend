import { createFileRoute } from '@tanstack/react-router'
import { AssetTrashPage } from '@/features/asset/trash'

export const Route = createFileRoute('/_authenticated/assets/trash')({
  component: AssetTrashPage,
})
