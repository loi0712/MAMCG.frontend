import { useEffect, useState } from 'react'
import { z } from 'zod'
import { type FieldErrors, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertTriangle, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  LDAP_ATTRIBUTE_PATTERN,
  LDAP_ATTRIBUTE_PRESETS,
  LDAP_DEFAULT_SYNC_FILTER,
  LDAP_SYNC_MAX_INTERVAL,
  type LdapAttributeMapping,
  type LdapConfiguration,
  type LdapConfigurationRequest,
  SECRET_MASK,
  useCreateLdapConfiguration,
  useUpdateLdapConfiguration,
} from '../../api/settings'

const ATTR_MESSAGE = 'Tên thuộc tính chỉ gồm chữ, số, dấu "-" và bắt đầu bằng chữ'
const requiredAttr = z.string().trim().min(1, 'Vui lòng nhập tên thuộc tính').regex(LDAP_ATTRIBUTE_PATTERN, ATTR_MESSAGE)
const optionalAttr = z
  .string()
  .trim()
  .refine((v) => !v || LDAP_ATTRIBUTE_PATTERN.test(v), ATTR_MESSAGE)

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
  attrUsername: requiredAttr,
  attrFullName: requiredAttr,
  attrEmail: requiredAttr,
  attrPhone: optionalAttr,
  attrDepartment: optionalAttr,
  attrTitle: optionalAttr,
  syncEnabled: z.boolean(),
  syncIntervalMinutes: z
    .string()
    .trim()
    .regex(/^\d+$/, 'Nhập số phút (số nguyên ≥ 0)')
    .refine((v) => Number(v) <= LDAP_SYNC_MAX_INTERVAL, `Tối đa ${LDAP_SYNC_MAX_INTERVAL} phút (7 ngày)`),
  syncFilter: z
    .string()
    .trim()
    .max(1000, 'Tối đa 1000 ký tự')
    .refine((v) => !v || (v.startsWith('(') && v.endsWith(')')), 'Bộ lọc LDAP phải nằm trong ngoặc, vd. (objectClass=person)'),
  deactivateMissingUsers: z.boolean(),
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
  ...LDAP_ATTRIBUTE_PRESETS.activeDirectory,
  syncEnabled: false,
  syncIntervalMinutes: '0',
  syncFilter: '',
  deactivateMissingUsers: false,
}

const ATTRIBUTE_FIELDS: { name: keyof LdapAttributeMapping; label: string; required?: boolean; hint: string }[] = [
  { name: 'attrUsername', label: 'Tên đăng nhập', required: true, hint: 'Khớp với tên đăng nhập trong hệ thống' },
  { name: 'attrFullName', label: 'Họ tên', required: true, hint: 'Tên hiển thị của người dùng' },
  { name: 'attrEmail', label: 'Email', required: true, hint: 'Địa chỉ email' },
  { name: 'attrPhone', label: 'Điện thoại', hint: 'Bỏ trống để không đồng bộ' },
  { name: 'attrDepartment', label: 'Phòng ban', hint: 'Phòng ban chưa có sẽ được tạo tự động' },
  { name: 'attrTitle', label: 'Chức vụ', hint: 'Chức vụ chưa có sẽ được tạo tự động' },
]

const INTERVAL_PRESETS = [
  { label: '1 giờ', value: 60 },
  { label: '6 giờ', value: 360 },
  { label: '1 ngày', value: 1440 },
]

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

  const [tab, setTab] = useState('connection')
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: EMPTY })
  const useSsl = form.watch('useSsl')
  const syncEnabled = form.watch('syncEnabled')
  const deactivateMissing = form.watch('deactivateMissingUsers')
  const baseDn = form.watch('baseDn')

  const applyPreset = (preset: LdapAttributeMapping) => {
    ;(Object.keys(preset) as (keyof LdapAttributeMapping)[]).forEach((key) =>
      form.setValue(key, preset[key], { shouldDirty: true, shouldValidate: true })
    )
  }

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
            attrUsername: config.attrUsername ?? EMPTY.attrUsername,
            attrFullName: config.attrFullName ?? EMPTY.attrFullName,
            attrEmail: config.attrEmail ?? EMPTY.attrEmail,
            // null = không đồng bộ thuộc tính này
            attrPhone: config.attrPhone ?? '',
            attrDepartment: config.attrDepartment ?? '',
            attrTitle: config.attrTitle ?? '',
            syncEnabled: config.syncEnabled ?? false,
            syncIntervalMinutes: String(config.syncIntervalMinutes ?? 0),
            syncFilter: config.syncFilter ?? '',
            deactivateMissingUsers: config.deactivateMissingUsers ?? false,
          }
        : EMPTY
    )
    setTab('connection')
  }, [open, config, form])

  // Chuyển tới tab chứa lỗi đầu tiên để người dùng thấy
  const onInvalid = (errors: FieldErrors<FormValues>) => {
    const keys = Object.keys(errors)
    const tabOf = (k: string) =>
      k.startsWith('attr')
        ? 'mapping'
        : k.startsWith('sync') || k === 'deactivateMissingUsers'
          ? 'sync'
          : ['bindDn', 'bindPassword', 'filterUsers', 'filterGroups'].includes(k)
            ? 'authentication'
            : 'connection'
    if (keys.length && !keys.some((k) => tabOf(k) === tab)) setTab(tabOf(keys[0]))
  }

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
      attrUsername: values.attrUsername,
      attrFullName: values.attrFullName,
      attrEmail: values.attrEmail,
      attrPhone: values.attrPhone || null,
      attrDepartment: values.attrDepartment || null,
      attrTitle: values.attrTitle || null,
      syncEnabled: values.syncEnabled,
      syncIntervalMinutes: Number(values.syncIntervalMinutes),
      syncFilter: values.syncFilter || null,
      deactivateMissingUsers: values.deactivateMissingUsers,
    }
    if (isEdit && config?.id) await updateConfig.mutateAsync({ id: config.id, data })
    else await createConfig.mutateAsync(data)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='bg-card border-border text-foreground sm:max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='text-primary'>
            {isEdit ? 'Sửa cấu hình AD/LDAP' : 'Thêm cấu hình AD/LDAP'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className='grid gap-4' noValidate>
            <Tabs value={tab} onValueChange={setTab} className='w-full'>
              <TabsList className='bg-muted border border-border'>
                <TabsTrigger value='connection' className={tabTrigger}>
                  Thông tin kết nối
                </TabsTrigger>
                <TabsTrigger value='authentication' className={tabTrigger}>
                  Xác thực
                </TabsTrigger>
                <TabsTrigger value='mapping' className={tabTrigger}>
                  Ánh xạ thuộc tính
                </TabsTrigger>
                <TabsTrigger value='sync' className={tabTrigger}>
                  Đồng bộ
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

              <TabsContent value='mapping' forceMount className='space-y-4 mt-4 data-[state=inactive]:hidden'>
                <div className='flex flex-wrap items-center justify-between gap-2'>
                  <p className='text-sm text-muted-foreground'>
                    Tên thuộc tính LDAP tương ứng với từng thông tin người dùng
                  </p>
                  <div className='flex gap-2'>
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      className='border-border text-foreground hover:bg-accent'
                      onClick={() => applyPreset(LDAP_ATTRIBUTE_PRESETS.activeDirectory)}
                    >
                      Active Directory
                    </Button>
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      className='border-border text-foreground hover:bg-accent'
                      onClick={() => applyPreset(LDAP_ATTRIBUTE_PRESETS.openLdap)}
                    >
                      OpenLDAP
                    </Button>
                  </div>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  {ATTRIBUTE_FIELDS.map((attr) => (
                    <FormField
                      key={attr.name}
                      control={form.control}
                      name={attr.name}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='text-foreground'>
                            {attr.label}
                            {attr.required && ' *'}
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder={LDAP_ATTRIBUTE_PRESETS.activeDirectory[attr.name]}
                              autoComplete='off'
                              className={`${inputClass} font-mono`}
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className='text-xs'>{attr.hint}</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value='sync' forceMount className='space-y-4 mt-4 data-[state=inactive]:hidden'>
                <div className='bg-muted border border-border rounded p-3 text-xs text-muted-foreground flex gap-2'>
                  <Info className='w-4 h-4 mt-0.5 shrink-0 text-primary' />
                  <span>
                    Đồng bộ tạo/cập nhật người dùng hệ thống từ LDAP theo ánh xạ thuộc tính. Người dùng đồng bộ đăng nhập
                    bằng <span className='text-foreground'>mật khẩu LDAP</span> (không có mật khẩu nội bộ). Tài khoản nội
                    bộ trùng tên đăng nhập sẽ được <span className='text-foreground'>bỏ qua</span>, không bị chuyển sang
                    LDAP.
                  </span>
                </div>

                <FormField
                  control={form.control}
                  name='syncEnabled'
                  render={({ field }) => (
                    <FormItem className='flex items-center justify-between p-4 bg-muted rounded border border-border'>
                      <div>
                        <FormLabel className='text-foreground'>Tự động đồng bộ</FormLabel>
                        <p className='text-xs text-muted-foreground mt-1'>
                          Chạy định kỳ khi cấu hình đang kích hoạt và chu kỳ lớn hơn 0
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

                <FormField
                  control={form.control}
                  name='syncIntervalMinutes'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-foreground'>Chu kỳ đồng bộ (phút)</FormLabel>
                      <div className='flex flex-wrap gap-2'>
                        <FormControl>
                          <Input
                            type='number'
                            min={0}
                            max={LDAP_SYNC_MAX_INTERVAL}
                            disabled={!syncEnabled}
                            className={`${inputClass} w-32`}
                            {...field}
                          />
                        </FormControl>
                        {INTERVAL_PRESETS.map((p) => (
                          <Button
                            key={p.value}
                            type='button'
                            variant='outline'
                            size='sm'
                            disabled={!syncEnabled}
                            className='border-border text-foreground hover:bg-accent h-9'
                            onClick={() =>
                              form.setValue('syncIntervalMinutes', String(p.value), {
                                shouldDirty: true,
                                shouldValidate: true,
                              })
                            }
                          >
                            {p.label}
                          </Button>
                        ))}
                      </div>
                      <FormDescription className='text-xs'>
                        0 = chỉ đồng bộ thủ công; tối đa {LDAP_SYNC_MAX_INTERVAL} phút (7 ngày)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='syncFilter'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-foreground'>Bộ lọc đồng bộ</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='(&(objectClass=user)(memberOf=CN=MAM,OU=Groups,DC=company,DC=com))'
                          className={`${inputClass} font-mono`}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className='text-xs break-all'>
                        Chọn người dùng cần đồng bộ trong Base DN. Bỏ trống: {LDAP_DEFAULT_SYNC_FILTER}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='deactivateMissingUsers'
                  render={({ field }) => (
                    <FormItem className='flex items-center justify-between gap-4 p-4 bg-muted rounded border border-border'>
                      <div>
                        <FormLabel className='text-foreground'>Khoá người dùng không còn trên LDAP</FormLabel>
                        <p className='text-xs text-muted-foreground mt-1'>
                          Tài khoản đã đồng bộ trước đây (thuộc Base DN này) nhưng không còn được tìm thấy sẽ bị khoá
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

                {deactivateMissing && (
                  <div className='bg-yellow-900/20 border border-yellow-500 rounded p-3 text-xs text-yellow-600 flex gap-2'>
                    <AlertTriangle className='w-4 h-4 mt-0.5 shrink-0' />
                    <span>
                      Cẩn thận: nếu bộ lọc đồng bộ hoặc Base DN bị thu hẹp, những người dùng nằm ngoài phạm vi sẽ bị coi là
                      “không còn trên LDAP” và bị khoá. Hãy dùng “Xem trước đồng bộ” để kiểm tra trước khi đồng bộ thật.
                      {!baseDn?.trim() && ' Tuỳ chọn này chỉ có hiệu lực khi đã nhập Base DN.'}
                    </span>
                  </div>
                )}
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
