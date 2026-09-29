import { AxiosError } from 'axios'
import { toast } from 'sonner'

export function handleServerError(error: unknown) {
   
  if (import.meta.env.DEV) console.error(error)

  let errMsg = 'Đã xảy ra lỗi, vui lòng thử lại'

  if (
    error &&
    typeof error === 'object' &&
    'status' in error &&
    Number(error.status) === 204
  ) {
    errMsg = 'Không có dữ liệu'
  }

  if (error instanceof AxiosError) {
    const status = error.response?.status
    const title = (error.response?.data as { title?: string } | undefined)?.title
    if (status === 403) errMsg = 'Bạn không có quyền thực hiện thao tác này'
    else if (title && !/^(Bad Request|Not Found|Conflict|Forbidden|Internal Server Error)$/.test(title)) errMsg = title
    else if (status === 404) errMsg = 'Không tìm thấy dữ liệu'
    else if (status === 409) errMsg = 'Dữ liệu bị trùng hoặc đang được sử dụng'
    else if (status === 400) errMsg = 'Dữ liệu không hợp lệ'
    else if (!error.response) errMsg = 'Không kết nối được máy chủ'
  }

  toast.error(errMsg)
}
