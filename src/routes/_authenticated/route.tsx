import { createFileRoute, redirect } from '@tanstack/react-router'
import { AuthenticatedLayout } from '@/components/layout/Authenticated-layout'
import { useAuthStore } from '@/stores/auth-store'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location }) => {
    const { auth } = useAuthStore.getState()
    
    // Check nếu chưa authenticate
    if (!auth.user || !auth.accessToken) {
      // Redirect đến login với current URL
      throw redirect({
        to: '/sign-in',
        search: {
          redirect: location.href,
        },
      })
    }

    if (location.pathname === '/_authenticated' || location.pathname === '/_authenticated/') {
      throw redirect({
        to: '/assets',
        search: {
          folderId: '0',
          page: 1,
          pageSize: 10
        },
      })
    }
  },
  component: AuthenticatedLayout,
})
