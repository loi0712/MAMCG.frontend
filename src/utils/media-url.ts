import { env } from '@/config/env'
import { useAuthStore } from '@/stores/auth-store'

/**
 * URL tới file trong /storage của API. Thẻ <img>/<video> không gửi được header Authorization
 * nên đính token qua ?access_token= (backend chỉ nhận tham số này cho /storage).
 */
export function mediaUrl(path?: string | null, extraQuery?: Record<string, string | number | undefined>): string {
  if (!path) return ''
  if (/^(https?:|data:|blob:)/i.test(path)) return path
  const url = new URL(`${env.apiUrl ?? ''}${path}`, window.location.origin)
  Object.entries(extraQuery ?? {}).forEach(([k, v]) => {
    if (v !== undefined && v !== '') url.searchParams.set(k, String(v))
  })
  const token = useAuthStore.getState().auth.accessToken
  if (token) url.searchParams.set('access_token', token)
  return env.apiUrl ? url.toString() : `${url.pathname}${url.search}`
}
