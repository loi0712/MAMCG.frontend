import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from '@tanstack/react-router'
import { ArrowLeft, Loader2, MailCheck, Send } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { handleServerError } from '@/utils/handle-server-error'
import { requestPasswordReset } from './api'
import { AuthCard } from './auth-card'

const schema = z.object({
  userNameOrEmail: z.string().trim().min(1, 'Vui lòng nhập tên đăng nhập hoặc email'),
})

export function ForgotPassword() {
  const [message, setMessage] = useState<string | null>(null)
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { userNameOrEmail: '' },
  })

  const onSubmit = async (values: z.infer<typeof schema>) => {
    try {
      const res = await requestPasswordReset(values.userNameOrEmail)
      setMessage(res.message)
    } catch (err) {
      handleServerError(err)
    }
  }

  return (
    <AuthCard
      title='Quên mật khẩu'
      description='Nhập tên đăng nhập hoặc email của tài khoản. Hệ thống sẽ gửi liên kết đặt lại mật khẩu tới email đã đăng ký.'
    >
      {message ? (
        <div className='grid gap-4'>
          <Alert>
            <MailCheck className='h-4 w-4' />
            <AlertDescription>{message}</AlertDescription>
          </Alert>
          <p className='text-muted-foreground text-sm'>
            Tài khoản đăng nhập bằng AD/LDAP không đặt lại được tại đây, vui lòng liên hệ bộ phận quản trị.
          </p>
          <Button variant='outline' asChild>
            <Link to='/sign-in'>
              <ArrowLeft className='h-4 w-4' />
              Quay lại đăng nhập
            </Link>
          </Button>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='grid gap-3' noValidate>
            <FormField
              control={form.control}
              name='userNameOrEmail'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên đăng nhập hoặc email</FormLabel>
                  <FormControl>
                    <Input placeholder='vd. nv.an hoặc an@vtv.vn' autoFocus {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className='mt-2' disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? <Loader2 className='animate-spin' /> : <Send />}
              Gửi liên kết đặt lại
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
