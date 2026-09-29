import { create } from 'zustand'
import { getCookie, setCookie, removeCookie } from '@/shared/lib/cookies'
import { type AuthUser } from '@/features/auth/types/auth'

const ACCESS_TOKEN = 'mamcg_access_token'
const USER_INFO = 'mamcg_user'

// Đọc JSON từ cookie; cookie hỏng thì coi như chưa có
function readJsonCookie<T>(name: string): T | null {
  const raw = getCookie(name)
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    removeCookie(name)
    return null
  }
}

// JWT đã hết hạn (theo claim exp) thì không dùng lại
export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    return typeof payload.exp === 'number' && payload.exp * 1000 <= Date.now()
  } catch {
    return false
  }
}

interface AuthState {
  auth: {
    user: AuthUser | null
    setUser: (user: AuthUser | null) => void
    accessToken: string
    setAccessToken: (accessToken: string) => void
    isAuthenticated: boolean
    resetAccessToken: () => void
    reset: () => void
  }
}

export const useAuthStore = create<AuthState>()((set) => {
  // Restore token + user từ cookie, bỏ qua token đã hết hạn
  let initToken = readJsonCookie<string>(ACCESS_TOKEN) ?? ''
  let initUser = readJsonCookie<AuthUser>(USER_INFO)
  if (initToken && isTokenExpired(initToken)) {
    removeCookie(ACCESS_TOKEN)
    removeCookie(USER_INFO)
    initToken = ''
    initUser = null
  }
  
  return {
    auth: {
      user: initUser,
      accessToken: initToken,
      isAuthenticated: !!(initToken && initUser), // Cả 2 phải có
      
      setUser: (user) =>
        set((state) => {
          // Lưu user vào cookie/localStorage
          if (user) {
            setCookie(USER_INFO, JSON.stringify(user))
          } else {
            removeCookie(USER_INFO)
          }
          
          return { 
            ...state, 
            auth: { 
              ...state.auth, 
              user,
              isAuthenticated: !!(user && state.auth.accessToken)
            } 
          }
        }),
        
      setAccessToken: (accessToken) =>
        set((state) => {
          // Lưu token vào cookie
          if (accessToken) {
            setCookie(ACCESS_TOKEN, JSON.stringify(accessToken))
          } else {
            removeCookie(ACCESS_TOKEN)
          }
          
          return { 
            ...state, 
            auth: { 
              ...state.auth, 
              accessToken,
              isAuthenticated: !!(accessToken && state.auth.user)
            } 
          }
        }),
        
      resetAccessToken: () =>
        set((state) => {
          removeCookie(ACCESS_TOKEN)
          return { 
            ...state, 
            auth: { 
              ...state.auth, 
              accessToken: '',
              isAuthenticated: false
            } 
          }
        }),
        
      reset: () =>
        set((state) => {
          removeCookie(ACCESS_TOKEN)
          removeCookie(USER_INFO)
          return {
            ...state,
            auth: { 
              ...state.auth, 
              user: null, 
              accessToken: '',
              isAuthenticated: false
            },
          }
        }),
    },
  }
})
