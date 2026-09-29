import { http, HttpResponse } from 'msw'
import { apiUrls } from '@/api/config/endpoints'
import { users } from '../db'
import { api } from './utils'

// JWT không ký, đủ để frontend đọc claim exp (hết hạn sau 8 giờ)
const fakeToken = (sub: string) => {
  const b64 = (o: object) => btoa(JSON.stringify(o)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_')
  const exp = Math.floor(Date.now() / 1000) + 8 * 60 * 60
  return `${b64({ alg: 'none', typ: 'JWT' })}.${b64({ sub, exp })}.mock`
}

export const authHandlers = [
  // Mọi mật khẩu đều hợp lệ, trừ "wrong" để thử luồng đăng nhập sai
  http.post(api(apiUrls.auth.login), async ({ request }) => {
    const body = (await request.json()) as { userName?: string; username?: string; password?: string }
    const username = body.userName ?? body.username ?? ''
    if (!username || !body.password || body.password === 'wrong') {
      return HttpResponse.json({ error: 'Invalid username or password' }, { status: 400 })
    }
    const user = users.find((u) => u.username === username) ?? users[0]
    return HttpResponse.json({ user: { ...user, password: null }, token: fakeToken(user.id) })
  }),
]
