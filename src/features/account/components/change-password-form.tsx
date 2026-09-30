import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Info, KeyRound, Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { PasswordInput } from '@/components/password-input'
import { PASSWORD_POLICY_HINT, passwordSchema } from '@/features/auth/password/api'
import { type UserProfile, useChangePassword } from '../api'

const schema = z
  .object({
    currentPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Mật khẩu xác nhận không khớp',
  })
  .refine((v) => v.newPassword !== v.currentPassword, {
    path: ['newPassword'],
    message: 'Mật khẩu mới phải khác mật khẩu hiện tại',
  })

type FormValues = z.infer<typeof schema>

export function ChangePasswordForm({ profile }: { profile: UserProfile }) {
  const changePassword = useChangePassword()
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  })

  const onSubmit = async (values: FormValues) => {
    try {
      await changePassword.mutateAsync({ currentPassword: values.currentPassword, newPassword: values.newPassword })
      form.reset()
    } catch {
      // Lỗi đã được báo qua toast (mutations.onError)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Đổi mật khẩu</CardTitle>
        <CardDescription>Sau khi đổi mật khẩu, mọi thiết bị khác đang đăng nhập sẽ bị đăng xuất.</CardDescription>
      </CardHeader>
      <CardContent>
        {profile.isDirectoryAccount ? (
          <Alert>
            <Info className='h-4 w-4' />
            <AlertDescription>
              Tài khoản đăng nhập bằng AD/LDAP không đổi mật khẩu trong hệ thống. Vui lòng đổi mật khẩu trên máy chủ thư
              mục (AD/LDAP).
            </AlertDescription>
          </Alert>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='grid max-w-md gap-4' noValidate>
              <FormField
                control={form.control}
                name='currentPassword'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mật khẩu hiện tại</FormLabel>
                    <FormControl>
                      <PasswordInput autoComplete='current-password' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='newPassword'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mật khẩu mới</FormLabel>
                    <FormControl>
                      <PasswordInput autoComplete='new-password' {...field} />
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
              <div>
                <Button type='submit' disabled={changePassword.isPending}>
                  {changePassword.isPending ? <Loader2 className='h-4 w-4 animate-spin' /> : <KeyRound className='h-4 w-4' />}
                  Đổi mật khẩu
                </Button>
              </div>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  )
}
