import { create } from 'zustand'
import { getCookie, setCookie, removeCookie } from '@/shared/lib/cookies'
import { AuthUser } from '@/features/auth/types/auth'

const ACCESS_TOKEN = 'thisisjustarandomstring'
const USER_INFO = 'user_info' // Thêm key cho user info

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
  // Restore token từ cookie
  const cookieState = getCookie(ACCESS_TOKEN)
  const initToken = cookieState ? JSON.parse(cookieState) : ''
  
  // Restore user từ cookie/localStorage
  const userState = getCookie(USER_INFO)
  const initUser = userState ? JSON.parse(userState) : null
  
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
