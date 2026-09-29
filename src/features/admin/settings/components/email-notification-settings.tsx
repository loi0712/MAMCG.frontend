import { useEffect, useMemo } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Info, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { type Setting, type SettingUpsertItem, toSettingMap, useSaveSettings } from '../../api/settings'

// Quy tắc thông báo lưu dưới dạng Setting khoá email.notify.* (giá trị chuỗi / "true" / "false")
const NOTIFY_PREFIX = 'email.notify.'
const eventKey = (id: string) => `${NOTIFY_PREFIX}event.${id}`

const NOTIFY_KEYS = {
  adminEmail: `${NOTIFY_PREFIX}recipient.admin`,
  techEmail: `${NOTIFY_PREFIX}recipient.tech`,
  securityEmail: `${NOTIFY_PREFIX}recipient.security`,
  ccList: `${NOTIFY_PREFIX}recipient.cc`,
  groupSimilar: `${NOTIFY_PREFIX}groupSimilar`,
  throttleMinutes: `${NOTIFY_PREFIX}throttleMinutes`,
  minPriority: `${NOTIFY_PREFIX}minPriority`,
  businessHoursOnly: `${NOTIFY_PREFIX}businessHours.enabled`,
  businessHoursFrom: `${NOTIFY_PREFIX}businessHours.from`,
  businessHoursTo: `${NOTIFY_PREFIX}businessHours.to`,
} as const

const EVENT_CATEGORIES = [
  {
    category: 'Hệ thống',
    items: [
      { id: 'system-start', name: 'Khởi động hệ thống', enabled: true },
      { id: 'system-shutdown', name: 'Tắt hệ thống', enabled: true },
      { id: 'system-error', name: 'Lỗi hệ thống', enabled: true },
      { id: 'system-warning', name: 'Cảnh báo hệ thống', enabled: true },
    ],
  },
  {
    category: 'Database',
    items: [
      { id: 'db-backup-success', name: 'Backup thành công', enabled: true },
      { id: 'db-backup-failed', name: 'Backup thất bại', enabled: true },
      { id: 'db-connection-lost', name: 'Mất kết nối database', enabled: true },
      { id: 'db-connection-restored', name: 'Khôi phục kết nối', enabled: false },
    ],
  },
  {
    category: 'Người dùng',
    items: [
      { id: 'user-created', name: 'Tạo tài khoản mới', enabled: true },
      { id: 'user-deleted', name: 'Xóa tài khoản', enabled: true },
      { id: 'user-login-failed', name: 'Đăng nhập thất bại', enabled: true },
      { id: 'user-password-changed', name: 'Đổi mật khẩu', enabled: false },
    ],
  },
  {
    category: 'Workflow',
    items: [
      { id: 'workflow-completed', name: 'Workflow hoàn tất', enabled: true },
      { id: 'workflow-failed', name: 'Workflow thất bại', enabled: true },
      { id: 'workflow-started', name: 'Workflow bắt đầu', enabled: false },
    ],
  },
  {
    category: 'Lưu trữ',
    items: [
      { id: 'storage-full', name: 'Dung lượng đầy', enabled: true },
      { id: 'storage-warning', name: 'Cảnh báo dung lượng (80%)', enabled: true },
      { id: 'storage-cleanup', name: 'Dọn dẹp lưu trữ', enabled: false },
    ],
  },
]

const ALL_EVENTS = EVENT_CATEGORIES.flatMap((c) => c.items)

const PRIORITIES = [
  { value: 'info', label: 'Thông tin' },
  { value: 'warning', label: 'Cảnh báo' },
  { value: 'error', label: 'Lỗi' },
  { value: 'critical', label: 'Nghiêm trọng' },
]

const optionalEmail = z.union([z.literal(''), z.email('Email không hợp lệ')])

const schema = z.object({
  events: z.record(z.string(), z.boolean()),
  adminEmail: optionalEmail,
  techEmail: optionalEmail,
  securityEmail: optionalEmail,
  ccList: z
    .string()
    .trim()
    .refine(
      (v) =>
        v
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
          .every((s) => z.email().safeParse(s).success),
      'Danh sách có email không hợp lệ'
    ),
  groupSimilar: z.boolean(),
  throttleMinutes: z.string().trim().regex(/^\d*$/, 'Phải là số phút'),
  minPriority: z.string(),
  businessHoursOnly: z.boolean(),
  businessHoursFrom: z.string(),
  businessHoursTo: z.string(),
})

type FormValues = z.infer<typeof schema>

const toBool = (value: string | undefined, fallback: boolean) =>
  value === undefined || value === '' ? fallback : value.toLowerCase() === 'true'

const toFormValues = (map: Map<string, string>): FormValues => ({
  events: Object.fromEntries(ALL_EVENTS.map((e) => [e.id, toBool(map.get(eventKey(e.id)), e.enabled)])),
  adminEmail: map.get(NOTIFY_KEYS.adminEmail) ?? '',
  techEmail: map.get(NOTIFY_KEYS.techEmail) ?? '',
  securityEmail: map.get(NOTIFY_KEYS.securityEmail) ?? '',
  ccList: map.get(NOTIFY_KEYS.ccList) ?? '',
  groupSimilar: toBool(map.get(NOTIFY_KEYS.groupSimilar), false),
  throttleMinutes: map.get(NOTIFY_KEYS.throttleMinutes) ?? '5',
  minPriority: map.get(NOTIFY_KEYS.minPriority) || 'warning',
  businessHoursOnly: toBool(map.get(NOTIFY_KEYS.businessHoursOnly), false),
  businessHoursFrom: map.get(NOTIFY_KEYS.businessHoursFrom) || '08:00',
  businessHoursTo: map.get(NOTIFY_KEYS.businessHoursTo) || '18:00',
})

const toItems = (v: FormValues): SettingUpsertItem[] => [
  ...ALL_EVENTS.map((e) => ({ key: eventKey(e.id), value: String(v.events[e.id] ?? e.enabled) })),
  { key: NOTIFY_KEYS.adminEmail, value: v.adminEmail },
  { key: NOTIFY_KEYS.techEmail, value: v.techEmail },
  { key: NOTIFY_KEYS.securityEmail, value: v.securityEmail },
  { key: NOTIFY_KEYS.ccList, value: v.ccList },
  { key: NOTIFY_KEYS.groupSimilar, value: String(v.groupSimilar) },
  { key: NOTIFY_KEYS.throttleMinutes, value: v.throttleMinutes },
  { key: NOTIFY_KEYS.minPriority, value: v.minPriority },
  { key: NOTIFY_KEYS.businessHoursOnly, value: String(v.businessHoursOnly) },
  { key: NOTIFY_KEYS.businessHoursFrom, value: v.businessHoursFrom },
  { key: NOTIFY_KEYS.businessHoursTo, value: v.businessHoursTo },
]

type EmailNotificationSettingsProps = {
  settings: Setting[]
}

export function EmailNotificationSettings({ settings }: EmailNotificationSettingsProps) {
  const saveSettings = useSaveSettings()
  const map = useMemo(() => toSettingMap(settings), [settings])
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: toFormValues(map) })
  const businessHoursOnly = form.watch('businessHoursOnly')

  // Chỉ nạp lại khi giá trị của form này trên máy chủ thay đổi (lưu tab khác không xoá thay đổi đang sửa)
  const savedKey = JSON.stringify(toFormValues(map))
  useEffect(() => {
    form.reset(JSON.parse(savedKey) as FormValues)
  }, [savedKey, form])

  const onSubmit = async (values: FormValues) => {
    await saveSettings.mutateAsync(toItems(values))
  }

  const inputClass = 'bg-muted border-border text-foreground'

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6' noValidate>
        <div className='flex items-start gap-2 rounded border border-border bg-muted p-3 text-sm text-muted-foreground'>
          <Info className='w-4 h-4 mt-0.5 shrink-0 text-primary' />
          <span>
            Các quy tắc dưới đây được lưu trong cấu hình hệ thống (khoá <code>email.notify.*</code>). Hiện máy chủ mới
            dùng cấu hình SMTP để gửi email thử; việc tự động gửi email theo các sự kiện này chưa được triển khai.
          </span>
        </div>

        <div className='grid grid-cols-2 gap-6'>
          {/* Loại thông báo */}
          <Card className='bg-card border-border p-6'>
            <h3 className='text-primary mb-4 flex items-center gap-2'>
              <Mail className='w-5 h-5' />
              Loại thông báo
            </h3>

            <ScrollArea className='h-[500px]'>
              <div className='space-y-3 pr-4'>
                {EVENT_CATEGORIES.map((category) => (
                  <div key={category.category}>
                    <div className='text-sm text-primary mb-2 mt-3'>{category.category}</div>
                    {category.items.map((item) => (
                      <FormField
                        key={item.id}
                        control={form.control}
                        name={`events.${item.id}`}
                        render={({ field }) => (
                          <FormItem className='flex items-center justify-between py-2 px-3 bg-muted border border-border rounded mb-2 hover:bg-accent'>
                            <FormLabel className='text-foreground text-sm cursor-pointer'>{item.name}</FormLabel>
                            <FormControl>
                              <Switch
                                checked={field.value ?? item.enabled}
                                onCheckedChange={field.onChange}
                                className='data-[state=checked]:bg-primary'
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>

          <div className='space-y-6'>
            {/* Người nhận mặc định */}
            <Card className='bg-card border-border p-6'>
              <h3 className='text-primary mb-4'>Người nhận mặc định</h3>

              <div className='space-y-4'>
                {(
                  [
                    { name: 'adminEmail', label: 'Email quản trị viên', placeholder: 'admin@mamcg.vn' },
                    { name: 'techEmail', label: 'Email kỹ thuật', placeholder: 'tech@mamcg.vn' },
                    { name: 'securityEmail', label: 'Email bảo mật', placeholder: 'security@mamcg.vn' },
                  ] as const
                ).map((f) => (
                  <FormField
                    key={f.name}
                    control={form.control}
                    name={f.name}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-foreground'>{f.label}</FormLabel>
                        <FormControl>
                          <Input type='email' placeholder={f.placeholder} className={inputClass} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}

                <FormField
                  control={form.control}
                  name='ccList'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-foreground'>Danh sách email CC (phân cách bởi dấu phẩy)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='user1@mamcg.vn, user2@mamcg.vn'
                          className={inputClass}
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Card>

            {/* Tùy chọn nâng cao */}
            <Card className='bg-card border-border p-6'>
              <h3 className='text-primary mb-4'>Tùy chọn nâng cao</h3>

              <div className='space-y-4'>
                <FormField
                  control={form.control}
                  name='groupSimilar'
                  render={({ field }) => (
                    <FormItem className='flex items-center justify-between'>
                      <FormLabel className='text-foreground'>Gộp thông báo cùng loại</FormLabel>
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
                  name='throttleMinutes'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-foreground'>Thời gian chờ giữa các email (phút)</FormLabel>
                      <FormControl>
                        <Input type='number' min={0} placeholder='5' className={inputClass} {...field} />
                      </FormControl>
                      <p className='text-xs text-muted-foreground'>Tránh spam khi có nhiều thông báo liên tiếp</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='minPriority'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-foreground'>Mức độ ưu tiên tối thiểu</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className={`w-full ${inputClass}`}>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className='bg-card border-border'>
                          {PRIORITIES.map((p) => (
                            <SelectItem key={p.value} value={p.value} className='text-foreground'>
                              {p.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='businessHoursOnly'
                  render={({ field }) => (
                    <FormItem className='flex items-center justify-between'>
                      <FormLabel className='text-foreground'>Gửi email vào giờ hành chính</FormLabel>
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

                <div className='grid grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='businessHoursFrom'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-foreground text-sm'>Từ</FormLabel>
                        <FormControl>
                          <Input type='time' disabled={!businessHoursOnly} className={inputClass} {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='businessHoursTo'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-foreground text-sm'>Đến</FormLabel>
                        <FormControl>
                          <Input type='time' disabled={!businessHoursOnly} className={inputClass} {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </Card>
          </div>
        </div>

        <div className='flex justify-end gap-3 pt-4 border-t border-border'>
          <Button
            type='button'
            variant='outline'
            className='border-border text-muted-foreground hover:bg-accent'
            disabled={!form.formState.isDirty}
            onClick={() => form.reset(toFormValues(map))}
          >
            Hoàn tác thay đổi
          </Button>
          <Button
            type='submit'
            className='bg-primary hover:bg-primary/90 text-primary-foreground'
            disabled={saveSettings.isPending}
          >
            {saveSettings.isPending ? 'Đang lưu...' : 'Lưu cấu hình'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
