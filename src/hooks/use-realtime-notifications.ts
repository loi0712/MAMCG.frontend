import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr'
import { toast } from 'sonner'
import { apiUrls } from '@/api/config/endpoints'
import { env } from '@/config/env'
import { useAuthStore } from '@/stores/auth-store'

type NotificationEvent = {
  subject?: string | null
  message?: string | null
  url?: string | null
  severity?: string | null
}

// Tắt realtime: chế độ API giả lập (MSW không có hub) hoặc VITE_ENABLE_REALTIME=false.
// Khi tắt / không kết nối được, các query vẫn tự làm mới bằng polling như cũ.
export const isRealtimeEnabled = () =>
  !(import.meta.env.DEV && import.meta.env.VITE_ENABLE_MOCKS === 'true') && import.meta.env.VITE_ENABLE_REALTIME !== 'false'

// Thử kết nối lại khi mất hẳn kết nối (sau khi SignalR đã tự reconnect không được)
const RETRY_DELAYS = [5_000, 15_000, 30_000, 60_000]

/**
 * Kết nối hub /hubs/notifications sau khi đăng nhập. Nhận:
 * - "notification": làm mới hộp thư + số chưa đọc, hiện toast nhẹ
 * - "tasks-changed": làm mới "Công việc của tôi" và lịch sử nội dung
 */
export function useRealtimeNotifications() {
  const queryClient = useQueryClient()
  const token = useAuthStore((state) => state.auth.accessToken)

  useEffect(() => {
    if (!token || !isRealtimeEnabled()) return

    const connection = new HubConnectionBuilder()
      .withUrl(`${env.apiUrl}${apiUrls.realtime.notificationsHub}`, {
        // Luôn lấy token mới nhất; không gửi cookie (CORS cho phép mọi origin khi chưa cấu hình)
        accessTokenFactory: () => useAuthStore.getState().auth.accessToken,
        withCredentials: false,
      })
      .withAutomaticReconnect([0, 2_000, 5_000, 10_000, 30_000])
      .configureLogging(LogLevel.None)
      .build()

    connection.on('notification', (event?: NotificationEvent) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast(event?.subject || 'Thông báo mới', {
        description: event?.message ?? undefined,
        id: 'realtime-notification',
      })
    })

    connection.on('tasks-changed', () => {
      queryClient.invalidateQueries({ queryKey: ['my-tasks'] })
      queryClient.invalidateQueries({ queryKey: ['workflow-item'] })
    })

    let stopped = false
    let attempt = 0
    let timer: ReturnType<typeof setTimeout> | undefined

    const start = async () => {
      if (stopped) return
      try {
        await connection.start()
        attempt = 0
        // Có thể đã lỡ sự kiện trong lúc mất kết nối: làm mới một lần
        queryClient.invalidateQueries({ queryKey: ['notifications'] })
        queryClient.invalidateQueries({ queryKey: ['my-tasks'] })
      } catch {
        if (stopped) return
        timer = setTimeout(start, RETRY_DELAYS[Math.min(attempt++, RETRY_DELAYS.length - 1)])
      }
    }

    connection.onreconnected(() => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['my-tasks'] })
    })
    // Hết số lần tự reconnect: tiếp tục thử theo lịch chậm hơn
    connection.onclose(() => {
      if (!stopped && connection.state === HubConnectionState.Disconnected)
        timer = setTimeout(start, RETRY_DELAYS[Math.min(attempt++, RETRY_DELAYS.length - 1)])
    })

    void start()

    return () => {
      stopped = true
      if (timer) clearTimeout(timer)
      void connection.stop()
    }
  }, [token, queryClient])
}

/** Gắn một lần ở gốc ứng dụng. */
export function RealtimeBridge() {
  useRealtimeNotifications()
  return null
}
