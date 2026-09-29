import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    throw redirect({
      to: '/assets',
      search: { folderId: '0', page: 1, pageSize: 10 },
    })
  },
})
