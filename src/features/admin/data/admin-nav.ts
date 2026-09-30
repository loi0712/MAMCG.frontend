import {
  Activity,
  Bell,
  Database,
  FileText,
  GitBranch,
  Grid3x3,
  HardDrive,
  LayoutDashboard,
  PanelLeft,
  Server,
  Settings,
  Shield,
  Users,
  Wrench,
  type LucideIcon,
} from 'lucide-react'

// ===========================================
// TYPES
// ===========================================

export type AdminNavItem = {
  title: string
  url: string
  icon: LucideIcon
  pageTitle: string
  pageSubtitle?: string
  // Đã nối API thật của MAMCG.Backend; false = đang hiển thị dữ liệu minh hoạ
  hasApi?: boolean
}

export type AdminNavSection = {
  id: 'monitoring' | 'administration' | 'customisation'
  title: string
  icon: LucideIcon
  items: AdminNavItem[]
}

// ===========================================
// MENU
// ===========================================

export const adminNav: AdminNavSection[] = [
  {
    id: 'monitoring',
    title: 'MONITORING',
    icon: Activity,
    items: [
      {
        title: 'Dashboard',
        url: '/admin/dashboard',
        hasApi: true,
        icon: LayoutDashboard,
        pageTitle: 'MAMCG Dashboard',
        pageSubtitle: 'Tổng quan hệ thống quản lý media',
      },
      {
        title: 'Nhật ký',
        url: '/admin/logs',
        hasApi: true,
        icon: FileText,
        pageTitle: 'Nhật ký hệ thống',
        pageSubtitle: 'Xem nhật ký hoạt động của hệ thống',
      },
      {
        title: 'Thông báo',
        url: '/admin/notifications',
        hasApi: true,
        icon: Bell,
        pageTitle: 'Thông báo',
        pageSubtitle: 'Quản lý thông báo hệ thống',
      },
      {
        title: 'Trạng thái Server',
        url: '/admin/server-status',
        hasApi: true,
        icon: Server,
        pageTitle: 'Trạng thái Server',
        pageSubtitle: 'Giám sát trạng thái và hiệu suất server',
      },
    ],
  },
  {
    id: 'administration',
    title: 'ADMINISTRATION',
    icon: Settings,
    items: [
      {
        title: 'Cài đặt',
        url: '/admin/settings',
        hasApi: true,
        icon: Settings,
        pageTitle: 'Cấu hình các thiết lập hệ thống',
      },
      {
        title: 'Tài khoản',
        url: '/admin/users',
        hasApi: true,
        icon: Users,
        pageTitle: 'Quản lý người dùng và quyền truy cập',
      },
      {
        title: 'Nhóm quyền',
        url: '/admin/roles',
        hasApi: true,
        icon: Shield,
        pageTitle: 'Cấu hình nhóm quyền và phân quyền',
      },
      {
        title: 'Phân quyền',
        url: '/admin/permissions',
        hasApi: true,
        icon: Activity,
        pageTitle: 'Phân quyền chi tiết cho người dùng',
      },
      {
        title: 'Database',
        url: '/admin/database',
        hasApi: true,
        icon: Database,
        pageTitle: 'Quản lý kết nối cơ sở dữ liệu',
      },
      {
        title: 'Lưu trữ',
        url: '/admin/storage',
        hasApi: true,
        icon: HardDrive,
        pageTitle: 'Quản lý hệ thống lưu trữ',
      },
    ],
  },
  {
    id: 'customisation',
    title: 'CUSTOMISATION',
    icon: Wrench,
    items: [
      {
        title: 'Nhóm trường DL',
        url: '/admin/field-groups',
        hasApi: true,
        icon: Grid3x3,
        pageTitle: 'Quản lý các nhóm trường dữ liệu',
      },
      {
        title: 'Trường dữ liệu',
        url: '/admin/data-fields',
        hasApi: true,
        icon: FileText,
        pageTitle: 'Cấu hình các trường dữ liệu tùy chỉnh',
      },
      {
        title: 'Panel hiển thị',
        url: '/admin/display-panels',
        hasApi: true,
        icon: PanelLeft,
        pageTitle: 'Tùy chỉnh giao diện hiển thị',
      },
      {
        title: 'Workflow',
        url: '/admin/workflow',
        hasApi: true,
        icon: GitBranch,
        pageTitle: 'Quản lý quy trình xử lý tự động',
      },
    ],
  },
]

/**
 * Tìm section + menu item tương ứng với pathname hiện tại.
 * Mặc định trả về section đầu tiên nếu không khớp.
 */
export function findAdminNav(pathname: string) {
  const path = pathname.replace(/\/+$/, '')

  for (const section of adminNav) {
    const item = section.items.find(
      (i) => path === i.url || path.startsWith(`${i.url}/`)
    )
    if (item) return { section, item }
  }

  return { section: adminNav[0], item: undefined }
}
