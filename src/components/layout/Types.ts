import { type LinkProps } from '@tanstack/react-router'

type BaseNavItem = {
  title: string
  badge?: string
  icon?: React.ElementType
  // Mục chưa có trang: hiển thị nhưng không điều hướng
  disabled?: boolean
}

type NavLink = BaseNavItem & {
  url: LinkProps['to'] | (string & {})
  items?: never
}

type NavCollapsible = BaseNavItem & {
  items: (BaseNavItem & { url: LinkProps['to'] | (string & {}) })[]
  url?: never
}

type NavItem = NavCollapsible | NavLink

type NavGroup = {
  title: string
  items: NavItem[]
}

type SidebarData = {
  navGroups: NavGroup[]
}

type TreeNodeData = {
  id: string;
  name: string;
  level: number | null;
  isOpen?: boolean;
  children?: TreeNodeData[];
};

type FlatFolder = {
  label: string;
  value: string | null;
}

export type { SidebarData, NavGroup, NavItem, NavCollapsible, NavLink, TreeNodeData, FlatFolder }
