import { AxiosError } from 'axios'
import { QueryCache, QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { handleServerError } from '@/utils/handle-server-error'
import { useAuthStore } from '@/stores/auth-store'

/**
 * Create QueryClient với global error handling
 * Router instance sẽ được import trực tiếp
 */
export function createQueryClientInstance() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error) => {
          if (import.meta.env.DEV) {
            console.log('[Query Error]', { failureCount, error })
          }

          // Dev: không retry
          if (failureCount >= 0 && import.meta.env.DEV) return false

          // Prod: retry tối đa 3 lần
          if (failureCount > 3 && import.meta.env.PROD) return false

          // Không retry với 401/403
          return !(
            error instanceof AxiosError &&
            [401, 403].includes(error.response?.status ?? 0)
          )
        },
        refetchOnWindowFocus: import.meta.env.PROD,
        staleTime: 10 * 1000,
      },
      mutations: {
        onError: (error) => {
          handleServerError(error)

          if (error instanceof AxiosError) {
            if (error.response?.status === 304) {
              toast.error('Nội dung không được sửa đổi!')
            }
          }
        },
      },
    },
    queryCache: new QueryCache({
      onError: async (error) => {
        if (error instanceof AxiosError) {
          // Handle 401 - Session expired
          if (error.response?.status === 401) {
            toast.error('Phiên đăng nhập đã hết hạn!')
            useAuthStore.getState().auth.reset()

            // Import router dynamically để tránh circular dependency
            const { router } = await import('@/main')
            
            const currentPath = window.location.pathname + window.location.search
            
            router.navigate({
              to: '/sign-in',
              search: { redirect: currentPath },
            })
          }

          // Handle 500 - Server error
          if (error.response?.status === 500) {
            toast.error('Lỗi máy chủ nội bộ!')

            const { router } = await import('@/main')
            router.navigate({ to: '/500' })
          }
        }
      },
    }),
  })
}
