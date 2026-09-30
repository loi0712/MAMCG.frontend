import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import MamcgLogo from '@/assets/images/mamcg.png'

type AuthCardProps = {
  title: string
  description?: React.ReactNode
  children: React.ReactNode
}

// Khung chung cho các trang quên/đặt lại mật khẩu (cùng phong cách trang đăng nhập)
export function AuthCard({ title, description, children }: AuthCardProps) {
  return (
    <div className='bg-background flex min-h-screen items-center justify-center p-4'>
      <Card className='w-full max-w-md shadow-xl'>
        <CardHeader className='space-y-2'>
          <img src={MamcgLogo} alt='MAM CG Logo' className='mb-2 max-w-48' />
          <CardTitle className='text-2xl font-semibold tracking-tight'>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </div>
  )
}
