import { Outlet, useLocation } from '@tanstack/react-router'
import { Info, ShieldAlert } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useMyAccess } from '../api/permissions'
import { findAdminNav } from '../data/admin-nav'
import { AdminSidebar } from './admin-sidebar'
import { AdminTopNav } from './admin-top-nav'
import { AdminPageHeader } from './admin-page-header'
import { DashboardHeader } from './dashboard-header'

export function AdminLayout() {
  const pathname = useLocation({ select: (location) => location.pathname })
  const { section, item } = findAdminNav(pathname)
  // Chỉ chặn khi backend xác nhận không có quyền; lỗi mạng/endpoint cũ không chặn giao diện
  const { data: access } = useMyAccess()
  const forbidden = access?.isAdmin === false

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
          {forbidden ? (
            <Alert variant='destructive'>
              <ShieldAlert className='h-4 w-4' />
              <AlertDescription>
                Tài khoản của bạn chưa có quyền "Quản trị hệ thống". Liên hệ quản trị viên để được cấp quyền.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {item && !item.hasApi && (
                <Alert className='mb-4'>
                  <Info className='h-4 w-4' />
                  <AlertDescription>
                    Dữ liệu minh hoạ: MAMCG.Backend chưa có API cho màn hình này, các thay đổi không được lưu.
                  </AlertDescription>
                </Alert>
              )}
              <Outlet />
            </>
          )}
        </main>
      </div>
    </div>
  )
}
