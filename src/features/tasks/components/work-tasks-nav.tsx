import { Link, useLocation } from '@tanstack/react-router'
import { AlertTriangle, ClipboardList } from 'lucide-react'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  useSidebar,
} from '@/components/ui/sidebar'
import { cn } from '@/shared/lib/utils'
import { useMyTaskSummary } from '../api/tasks'
import { statusLabel } from '../utils'

/** Menu "Công việc": các trạng thái thật đang có việc của người dùng, kèm số lượng; bấm để lọc /tasks. */
export function WorkTasksNav() {
  const { setOpenMobile } = useSidebar()
  const { data, isLoading, isError } = useMyTaskSummary()
  const location = useLocation({
    select: (l) => ({
      pathname: l.pathname,
      search: l.search as Record<string, unknown>,
    }),
  })
  const onTasks = location.pathname === '/tasks'
  const activeStatus = onTasks ? Number(location.search.statusId) || undefined : undefined
  const activeOverdue = onTasks && String(location.search.overdue) === 'true'

  const statuses = data?.statuses ?? []
  const duplicateNames = new Set(statuses.map((s) => s.statusName).filter((name, i, all) => all.indexOf(name) !== i))
  const close = () => setOpenMobile(false)

  return (
    <>
      <SidebarGroup className='h-auto'>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={onTasks && !activeStatus && !activeOverdue}
              tooltip='Công việc của tôi'
            >
              <Link to='/tasks' search={{}} onClick={close}>
                <ClipboardList />
                <span>Công việc của tôi</span>
              </Link>
            </SidebarMenuButton>
            {!!data?.total && <SidebarMenuBadge>{data.total}</SidebarMenuBadge>}
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={activeOverdue} tooltip='Quá hạn'>
              <Link to='/tasks' search={{ overdue: true }} onClick={close}>
                <AlertTriangle className={cn(!!data?.overdue && 'text-destructive')} />
                <span>Quá hạn</span>
              </Link>
            </SidebarMenuButton>
            {!!data?.overdue && <SidebarMenuBadge className='text-destructive'>{data.overdue}</SidebarMenuBadge>}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>

      <SidebarGroup className='h-auto'>
        <SidebarGroupLabel>Theo trạng thái</SidebarGroupLabel>
        <SidebarMenu>
          {isLoading && Array.from({ length: 3 }, (_, i) => <SidebarMenuSkeleton key={i} />)}
          {isError && <p className='text-muted-foreground px-2 text-xs'>Không tải được số việc.</p>}
          {!isLoading && !isError && statuses.length === 0 && (
            <p className='text-muted-foreground px-2 text-xs'>Không có việc đang chờ xử lý</p>
          )}
          {statuses.map((s) => {
            const label = statusLabel(s, duplicateNames)
            return (
              <SidebarMenuItem key={s.statusId}>
                <SidebarMenuButton asChild isActive={activeStatus === s.statusId} tooltip={label}>
                  <Link to='/tasks' search={{ statusId: s.statusId }} onClick={close}>
                    <span
                      className='h-2.5 w-2.5 shrink-0 rounded-full border'
                      style={{ backgroundColor: s.color ?? undefined }}
                      aria-hidden
                    />
                    <span className='truncate'>{label}</span>
                  </Link>
                </SidebarMenuButton>
                <SidebarMenuBadge>{s.count}</SidebarMenuBadge>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroup>
    </>
  )
}
