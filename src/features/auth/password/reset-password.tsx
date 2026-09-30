import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { ArrowLeft, KeyRound, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { PasswordInput } from '@/components/password-input'
import { handleServerError } from '@/utils/handle-server-error'
import { PASSWORD_POLICY_HINT, passwordSchema, resetPassword } from './api'
import { AuthCard } from './auth-card'

const schema = z
  .object({
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Mật khẩu xác nhận không khớp',
  })

export function ResetPassword() {
  const { token } = useSearch({ from: '/(auth)/reset-password' })
  const navigate = useNavigate()
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  })

  const onSubmit = async (values: z.infer<typeof schema>) => {
    try {
      const res = await resetPassword({ token: token ?? '', newPassword: values.newPassword })
      toast.success(res.message)
      navigate({ to: '/sign-in', replace: true })
    } catch (err) {
      handleServerError(err)
    }
  }

  return (
    <AuthCard title='Đặt lại mật khẩu' description='Nhập mật khẩu mới cho tài khoản của bạn.'>
      {!token ? (
        <div className='grid gap-4'>
          <Alert variant='destructive'>
            <AlertDescription>
              Liên kết đặt lại mật khẩu không hợp lệ. Vui lòng mở đúng liên kết trong email hoặc gửi lại yêu cầu.
            </AlertDescription>
          </Alert>
          <Button asChild>
            <Link to='/forgot-password'>Gửi lại yêu cầu</Link>
          </Button>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='grid gap-3' noValidate>
            <FormField
              control={form.control}
              name='newPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mật khẩu mới</FormLabel>
                  <FormControl>
                    <PasswordInput autoComplete='new-password' autoFocus {...field} />
                  </FormControl>
                  <FormDescription>{PASSWORD_POLICY_HINT}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='confirmPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nhập lại mật khẩu mới</FormLabel>
                  <FormControl>
                    <PasswordInput autoComplete='new-password' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className='mt-2' disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? <Loader2 className='animate-spin' /> : <KeyRound />}
              Đặt lại mật khẩu
            </Button>
            <Button variant='ghost' asChild>
              <Link to='/sign-in'>
                <ArrowLeft className='h-4 w-4' />
                Quay lại đăng nhập
              </Link>
            </Button>
          </form>
        </Form>
      )}
    </AuthCard>
  )
}
