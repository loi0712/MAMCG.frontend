import { useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  type LdapConfiguration,
  type LdapConfigurationRequest,
  SECRET_MASK,
  useCreateLdapConfiguration,
  useUpdateLdapConfiguration,
} from '../../api/settings'

const schema = z.object({
  serverUrl: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập địa chỉ server')
    .max(255, 'Tối đa 255 ký tự')
    .regex(/^(ldaps?:\/\/)?[^\s/:]+(:\d{1,5})?\/?$/i, 'Dạng ldap://host:port, ldaps://host hoặc host'),
  useSsl: z.boolean(),
  baseDn: z.string().trim(),
  bindDn: z.string().trim(),
  bindPassword: z.string(),
  filterUsers: z.string().trim(),
  filterGroups: z.string().trim(),
  isActive: z.boolean(),
})

type FormValues = z.infer<typeof schema>

const EMPTY: FormValues = {
  serverUrl: '',
  useSsl: false,
  baseDn: '',
  bindDn: '',
  bindPassword: '',
  filterUsers: '',
  filterGroups: '',
  isActive: true,
}

const tabTrigger = 'data-[state=active]:bg-accent data-[state=active]:text-primary text-foreground'
const inputClass = 'bg-muted border-border text-foreground'

type LdapFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  config?: LdapConfiguration | null
}

export function LdapFormDialog({ open, onOpenChange, config }: LdapFormDialogProps) {
  const isEdit = !!config?.id
  const hasStoredPassword = config?.bindPassword === SECRET_MASK
  const createConfig = useCreateLdapConfiguration()
  const updateConfig = useUpdateLdapConfiguration()

  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: EMPTY })
  const useSsl = form.watch('useSsl')

  useEffect(() => {
    if (!open) return
    form.reset(
      config
        ? {
            serverUrl: config.serverUrl ?? '',
            useSsl: config.useSsl ?? false,
            baseDn: config.baseDn ?? '',
            bindDn: config.bindDn ?? '',
            // Mật khẩu đã lưu bị che: để trống, gửi lại chuỗi che để giữ nguyên
            bindPassword: '',
            filterUsers: config.filterUsers ?? '',
            filterGroups: config.filterGroups ?? '',
            isActive: config.isActive ?? true,
          }
        : EMPTY
    )
  }, [open, config, form])

  const onSubmit = async (values: FormValues) => {
    const data: LdapConfigurationRequest = {
      serverUrl: values.serverUrl,
      useSsl: values.useSsl,
      baseDn: values.baseDn || null,
      bindDn: values.bindDn || null,
      // Bỏ Bind DN = bind ẩn danh: xoá luôn mật khẩu đã lưu
      bindPassword: !values.bindDn
        ? null
        : values.bindPassword || (hasStoredPassword ? SECRET_MASK : null),
      filterUsers: values.filterUsers || null,
      filterGroups: values.filterGroups || null,
      isActive: values.isActive,
    }
    if (isEdit && config?.id) await updateConfig.mutateAsync({ id: config.id, data })
    else await createConfig.mutateAsync(data)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='bg-card border-border text-foreground sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle className='text-primary'>
            {isEdit ? 'Sửa cấu hình AD/LDAP' : 'Thêm cấu hình AD/LDAP'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='grid gap-4' noValidate>
            <Tabs defaultValue='connection' className='w-full'>
              <TabsList className='bg-muted border border-border'>
                <TabsTrigger value='connection' className={tabTrigger}>
                  Thông tin kết nối
                </TabsTrigger>
                <TabsTrigger value='authentication' className={tabTrigger}>
                  Xác thực
                </TabsTrigger>
              </TabsList>

              {/* forceMount: giữ các trường của tab ẩn trong form để kiểm tra hợp lệ */}
              <TabsContent value='connection' forceMount className='space-y-4 mt-4 data-[state=inactive]:hidden'>
                <FormField
                  control={form.control}
                  name='serverUrl'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-foreground'>Địa chỉ Server *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={useSsl ? 'ldaps://dc.company.com:636' : 'ldap://dc.company.com:389'}
                          className={`${inputClass} font-mono`}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className='text-xs'>
                        Có thể kèm cổng; bỏ trống cổng sẽ dùng 389 (hoặc 636 khi dùng SSL)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='baseDn'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-foreground'>Base DN</FormLabel>
                      <FormControl>
                        <Input placeholder='DC=company,DC=com' className={inputClass} {...field} />
                      </FormControl>
                      <FormDescription className='text-xs'>
                        Distinguished Name gốc để tìm kiếm người dùng
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='useSsl'
                  render={({ field }) => (
                    <FormItem className='flex items-center justify-between p-4 bg-muted rounded border border-border'>
                      <div>
                        <FormLabel className='text-foreground'>Sử dụng SSL/TLS</FormLabel>
                        <p className='text-xs text-muted-foreground mt-1'>Kết nối bảo mật qua LDAPS</p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className='data-[state=checked]:bg-primary'
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='isActive'
                  render={({ field }) => (
                    <FormItem className='flex items-center justify-between p-4 bg-muted rounded border border-border'>
                      <div>
                        <FormLabel className='text-foreground'>Kích hoạt</FormLabel>
                        <p className='text-xs text-muted-foreground mt-1'>
                          Đăng nhập bằng tài khoản AD/LDAP dùng cấu hình kích hoạt có ID nhỏ nhất
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className='data-[state=checked]:bg-primary'
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value='authentication' forceMount className='space-y-4 mt-4 data-[state=inactive]:hidden'>
                <FormField
                  control={form.control}
                  name='bindDn'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-foreground'>Bind DN</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='CN=admin,DC=company,DC=com'
                          autoComplete='off'
                          className={inputClass}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className='text-xs'>
                        Tài khoản dịch vụ để xác thực với server; bỏ trống để bind ẩn danh
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='bindPassword'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-foreground'>Mật khẩu</FormLabel>
                      <FormControl>
                        <Input
                          type='password'
                          autoComplete='new-password'
                          placeholder={hasStoredPassword ? 'Đã lưu — để trống nếu giữ nguyên' : '••••••••'}
                          className={inputClass}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='filterUsers'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-foreground'>User Search Filter</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='(&(objectClass=user)(sAMAccountName={0}))'
                          className={`${inputClass} font-mono`}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className='text-xs'>
                        {'{0}'} được thay bằng tên đăng nhập. Bỏ trống: tìm theo sAMAccountName, uid hoặc
                        userPrincipalName
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='filterGroups'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-foreground'>Group Search Filter</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='(objectClass=group)'
                          className={`${inputClass} font-mono`}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                className='border-border text-foreground hover:bg-accent'
                onClick={() => onOpenChange(false)}
              >
                Huỷ
              </Button>
              <Button
                type='submit'
                className='bg-primary hover:bg-primary/90 text-primary-foreground'
                disabled={createConfig.isPending || updateConfig.isPending}
              >
                {isEdit ? 'Lưu' : 'Thêm'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
