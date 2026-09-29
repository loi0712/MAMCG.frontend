import { Link } from '@tanstack/react-router'
import { LayoutGrid } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { adminNav, type AdminNavSection } from '../data/admin-nav'

type AdminTopNavProps = {
  activeSection: AdminNavSection['id']
}

export function AdminTopNav({ activeSection }: AdminTopNavProps) {
  return (
    <div className='bg-background flex items-center justify-between border-b px-6'>
      {/* Left: Navigation Tabs */}
      <nav className='flex gap-6'>
        {adminNav.map((section) => {
          const Icon = section.icon
          return (
            <Link
              key={section.id}
              to={section.items[0].url}
              className={cn(
                'flex items-center gap-2 border-b-2 px-4 py-3 text-sm transition-colors',
                activeSection === section.id
                  ? 'border-primary text-foreground'
                  : 'text-muted-foreground hover:text-foreground border-transparent'
              )}
            >
              <Icon className='h-4 w-4' />
              {section.title}
            </Link>
          )
        })}
      </nav>

      {/* Right: User Controls */}
      <div className='flex items-center gap-4 py-2'>
        <Button variant='outline' size='sm' asChild>
          <Link
            to='/assets'
            search={{ folderId: '0', page: 1, pageSize: 10 }}
          >
            <LayoutGrid className='h-4 w-4' />
            Giao diện người dùng
          </Link>
        </Button>
        <ThemeSwitch />
        <ProfileDropdown />
      </div>
    </div>
  )
}
