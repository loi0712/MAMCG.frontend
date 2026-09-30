import type { MyTaskStatusCount } from './api/tasks'

export const formatDateTime = (value?: string | null) => (value ? new Date(value).toLocaleString('vi-VN') : '')

// Các quy trình khác nhau có thể trùng tên trạng thái: thêm tên quy trình để phân biệt
export const statusLabel = (s: MyTaskStatusCount, duplicateNames: Set<string>) =>
  duplicateNames.has(s.statusName) && s.workflowName ? `${s.statusName} · ${s.workflowName}` : s.statusName
