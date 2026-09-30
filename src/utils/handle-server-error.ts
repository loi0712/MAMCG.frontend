import { AxiosError } from 'axios'
import { toast } from 'sonner'

const GENERIC_TITLES =
  /^(Bad Request|Not Found|Conflict|Forbidden|Unauthorized|Too Many Requests|Internal Server Error|Service Unavailable|One or more validation errors occurred\.)$/

type ErrorBody = {
  title?: unknown
  error?: unknown
  message?: unknown
  errors?: unknown
}

/** Lấy thông báo lỗi dễ hiểu từ phản hồi của API (ProblemDetails, {error}, {message}, lỗi validate). */
export function getServerErrorMessage(error: unknown, fallback = 'Đã xảy ra lỗi, vui lòng thử lại'): string {
  if (error && typeof error === 'object' && 'status' in error && Number(error.status) === 204) {
    return 'Không có dữ liệu'
  }
  if (!(error instanceof AxiosError)) return fallback
  if (!error.response) return 'Không kết nối được máy chủ'

  const status = error.response.status
  const data = (typeof error.response.data === 'object' ? error.response.data : undefined) as ErrorBody | undefined
  const text = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : undefined)

  const specific = text(data?.error) ?? text(data?.message) ?? (typeof data?.title === 'string' && !GENERIC_TITLES.test(data.title) ? data.title : undefined)
  if (specific) return specific

  if (data?.errors && typeof data.errors === 'object') {
    const first = Object.values(data.errors as Record<string, unknown>).flat().find((m) => typeof m === 'string')
    if (typeof first === 'string') return first
  }

  switch (status) {
    case 400: return 'Dữ liệu không hợp lệ'
    case 403: return 'Bạn không có quyền thực hiện thao tác này'
    case 404: return 'Không tìm thấy dữ liệu'
    case 409: return 'Dữ liệu bị trùng hoặc đang được sử dụng'
    case 413: return 'Tệp quá lớn'
    case 429: return 'Thao tác quá nhiều lần, vui lòng thử lại sau'
    case 503: return 'Dịch vụ tạm thời không sẵn sàng'
    default: return status >= 500 ? 'Lỗi máy chủ, vui lòng thử lại sau' : fallback
  }
}

export function handleServerError(error: unknown) {
  if (import.meta.env.DEV) console.error(error)
  toast.error(getServerErrorMessage(error))
}
