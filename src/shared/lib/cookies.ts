/**
 * Cookie utility functions using manual document.cookie approach
 * Replaces js-cookie dependency for better consistency
 */

const DEFAULT_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

/**
 * Get a cookie value by name
 */
export function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined

  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(';').shift()
    if (cookieValue === undefined) return undefined
    try {
      return decodeURIComponent(cookieValue)
    } catch {
      return cookieValue
    }
  }
  return undefined
}

/**
 * Set a cookie with name, value, and optional max age
 */
export function setCookie(
  name: string,
  value: string,
  maxAge: number = DEFAULT_MAX_AGE,
  sameSite: 'Lax' | 'Strict' = 'Lax'
): void {
  if (typeof document === 'undefined') return

  document.cookie = `${name}=${encodeURIComponent(value)}; ${cookieAttributes(maxAge, sameSite)}`
}

/**
 * Remove a cookie by setting its max age to 0
 */
export function removeCookie(name: string): void {
  if (typeof document === 'undefined') return

  document.cookie = `${name}=; ${cookieAttributes(0)}`
}

// SameSite=Lax chặn gửi cookie trong request cross-site; Secure khi chạy HTTPS
function cookieAttributes(maxAge: number, sameSite: 'Lax' | 'Strict' = 'Lax'): string {
  const secure = window.location.protocol === 'https:' ? '; Secure' : ''
  return `path=/; max-age=${maxAge}; SameSite=${sameSite}${secure}`
}
