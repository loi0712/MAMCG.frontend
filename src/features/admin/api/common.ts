// ===========================================
// KIỂU DÙNG CHUNG CHO API QUẢN TRỊ
// ===========================================

export interface PagedParams {
  pageNumber?: number
  pageSize?: number
  searchTerm?: string
}

// Tham số query chuẩn cho các endpoint /paged của MAMCG.Backend
export const toPagedQuery = ({ pageNumber = 1, pageSize = 10, searchTerm }: PagedParams) => ({
  pageNumber,
  pageSize,
  ...(searchTerm ? { searchTerm } : {}),
})

// Dùng khi cần lấy toàn bộ danh sách để chọn (select, checkbox)
export const ALL_ITEMS: PagedParams = { pageNumber: 1, pageSize: 1000 }

// Chuỗi id phân tách bởi dấu phẩy, như backend yêu cầu (UserIds, FieldIds, PermissionIds)
export const joinIds = (ids: Array<string | number>) => ids.join(',')
