import { AxiosError, type AxiosRequestConfig } from 'axios'
import { axios } from '@/shared/lib/axios'

// ===========================================
// TẢI FILE (blob) TỪ API
// ===========================================

/** Lưu blob thành file trên máy người dùng. */
export const saveBlob = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    link.remove()
    // Trì hoãn thu hồi để trình duyệt kịp bắt đầu tải
    setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/**
 * Lỗi của request responseType=blob có body là Blob → đọc lại thành JSON để
 * getServerErrorMessage/handleServerError hiển thị đúng thông báo từ máy chủ.
 */
const parseBlobError = async (error: unknown) => {
    if (error instanceof AxiosError && error.response?.data instanceof Blob) {
        try {
            const text = await error.response.data.text()
            error.response.data = text ? JSON.parse(text) : undefined
        } catch {
            error.response.data = undefined
        }
    }
    return error
}

/** Gọi API trả file rồi lưu về máy; lỗi được ném lại (đã chuyển body về JSON). */
export const downloadFile = async (config: AxiosRequestConfig, fileName: string) => {
    try {
        const response = await axios.request<Blob>({ ...config, responseType: 'blob' })
        saveBlob(response.data, fileName)
        return response.data
    } catch (error) {
        throw await parseBlobError(error)
    }
}

/** Dấu thời gian cho tên file tải về, vd. 20260930_1405. */
export const fileTimestamp = (date = new Date()) => {
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}_${pad(date.getHours())}${pad(date.getMinutes())}`
}
