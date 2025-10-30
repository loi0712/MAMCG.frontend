import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { Loader2, LogIn } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'
import { LoginCredentialsDTO, loginWithEmailAndPassword } from '../api/sign-in'

const formSchema = z.object({
  userName: z.string().min(1, 'Vui lòng nhập tên đăng nhập'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
})

interface UserAuthFormProps extends React.HTMLAttributes<HTMLFormElement> {
  redirectTo?: string
}

export function UserAuthForm({
  className,
  redirectTo,
  ...props
}: UserAuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { auth } = useAuthStore()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userName: '',
      password: '',
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)

    const account: LoginCredentialsDTO = {
      userName: data.userName,
      password: data.password,
    }

    try {
      const res = await loginWithEmailAndPassword(account)
      
      // Set user và token
      auth.setUser(res.user)
      auth.setAccessToken(res.token)

      // Toast success
      toast.success(`Chào mừng bạn trở lại, ${res.user.username}!`)

      // Navigate đến redirect URL hoặc default
      // Quan trọng: Decode URL nếu cần và fallback về /assets
      const destination = redirectTo && redirectTo !== '' 
        ? decodeURIComponent(redirectTo) 
        : '/assets'
      
      // Kiểm tra để tránh redirect loop
      if (destination.includes('/sign-in')) {
        console.warn('Redirect loop detected, redirecting to /assets instead')
        navigate({ to: '/assets', replace: true })
      } else {
        navigate({ to: destination, replace: true })
      }
    } catch (err: any) {
      toast.error(err?.message || 'Đăng nhập thất bại')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-3', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name='userName'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên đăng nhập</FormLabel>
              <FormControl>
                <Input placeholder='Nhập tên đăng nhập' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem className='relative'>
              <FormLabel>Mật khẩu</FormLabel>
              <FormControl>
                <PasswordInput placeholder='********' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className='mt-2' disabled={isLoading}>
          {isLoading ? <Loader2 className='animate-spin' /> : <LogIn />}
          Đăng nhập
        </Button>

        <div className='relative my-2'>
          <div className='absolute inset-0 flex items-center'>
            <span className='w-full border-t' />
          </div>
        </div>
      </form>
    </Form>
  )
}
