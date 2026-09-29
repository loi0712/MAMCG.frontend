import { Outlet, useLocation } from '@tanstack/react-router'
import { findAdminNav } from '../data/admin-nav'
import { AdminSidebar } from './admin-sidebar'
import { AdminTopNav } from './admin-top-nav'
import { AdminPageHeader } from './admin-page-header'
import { DashboardHeader } from './dashboard-header'

export function AdminLayout() {
  const pathname = useLocation({ select: (location) => location.pathname })
  const { section, item } = findAdminNav(pathname)

  return (
    <div className='bg-background text-foreground flex h-svh overflow-hidden'>
      <AdminSidebar section={section} activeItem={item} />

      <div className='flex min-w-0 flex-1 flex-col'>
        <AdminTopNav activeSection={section.id} />

        {item &&
          (item.url === '/admin/dashboard' ? (
            <DashboardHeader title={item.pageTitle} subtitle={item.pageSubtitle} />
          ) : (
            <AdminPageHeader title={item.pageTitle} subtitle={item.pageSubtitle} />
          ))}

        <main className='flex-1 overflow-auto p-4'>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
