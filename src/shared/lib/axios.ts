import Axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { toast } from 'sonner'

import { env } from '@/config/env'
import { apiUrls } from '@/api/config/endpoints'
import { useAuthStore } from '@/stores/auth-store'

export const axios = Axios.create({
  baseURL: env.apiUrl,
})

const onRequestSuccess = (config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().auth.accessToken

  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`)
  }

  config.headers.set('Accept', 'application/json')

  return config
}

axios.interceptors.request.use(onRequestSuccess, (error) => Promise.reject(error))

// Nhiều request có thể cùng trả 401: chỉ xử lý đăng xuất một lần
let isHandlingUnauthorized = false

async function handleUnauthorized() {
  if (isHandlingUnauthorized) return
  isHandlingUnauthorized = true

  try {
    useAuthStore.getState().auth.reset()
    toast.error('Phiên đăng nhập đã hết hạn!')

    // Import động để tránh vòng phụ thuộc với main.tsx
    const { router } = await import('@/main')
    const currentPath = window.location.pathname + window.location.search
    if (window.location.pathname !== '/sign-in') {
      await router.navigate({ to: '/sign-in', search: { redirect: currentPath } })
    }
  } finally {
    isHandlingUnauthorized = false
  }
}

// 401 cho mọi request (query lẫn mutation), trừ chính request đăng nhập
axios.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const isLoginRequest = error.config?.url === apiUrls.auth.login
    if (error.response?.status === 401 && !isLoginRequest) {
      void handleUnauthorized()
    }
    return Promise.reject(error)
  }
)
