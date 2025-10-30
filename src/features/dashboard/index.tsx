import { Header } from '@/components/layout/Header'
import { Main } from '@/components/layout/Main'
import { TopNav } from '@/components/layout/Top-nav'

export function Dashboard() {
  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        <TopNav links={topNav} />
      </Header>

      {/* ===== Main ===== */}
      <Main>
        <div className='mb-2 flex items-center justify-between space-y-2 '>
          <h1 className='text-xl font-bold tracking-tight'>Khối tin tức/ BT Nhanh 2025</h1>
        </div>
      </Main>
    </>
  )
}

const topNav = [
  {
    title: 'Tạo mới',
    href: 'dashboard/overview',
    isActive: true,
    disabled: false,
  },
  {
    title: 'View',
    href: 'dashboard/customers',
    isActive: false,
    disabled: true,
  },
  {
    title: 'Tools',
    href: 'dashboard/products',
    isActive: false,
    disabled: true,
  },
  {
    title: 'Help',
    href: 'dashboard/settings',
    isActive: false,
    disabled: true,
  },
]
