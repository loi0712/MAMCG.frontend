import { useEffect, useMemo, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { HardDrive, Info, Loader2, Mail, Send } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  type NotifyOutcome,
  RECIPIENT_GROUP_LABEL,
  SEVERITY_LABEL,
  type SystemEvent,
  useSystemEvents,
  useTriggerTestEvent,
} from '../../api/email-templates'
import { type Setting, type SettingUpsertItem, toSettingMap, useSaveSettings, useSettings } from '../../api/settings'

// Quy tắc thông báo lưu dưới dạng Setting khoá email.notify.* (giá trị chuỗi / "true" / "false").
// Backend (SystemEventNotifier) đọc đúng các khoá này khi có sự kiện hệ thống.
const NOTIFY_PREFIX = 'email.notify.'
const eventKey = (code: string) => `${NOTIFY_PREFIX}event.${code}`

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

// Ngưỡng cảnh báo dung lượng điểm lưu trữ (StorageMonitor phía backend)
const STORAGE_PREFIX = 'storage.'
const STORAGE_KEYS = {
  warningPercent: `${STORAGE_PREFIX}warningPercent`,
  fullPercent: `${STORAGE_PREFIX}fullPercent`,
} as const

const PRIORITIES = [
  { value: 'info', label: 'Thông tin (gửi mọi mức)' },
  { value: 'warning', label: 'Cảnh báo (trung bình trở lên)' },
  { value: 'error', label: 'Lỗi (cao trở lên)' },
  { value: 'critical', label: 'Nghiêm trọng' },
]

const SEVERITY_CLASS: Record<string, string> = {
  low: 'border-border text-muted-foreground',
  medium: 'border-yellow-500 text-yellow-500',
  high: 'border-orange-500 text-orange-400',
  critical: 'border-red-500 text-red-400',
}

const RECIPIENT_FIELDS = [
  { name: 'adminEmail', group: 'admin', label: 'Email quản trị viên', placeholder: 'admin@mamcg.vn' },
  { name: 'techEmail', group: 'tech', label: 'Email kỹ thuật', placeholder: 'tech@mamcg.vn' },
  { name: 'securityEmail', group: 'security', label: 'Email bảo mật', placeholder: 'security@mamcg.vn' },
] as const

const optionalEmail = z.union([z.literal(''), z.email('Email không hợp lệ')])
const percent = z
  .string()
  .trim()
  .refine((v) => /^\d+$/.test(v) && Number(v) >= 1 && Number(v) <= 100, 'Từ 1 đến 100')

const schema = z
  .object({
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
    storageWarningPercent: percent,
    storageFullPercent: percent,
  })
  .refine((v) => Number(v.storageWarningPercent) < Number(v.storageFullPercent), {
    path: ['storageFullPercent'],
    message: 'Ngưỡng đầy phải lớn hơn ngưỡng cảnh báo',
  })

type FormValues = z.infer<typeof schema>

const toBool = (value: string | undefined, fallback: boolean) =>
  value === undefined || value === '' ? fallback : value.toLowerCase() === 'true'

// Mặc định trùng với cách backend hiểu khi chưa có khoá (sự kiện tắt, gộp 15 phút, 08:00–17:30)
const toFormValues = (map: Map<string, string>, events: SystemEvent[]): FormValues => ({
  events: Object.fromEntries(
    events.filter((e) => e.code).map((e) => [e.code as string, toBool(map.get(eventKey(e.code as string)), false)])
  ),
  adminEmail: map.get(NOTIFY_KEYS.adminEmail) ?? '',
  techEmail: map.get(NOTIFY_KEYS.techEmail) ?? '',
  securityEmail: map.get(NOTIFY_KEYS.securityEmail) ?? '',
  ccList: map.get(NOTIFY_KEYS.ccList) ?? '',
  groupSimilar: toBool(map.get(NOTIFY_KEYS.groupSimilar), true),
  throttleMinutes: map.get(NOTIFY_KEYS.throttleMinutes) || '15',
  minPriority: map.get(NOTIFY_KEYS.minPriority) || 'info',
  businessHoursOnly: toBool(map.get(NOTIFY_KEYS.businessHoursOnly), false),
  businessHoursFrom: map.get(NOTIFY_KEYS.businessHoursFrom) || '08:00',
  businessHoursTo: map.get(NOTIFY_KEYS.businessHoursTo) || '17:30',
  storageWarningPercent: map.get(STORAGE_KEYS.warningPercent) || '80',
  storageFullPercent: map.get(STORAGE_KEYS.fullPercent) || '95',
})

const toItems = (v: FormValues): SettingUpsertItem[] => [
  ...Object.entries(v.events).map(([code, enabled]) => ({ key: eventKey(code), value: String(enabled) })),
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
  { key: STORAGE_KEYS.warningPercent, value: v.storageWarningPercent },
  { key: STORAGE_KEYS.fullPercent, value: v.storageFullPercent },
]

const groupByCategory = (events: SystemEvent[]) => {
  const groups = new Map<string, SystemEvent[]>()
  events.forEach((e) => {
    const category = e.category || 'Khác'
    groups.set(category, [...(groups.get(category) ?? []), e])
  })
  return [...groups.entries()]
}

type EmailNotificationSettingsProps = {
  settings: Setting[]
}

export function EmailNotificationSettings({ settings }: EmailNotificationSettingsProps) {
  const saveSettings = useSaveSettings()
  const eventsQuery = useSystemEvents()
  const storageQuery = useSettings(STORAGE_PREFIX)
  const triggerEvent = useTriggerTestEvent()
  const [outcomes, setOutcomes] = useState<Record<string, NotifyOutcome>>({})

  // Sự kiện gửi thẳng cho người dùng (vd. đặt lại mật khẩu) luôn gửi, không bật/tắt ở đây
  const events = useMemo(() => (eventsQuery.data ?? []).filter((e) => e.recipientGroup !== 'user'), [eventsQuery.data])
  const categories = useMemo(() => groupByCategory(events), [events])
  const map = useMemo(() => {
    const m = toSettingMap(settings)
    toSettingMap(storageQuery.data).forEach((value, key) => m.set(key, value))
    return m
  }, [settings, storageQuery.data])

  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: toFormValues(map, events) })
  const businessHoursOnly = form.watch('businessHoursOnly')

  // Chỉ nạp lại khi giá trị của form này trên máy chủ thay đổi (lưu tab khác không xoá thay đổi đang sửa)
  const savedKey = JSON.stringify(toFormValues(map, events))
  useEffect(() => {
    form.reset(JSON.parse(savedKey) as FormValues)
  }, [savedKey, form])

  const onSubmit = async (values: FormValues) => {
    await saveSettings.mutateAsync(toItems(values))
  }

  const runTest = (code: string) =>
    triggerEvent.mutate(code, { onSuccess: (result) => setOutcomes((prev) => ({ ...prev, [code]: result })) })
  const testingCode = triggerEvent.isPending ? triggerEvent.variables : undefined

  const countByGroup = (group: string) => events.filter((e) => (e.recipientGroup || 'admin') === group).length

  const inputClass = 'bg-muted border-border text-foreground'

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6' noValidate>
        <div className='flex items-start gap-2 rounded border border-border bg-muted p-3 text-sm text-muted-foreground'>
          <Info className='w-4 h-4 mt-0.5 shrink-0 text-primary' />
          <div className='space-y-1'>
            <p>
              Máy chủ tự động gửi email khi sự kiện hệ thống xảy ra, theo các quy tắc dưới đây (khoá{' '}
              <code>email.notify.*</code>) và nội dung ở tab <b>Mẫu email</b>. Mỗi email gửi tới nhóm người nhận của sự
              kiện kèm email quản trị viên, CC thêm danh sách CC.
            </p>
            <p>
              Sự kiện mặc định <b>tắt</b> cho tới khi được bật. Sự kiện mức <b>nghiêm trọng</b> luôn được gửi, kể cả ngoài
              giờ hành chính. Nút “Gửi thử” phát một sự kiện mẫu qua đúng các quy tắc <b>đã lưu</b> và cho biết lý do nếu
              không gửi.
            </p>
          </div>
        </div>

        <div className='grid grid-cols-2 gap-6'>
          {/* Loại thông báo */}
          <Card className='bg-card border-border p-6'>
            <h3 className='text-primary mb-4 flex items-center gap-2'>
              <Mail className='w-5 h-5' />
              Loại thông báo
            </h3>

            <ScrollArea className='h-[640px]'>
              <div className='space-y-3 pr-4'>
                {eventsQuery.isLoading && (
                  <div className='text-muted-foreground flex items-center gap-2 py-6 text-sm'>
                    <Loader2 className='h-4 w-4 animate-spin' /> Đang tải danh sách sự kiện...
                  </div>
                )}
                {eventsQuery.isError && (
                  <div className='flex items-center gap-3 py-6 text-sm'>
                    <span className='text-destructive'>Không tải được danh sách sự kiện.</span>
                    <Button type='button' variant='outline' size='sm' onClick={() => eventsQuery.refetch()}>
                      Thử lại
                    </Button>
                  </div>
                )}
                {categories.map(([category, items]) => (
                  <div key={category}>
                    <div className='text-sm text-primary mb-2 mt-3'>{category}</div>
                    {items.map((item) => {
                      const code = item.code ?? ''
                      const group = item.recipientGroup || 'admin'
                      const severity = item.defaultSeverity ?? ''
                      const outcome = outcomes[code]
                      return (
                        <FormField
                          key={code}
                          control={form.control}
                          name={`events.${code}`}
                          render={({ field }) => (
                            <FormItem className='py-2 px-3 bg-muted border border-border rounded mb-2 hover:bg-accent gap-1'>
                              <div className='flex items-center justify-between gap-3'>
                                <div className='min-w-0 space-y-1'>
                                  <FormLabel className='text-foreground text-sm cursor-pointer'>{item.name}</FormLabel>
                                  <div className='flex flex-wrap items-center gap-1'>
                                    <span className='text-muted-foreground font-mono text-xs'>{code}</span>
                                    <Badge
                                      variant='outline'
                                      className='border-primary/50 text-primary text-[10px]'
                                      title={`Người nhận: ${NOTIFY_PREFIX}recipient.${group} + quản trị viên`}
                                    >
                                      → {RECIPIENT_GROUP_LABEL[group] ?? group}
                                    </Badge>
                                    {severity && (
                                      <Badge
                                        variant='outline'
                                        className={`text-[10px] ${SEVERITY_CLASS[severity] ?? 'border-border text-muted-foreground'}`}
                                      >
                                        {SEVERITY_LABEL[severity] ?? severity}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <div className='flex shrink-0 items-center gap-2'>
                                  <Button
                                    type='button'
                                    variant='ghost'
                                    size='sm'
                                    title='Phát thử sự kiện qua quy tắc đã lưu'
                                    className='text-primary hover:text-primary/80 hover:bg-accent h-7 px-2 text-xs'
                                    disabled={testingCode === code}
                                    onClick={() => runTest(code)}
                                  >
                                    {testingCode === code ? (
                                      <Loader2 className='w-3.5 h-3.5 animate-spin' />
                                    ) : (
                                      <Send className='w-3.5 h-3.5' />
                                    )}
                                    Gửi thử
                                  </Button>
                                  <FormControl>
                                    <Switch
                                      checked={field.value ?? false}
                                      onCheckedChange={field.onChange}
                                      className='data-[state=checked]:bg-primary'
                                    />
                                  </FormControl>
                                </div>
                              </div>
                              {outcome && (
                                <p className={`text-xs ${outcome.sent ? 'text-green-400' : 'text-yellow-500'}`}>
                                  {outcome.sent ? 'Đã gửi' : 'Không gửi'}
                                  {outcome.reason ? `: ${outcome.reason}` : ''}
                                </p>
                              )}
                            </FormItem>
                          )}
                        />
                      )
                    })}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>

          <div className='space-y-6'>
            {/* Người nhận mặc định */}
            <Card className='bg-card border-border p-6'>
              <h3 className='text-primary mb-4'>Người nhận theo nhóm</h3>

              <div className='space-y-4'>
                {RECIPIENT_FIELDS.map((f) => (
                  <FormField
                    key={f.name}
                    control={form.control}
                    name={f.name}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-foreground'>
                          {f.label}
                          <span className='text-muted-foreground text-xs font-normal'>
                            {f.group === 'admin'
                              ? '(nhận mọi email sự kiện)'
                              : `(${countByGroup(f.group)} sự kiện)`}
                          </span>
                        </FormLabel>
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
                      <FormLabel className='text-foreground'>Thời gian gộp sự kiện cùng loại (phút)</FormLabel>
                      <FormControl>
                        <Input type='number' min={0} placeholder='15' className={inputClass} {...field} />
                      </FormControl>
                      <p className='text-xs text-muted-foreground'>
                        Khi bật gộp: cùng sự kiện trong khoảng này chỉ gửi một email (tránh spam)
                      </p>
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
                      <FormLabel className='text-foreground'>Chỉ gửi trong giờ hành chính (T2–T6)</FormLabel>
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
                <p className='text-xs text-muted-foreground'>Sự kiện nghiêm trọng luôn được gửi ngay, không theo giờ.</p>
              </div>
            </Card>

            {/* Ngưỡng dung lượng */}
            <Card className='bg-card border-border p-6'>
              <h3 className='text-primary mb-4 flex items-center gap-2'>
                <HardDrive className='w-5 h-5' />
                Ngưỡng cảnh báo dung lượng lưu trữ
              </h3>
              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='storageWarningPercent'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-foreground text-sm'>Cảnh báo khi dùng (%)</FormLabel>
                      <FormControl>
                        <Input type='number' min={1} max={100} placeholder='80' className={inputClass} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='storageFullPercent'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-foreground text-sm'>Báo đầy khi dùng (%)</FormLabel>
                      <FormControl>
                        <Input type='number' min={1} max={100} placeholder='95' className={inputClass} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <p className='text-xs text-muted-foreground mt-3'>
                Hệ thống kiểm tra các điểm lưu trữ định kỳ và phát sự kiện “Cảnh báo dung lượng” / “Dung lượng đầy” khi
                vượt ngưỡng.
              </p>
            </Card>
          </div>
        </div>

        <div className='flex justify-end gap-3 pt-4 border-t border-border'>
          <Button
            type='button'
            variant='outline'
            className='border-border text-muted-foreground hover:bg-accent'
            disabled={!form.formState.isDirty}
            onClick={() => form.reset(toFormValues(map, events))}
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
