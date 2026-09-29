import { type QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { Toaster } from '@/components/ui/sonner'
import { GeneralError } from '@/features/errors/general-error'
import { NotFoundError } from '@/features/errors/not-found-error'
import { useEffect } from 'react'
import { NavigationProgress } from '@/components/navigation-progress'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  component: RootComponent,
  notFoundComponent: NotFoundError,
  errorComponent: GeneralError,
})

function RootComponent() {

  useEffect(() => {
    document.title = 'MAM CG'
  }, [])
  return (
    <>
      <NavigationProgress />
      <Outlet />
      <Toaster duration={5000} />
      
      {/* Development Tools - Chỉ render khi DEV mode */}
      {import.meta.env.DEV && (
        <>
          <ReactQueryDevtools 
            buttonPosition='bottom-left'
            initialIsOpen={false}
          />
          <TanStackRouterDevtools 
            position='bottom-right'
            initialIsOpen={false}
          />
        </>
      )}
    </>
  )
}
