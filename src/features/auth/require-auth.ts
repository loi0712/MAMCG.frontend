import { redirect, type ParsedLocation } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'

/**
 * Dùng trong `beforeLoad` của các route cần đăng nhập.
 * Chuyển hướng về /sign-in (kèm URL hiện tại) nếu chưa có user hoặc token.
 */
export function requireAuth(location: ParsedLocation) {
  const { auth } = useAuthStore.getState()

  if (!auth.user || !auth.accessToken) {
    throw redirect({
      to: '/sign-in',
      search: {
        redirect: location.href,
      },
    })
  }
}
