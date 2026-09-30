import { KeyRound, Loader2, MonitorSmartphone, UserRound } from 'lucide-react'
import { Main } from '@/components/layout/Main'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useMyProfile } from './api'
import { ChangePasswordForm } from './components/change-password-form'
import { ProfileInfoForm } from './components/profile-info-form'
import { SessionsList } from './components/sessions-list'

const tabTrigger = 'data-[state=active]:bg-accent data-[state=active]:text-primary text-foreground'

export function ProfilePage() {
  const { data: profile, isLoading, isError } = useMyProfile()

  return (
    <Main className='overflow-auto'>
      <div className='mx-auto max-w-5xl space-y-4 p-4'>
        <div>
          <h1 className='text-2xl font-semibold tracking-tight'>Hồ sơ cá nhân</h1>
          <p className='text-muted-foreground text-sm'>Quản lý thông tin, mật khẩu và các phiên đăng nhập của bạn.</p>
        </div>

        {!profile ? (
          <div className='text-muted-foreground flex h-32 items-center justify-center gap-2 text-sm'>
            {isLoading && <Loader2 className='h-4 w-4 animate-spin' />}
            {isLoading ? 'Đang tải...' : isError ? <span className='text-destructive'>Không tải được hồ sơ. Vui lòng thử lại.</span> : null}
          </div>
        ) : (
          <Tabs defaultValue='info' className='w-full'>
            <TabsList className='bg-card border-border border'>
              <TabsTrigger value='info' className={tabTrigger}>
                <UserRound className='mr-2 h-4 w-4' />
                Thông tin cá nhân
              </TabsTrigger>
              <TabsTrigger value='password' className={tabTrigger}>
                <KeyRound className='mr-2 h-4 w-4' />
                Đổi mật khẩu
              </TabsTrigger>
              <TabsTrigger value='sessions' className={tabTrigger}>
                <MonitorSmartphone className='mr-2 h-4 w-4' />
                Phiên đăng nhập
              </TabsTrigger>
            </TabsList>
            <TabsContent value='info' className='mt-4'>
              <ProfileInfoForm profile={profile} />
            </TabsContent>
            <TabsContent value='password' className='mt-4'>
              <ChangePasswordForm profile={profile} />
            </TabsContent>
            <TabsContent value='sessions' className='mt-4'>
              <SessionsList />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </Main>
  )
}
