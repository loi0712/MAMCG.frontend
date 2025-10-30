import { useSearch } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { UserAuthForm } from './components/user-auth-form'
import MamcgLogo from "@/assets/images/mamcg.png";

export function SignIn() {
  const { redirect } = useSearch({ from: '/(auth)/sign-in' })

  return (
    <div className='min-h-screen bg-background flex items-center justify-center p-4'>
      <div className='w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center'>
        {/* Cột trái - Phần giới thiệu */}
        <div className='hidden lg:flex flex-col justify-center space-y-6 px-8'>
          <div className=''>
          <div>
            <img src={MamcgLogo} alt="MAM CG Logo" />
          </div>
            <p className='text-2xl text-foreground leading-relaxed'>
              Hệ thống quản lý đồ hoạ chạy chữ.
            </p>
          </div>
        </div>

        {/* Cột phải - Form đăng nhập */}
        <div className='flex justify-center lg:justify-end'>
          <Card className='w-full max-w-md shadow-xl'>
            <CardHeader className='space-y-2'>
              {/* Logo cho mobile */}
              <div className='lg:hidden mb-4'>
              <div>
            <img src={MamcgLogo} alt="MAM CG Logo" />
          </div>
              </div>
              <CardTitle className='text-2xl font-semibold tracking-tight'>
                Xin chào !
              </CardTitle>
            </CardHeader>
            <CardContent>
              <UserAuthForm redirectTo={redirect} />
            </CardContent>
            <CardFooter>
              <p className='text-muted-foreground px-4 text-center text-sm leading-relaxed'>
                Vui lòng liên hệ với  {' '}
                <a
                  href='/terms'
                  className='hover:text-primary underline underline-offset-4 font-medium'
                >
                  ban quản trị hệ thống
                </a>{' '}
                để được hỗ trợ về tài khoản đăng nhập{' '}
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
