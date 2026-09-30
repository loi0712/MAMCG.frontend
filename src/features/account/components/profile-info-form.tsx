import { useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Info, Loader2, Save } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { type UserProfile, useUpdateMyProfile } from '../api'

const GENDER_NONE = 'none'

const schema = z.object({
  fullName: z.string().trim().min(1, 'Vui lòng nhập họ tên').max(255, 'Họ tên không được vượt quá 255 ký tự'),
  email: z.string().trim().email('Email không hợp lệ'),
  phoneNumber: z.string().trim().max(20, 'Số điện thoại không được vượt quá 20 ký tự'),
  gender: z.string(),
  dateOfBirth: z.string(),
  address: z.string().trim().max(500, 'Địa chỉ không được vượt quá 500 ký tự'),
})

type FormValues = z.infer<typeof schema>

const toFormValues = (p: UserProfile): FormValues => ({
  fullName: p.fullName ?? '',
  email: p.email ?? '',
  phoneNumber: p.phoneNumber ?? '',
  gender: p.gender === null || p.gender === undefined ? GENDER_NONE : String(p.gender),
  dateOfBirth: p.dateOfBirth ? p.dateOfBirth.slice(0, 10) : '',
  address: p.address ?? '',
})

const formatDateTime = (value?: string | null) => (value ? new Date(value).toLocaleString('vi-VN') : '—')

function ReadOnlyField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className='space-y-1'>
      <div className='text-muted-foreground text-xs'>{label}</div>
      <div className='text-sm font-medium'>{value}</div>
    </div>
  )
}

export function ProfileInfoForm({ profile }: { profile: UserProfile }) {
  const update = useUpdateMyProfile()
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: toFormValues(profile) })

  useEffect(() => {
    form.reset(toFormValues(profile))
  }, [profile, form])

  const onSubmit = async (values: FormValues) => {
    await update
      .mutateAsync({
      fullName: values.fullName,
      email: values.email,
      phoneNumber: values.phoneNumber || null,
      gender: values.gender === GENDER_NONE ? null : values.gender === 'true',
      dateOfBirth: values.dateOfBirth || null,
      address: values.address || null,
      })
      // Lỗi đã được báo qua toast (mutations.onError)
      .catch(() => undefined)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin cá nhân</CardTitle>
        <CardDescription>Tên đăng nhập, phòng ban, chức vụ và trạng thái do quản trị viên quản lý.</CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        <div className='bg-muted/50 grid grid-cols-2 gap-4 rounded-md border p-4 md:grid-cols-4'>
          <ReadOnlyField label='Tên đăng nhập' value={<span className='font-mono'>{profile.username}</span>} />
          <ReadOnlyField label='Phòng ban' value={profile.department?.name ?? '—'} />
          <ReadOnlyField label='Chức vụ' value={profile.position?.name ?? '—'} />
          <ReadOnlyField
            label='Loại tài khoản'
            value={<Badge variant='outline'>{profile.isDirectoryAccount ? 'AD/LDAP' : 'Nội bộ'}</Badge>}
          />
          <ReadOnlyField label='Đăng nhập gần nhất' value={formatDateTime(profile.lastLoginAt)} />
          <ReadOnlyField label='Ngày tạo' value={formatDateTime(profile.createdAt)} />
        </div>

        {profile.isDirectoryAccount && (
          <Alert>
            <Info className='h-4 w-4' />
            <AlertDescription>
              Họ tên và email của tài khoản AD/LDAP được đồng bộ từ máy chủ thư mục, không sửa được tại đây.
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='grid gap-4' noValidate>
            <div className='grid gap-4 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='fullName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Họ tên</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={profile.isDirectoryAccount} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type='email' {...field} disabled={profile.isDirectoryAccount} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='phoneNumber'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số điện thoại</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='gender'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giới tính</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className='w-full'>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={GENDER_NONE}>Không chọn</SelectItem>
                          <SelectItem value='true'>Nam</SelectItem>
                          <SelectItem value='false'>Nữ</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='dateOfBirth'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ngày sinh</FormLabel>
                      <FormControl>
                        <Input type='date' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <FormField
              control={form.control}
              name='address'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Địa chỉ</FormLabel>
                  <FormControl>
                    <Textarea rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='flex justify-end'>
              <Button type='submit' disabled={update.isPending || !form.formState.isDirty}>
                {update.isPending ? <Loader2 className='h-4 w-4 animate-spin' /> : <Save className='h-4 w-4' />}
                Lưu thay đổi
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
