
// main.tsx
import { StrictMode } from 'react'

import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createRouter } from '@tanstack/react-router'

// Providers
import { DirectionProvider } from '@/context/Direction-provider'
import { FontProvider } from '@/context/Font-provider'
import { ThemeProvider } from '@/context/Theme-provider'

// Query Client
import { createQueryClientInstance } from '@/lib/query-client'

// Generated Routes
import { routeTree } from '@/routeTree.gen'

// Styles
import '@/styles/index.css'


// ============================================================================
// Create Router Instance & Export nó
// ============================================================================
export const router = createRouter({
  routeTree,
  context: {
    queryClient: undefined!,
  },
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
})

// ============================================================================
// Type Safety - Register Router
// ============================================================================
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// ============================================================================
// Initialize QueryClient KHÔNG cần truyền router
// ============================================================================
const queryClient = createQueryClientInstance()

// Update router context
router.update({
  context: {
    queryClient,
  },
})

// ============================================================================
// Render Application
// ============================================================================
const rootElement = document.getElementById('root')!

// API giả lập (MSW) khi dev không có backend: VITE_ENABLE_MOCKS=true
async function enableMocking() {
  if (!import.meta.env.DEV || import.meta.env.VITE_ENABLE_MOCKS !== 'true') return
  const { worker } = await import('@/mocks/browser')
  await worker.start({ onUnhandledRequest: 'bypass' })
}

if (!rootElement.innerHTML) {
  await enableMocking()
  const root = createRoot(rootElement)
  
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <FontProvider>
            <DirectionProvider>
              <RouterProvider router={router} />
            </DirectionProvider>
          </FontProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </StrictMode>
  )
}
