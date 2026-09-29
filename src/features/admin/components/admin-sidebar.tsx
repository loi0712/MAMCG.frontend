import { Link } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import type { AdminNavItem, AdminNavSection } from '../data/admin-nav'
import MamcgLogo from '@/assets/images/mamcg.png'

type AdminSidebarProps = {
  section: AdminNavSection
  activeItem?: AdminNavItem
}

export function AdminSidebar({ section, activeItem }: AdminSidebarProps) {
  return (
    <aside className='bg-sidebar text-sidebar-foreground flex h-full w-[200px] shrink-0 flex-col border-r'>
      <div className='shrink-0 border-b p-4'>
        <img src={MamcgLogo} alt='MAM CG Logo' />
        <div className='text-muted-foreground mt-1 text-xs'>Admin Panel</div>
      </div>

      <nav className='flex-1 overflow-y-auto py-4'>
        {section.items.map((item) => {
          const Icon = item.icon
          const isActive = activeItem?.url === item.url
          return (
            <Link
              key={item.url}
              to={item.url}
              className={cn(
                'flex w-full items-center gap-3 px-6 py-3 text-sm transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground border-sidebar-primary border-r-2 font-medium'
                  : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <Icon className='h-4 w-4' />
              {item.title}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
