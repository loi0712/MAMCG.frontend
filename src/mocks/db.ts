/**
 * Dữ liệu giả trong bộ nhớ cho MSW (chỉ dùng khi dev với VITE_ENABLE_MOCKS=true).
 * Hình dạng dữ liệu bám theo DTO của MAMCG.Backend; tải lại trang sẽ khôi phục dữ liệu gốc.
 */
import type { Department, Position } from '@/features/admin/api/lookups'
import type { User } from '@/features/admin/api/users'
import type { Group } from '@/features/admin/api/groups'
import type { Permission } from '@/features/admin/api/permissions'
import type { DataType, FieldDetail } from '@/features/admin/api/fields'

export const departments: Department[] = [
  { id: 1, name: 'Ban Thời sự', description: null },
  { id: 2, name: 'Ban Sản xuất', description: null },
  { id: 3, name: 'Phòng Kỹ thuật', description: null },
]

export const positions: Position[] = [
  { id: 1, name: 'Trưởng ban', description: null },
  { id: 2, name: 'Biên tập viên', description: null },
  { id: 3, name: 'Kỹ thuật viên', description: null },
]

const user = (
  id: string,
  username: string,
  fullName: string,
  departmentId: number,
  positionId: number,
  isActive = true
): User => ({
  id,
  username,
  fullName,
  email: `${username}@mamcg.local`,
  phoneNumber: null,
  gender: null,
  dateOfBirth: null,
  address: null,
  department: departments.find((d) => d.id === departmentId) ?? null,
  position: positions.find((p) => p.id === positionId) ?? null,
  imageUrl: null,
  isActive,
})

export const users: User[] = [
  user('u-1', 'admin', 'Quản trị hệ thống', 3, 3),
  user('u-2', 'an.nguyen', 'Nguyễn Văn An', 1, 1),
  user('u-3', 'binh.tran', 'Trần Thị Bình', 1, 2),
  user('u-4', 'cuong.le', 'Lê Văn Cường', 2, 2),
  user('u-5', 'dung.pham', 'Phạm Thị Dung', 2, 2, false),
]

const groupUser = (id: string) => {
  const u = users.find((x) => x.id === id)!
  return { id: u.id, fullName: u.fullName, email: u.email, isActive: u.isActive }
}

export const groups: Group[] = [
  { id: 1, name: 'Quản trị viên', description: 'Toàn quyền hệ thống', users: [groupUser('u-1')] },
  { id: 2, name: 'Biên tập', description: 'Tạo và sửa thiết kế', users: [groupUser('u-3'), groupUser('u-4')] },
  { id: 3, name: 'Duyệt nội dung', description: null, users: [groupUser('u-2')] },
]

export const permissionTree: Permission[] = [
  {
    id: 1,
    name: 'Quản lý thiết kế',
    description: null,
    childrens: [
      { id: 2, name: 'Xem', description: null, childrens: [] },
      { id: 3, name: 'Tạo mới', description: null, childrens: [] },
      { id: 4, name: 'Chỉnh sửa', description: null, childrens: [] },
      { id: 5, name: 'Xoá', description: null, childrens: [] },
    ],
  },
  {
    id: 6,
    name: 'Duyệt',
    description: null,
    childrens: [
      { id: 7, name: 'Duyệt cấp 1', description: null, childrens: [] },
      { id: 8, name: 'Duyệt cấp 2', description: null, childrens: [] },
    ],
  },
  {
    id: 9,
    name: 'Quản trị hệ thống',
    description: null,
    childrens: [
      { id: 10, name: 'Người dùng', description: null, childrens: [] },
      { id: 11, name: 'Phân quyền', description: null, childrens: [] },
    ],
  },
]

// Quyền đã gán, khoá theo `${targetType}:${targetId}`
export const aces = new Map<string, string>([
  ['GROUP:1', '1,2,3,4,5,6,7,8,9,10,11'],
  ['GROUP:2', '1,2,3,4'],
  ['USER:u-2', '6,7,8'],
])

export const dataTypes: DataType[] = [
  { id: 1, name: 'Text', datasource: null },
  { id: 2, name: 'Number', datasource: null },
  { id: 3, name: 'Date', datasource: null },
  { id: 4, name: 'Dropdown', datasource: null },
  { id: 5, name: 'Image', datasource: null },
]

const field = (
  id: number,
  fieldName: string,
  displayName: string,
  dataTypeId: number,
  isRequired = false
): FieldDetail => ({
  id,
  fieldName,
  displayName,
  dataType: dataTypes.find((d) => d.id === dataTypeId) ?? null,
  isRequired,
  editable: true,
  value: null,
})

export const fields: FieldDetail[] = [
  field(1, 'Name', 'Tên thiết kế', 1, true),
  field(2, 'Thumbnail', 'Ảnh đại diện', 5),
  field(3, 'Status', 'Trạng thái', 4, true),
  field(4, 'AssetType', 'Loại thiết kế', 4),
  field(5, 'CreatedDate', 'Ngày tạo', 3),
  field(6, 'Duration', 'Thời lượng (giây)', 2),
  field(7, 'Description', 'Mô tả', 1),
  field(8, 'CategoryGroup', 'Nhóm chuyên mục', 4),
  field(9, 'Category', 'Chuyên mục', 4),
]

export interface MockPanel {
  id: number
  panelName: string
  description: string | null
  visibilityRules: string | null
  index: number
  fieldIds: number[]
}

export const panels: MockPanel[] = [
  { id: 1, panelName: 'Thông tin chung', description: 'Hiển thị ở danh sách', visibilityRules: null, index: 1, fieldIds: [1, 2, 3] },
  { id: 2, panelName: 'Tạo thiết kế', description: 'Form tạo mới', visibilityRules: null, index: 2, fieldIds: [1, 4, 7, 8, 9] },
  { id: 3, panelName: 'Chi tiết', description: null, visibilityRules: null, index: 3, fieldIds: [1, 3, 5, 6, 7] },
]

let sequence = 1000
export const nextId = () => ++sequence
