import { useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { HardDrive, Loader2, RotateCcw, Save } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { BACKUP_DAYS, type BackupConfig, type BackupDatabase, useSaveBackupConfig } from '../../api/backup'

const schema = z.object({
  enabled: z.boolean(),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Giờ chạy theo định dạng HH:mm'),
  days: z.array(z.string()),
  path: z
    .string()
    .trim()
    .max(500, 'Tối đa 500 ký tự')
    .refine((v) => !/['";]/.test(v), 'Không được chứa dấu nháy hoặc dấu chấm phẩy'),
  retentionDays: z
    .string()
    .regex(/^\d+$/, 'Nhập số ngày (0 = giữ vĩnh viễn)')
    .refine((v) => Number(v) <= 3650, 'Tối đa 3650 ngày'),
  compression: z.boolean(),
  copyOnly: z.boolean(),
  verify: z.boolean(),
  databases: z.array(z.string()),
})

type FormValues = z.infer<typeof schema>

const EMPTY: FormValues = {
  enabled: false,
  time: '02:00',
  days: [],
  path: '',
  retentionDays: '7',
  compression: true,
  copyOnly: true,
  verify: false,
  databases: [],
}

const toFormValues = (config: BackupConfig): FormValues => ({
  enabled: config.enabled ?? false,
  time: config.time ?? '02:00',
  days: config.days ?? [],
  path: config.path ?? '',
  retentionDays: String(config.retentionDays ?? 7),
  compression: config.compression ?? true,
  copyOnly: config.copyOnly ?? true,
  verify: config.verify ?? false,
  databases: config.databases ?? [],
})

const inputClass = 'bg-muted border-border text-foreground'

const toggleItem = (list: string[], value: string) =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value]

const OPTIONS: {
  name: 'compression' | 'copyOnly' | 'verify'
  label: string
  hint: string
}[] = [
  {
    name: 'compression',
    label: 'Nén bản backup',
    hint: 'BACKUP ... WITH COMPRESSION, giảm dung lượng file',
  },
  {
    name: 'copyOnly',
    label: 'Copy-only',
    hint: 'Không ảnh hưởng chuỗi backup differential/log do DBA quản lý',
  },
  {
    name: 'verify',
    label: 'Kiểm tra file sau khi backup',
    hint: 'RESTORE VERIFYONLY, lâu hơn nhưng an toàn hơn',
  },
]

type BackupConfigFormProps = {
  config?: BackupConfig
  databases: BackupDatabase[]
  isLoading: boolean
}

export function BackupConfigForm({ config, databases, isLoading }: BackupConfigFormProps) {
  const saveConfig = useSaveBackupConfig()
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: EMPTY,
  })

  useEffect(() => {
    if (config) form.reset(toFormValues(config))
  }, [config, form])

  const enabled = form.watch('enabled')
  const days = form.watch('days')
  const selectedDbs = form.watch('databases')

  const onSubmit = async (values: FormValues) => {
    await saveConfig.mutateAsync({
      enabled: values.enabled,
      time: values.time,
      // Giữ thứ tự T2 → CN
      days: BACKUP_DAYS.map((d) => d.value).filter((d) => values.days.includes(d)),
      path: values.path || null,
      retentionDays: Number(values.retentionDays),
      compression: values.compression,
      copyOnly: values.copyOnly,
      verify: values.verify,
      databases: values.databases,
    })
  }

  const scheduleText = !enabled
    ? 'Lịch backup tự động đang tắt'
    : days.length === 0 || days.length === 7
      ? 'Chạy hằng ngày'
      : `Chạy vào ${BACKUP_DAYS.filter((d) => days.includes(d.value))
          .map((d) => d.full)
          .join(', ')}`

  return (
    <Card className='bg-card border-border gap-0 p-6'>
      <div className='mb-4 flex items-center justify-between gap-2'>
        <h3 className='text-primary flex items-center gap-2'>
          <HardDrive className='h-5 w-5' />
          Cấu hình backup tự động
        </h3>
        {isLoading && <Loader2 className='text-muted-foreground h-4 w-4 animate-spin' />}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-5'>
          <FormField
            control={form.control}
            name='enabled'
            render={({ field }) => (
              <FormItem className='bg-muted/40 border-border flex items-center justify-between rounded-md border p-3'>
                <div>
                  <FormLabel className='text-foreground'>Kích hoạt backup tự động</FormLabel>
                  <FormDescription className='text-xs'>{scheduleText}</FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />

          <div className='grid gap-5 lg:grid-cols-2'>
            {/* Lịch chạy */}
            <div className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='time'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-foreground'>Giờ chạy (giờ Việt Nam)</FormLabel>
                      <FormControl>
                        <Input type='time' className={inputClass} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='retentionDays'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-foreground'>Giữ lại bản backup (ngày)</FormLabel>
                      <FormControl>
                        <Input type='number' min={0} max={3650} inputMode='numeric' className={inputClass} {...field} />
                      </FormControl>
                      <FormDescription className='text-xs'>0 = giữ vĩnh viễn</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='days'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-foreground'>Ngày chạy</FormLabel>
                    <div className='flex flex-wrap gap-2'>
                      {BACKUP_DAYS.map((day) => {
                        const active = field.value.includes(day.value)
                        return (
                          <Button
                            key={day.value}
                            type='button'
                            variant='outline'
                            size='sm'
                            title={day.full}
                            aria-pressed={active}
                            onClick={() => field.onChange(toggleItem(field.value, day.value))}
                            className={cn(
                              'border-border h-8 w-11',
                              active
                                ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
                                : 'text-foreground hover:bg-accent'
                            )}
                          >
                            {day.label}
                          </Button>
                        )
                      })}
                      {field.value.length > 0 && (
                        <Button
                          type='button'
                          variant='ghost'
                          size='sm'
                          className='text-muted-foreground h-8'
                          onClick={() => field.onChange([])}
                        >
                          <RotateCcw className='mr-1 h-3.5 w-3.5' />
                          Hằng ngày
                        </Button>
                      )}
                    </div>
                    <FormDescription className='text-xs'>Không chọn ngày nào = chạy hằng ngày</FormDescription>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='path'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-foreground'>Thư mục lưu backup</FormLabel>
                    <FormControl>
                      <Input placeholder='Thư mục backup mặc định của SQL Server' className={inputClass} {...field} />
                    </FormControl>
                    <FormDescription className='text-xs'>
                      Đường dẫn trên máy chủ SQL Server (không phải máy chủ API), vd. D:\Backup hoặc
                      /var/opt/mssql/backup. Để trống = thư mục mặc định.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='space-y-3'>
                {OPTIONS.map((option) => (
                  <FormField
                    key={option.name}
                    control={form.control}
                    name={option.name}
                    render={({ field }) => (
                      <FormItem className='flex items-center justify-between gap-4'>
                        <div>
                          <FormLabel className='text-foreground'>{option.label}</FormLabel>
                          <FormDescription className='text-xs'>{option.hint}</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </div>

            {/* CSDL cần backup */}
            <FormField
              control={form.control}
              name='databases'
              render={({ field }) => (
                <FormItem>
                  <div className='flex items-center justify-between'>
                    <FormLabel className='text-foreground'>CSDL cần backup</FormLabel>
                    <span className='text-muted-foreground text-xs'>
                      {selectedDbs.length === 0 ? 'Tất cả CSDL' : `Đã chọn ${selectedDbs.length}/${databases.length}`}
                    </span>
                  </div>
                  <div className='border-border divide-border max-h-80 divide-y overflow-y-auto rounded-md border'>
                    {databases.length === 0 && (
                      <div className='text-muted-foreground p-4 text-center text-sm'>
                        {isLoading ? 'Đang tải...' : 'Không có CSDL nào'}
                      </div>
                    )}
                    {databases.map((db) => {
                      const name = db.connectionName ?? ''
                      const checked = field.value.includes(name)
                      return (
                        <label key={name} className='hover:bg-accent flex cursor-pointer items-center gap-3 px-3 py-2'>
                          <Checkbox
                            checked={checked}
                            onCheckedChange={() => field.onChange(toggleItem(field.value, name))}
                          />
                          <div className='min-w-0'>
                            <div className='text-foreground text-sm'>{name}</div>
                            <div className='text-muted-foreground truncate font-mono text-xs'>
                              {db.databaseName ?? '—'} · {db.server ?? '—'}
                            </div>
                          </div>
                        </label>
                      )
                    })}
                  </div>
                  <FormDescription className='text-xs'>
                    Không chọn CSDL nào = backup tất cả CSDL của hệ thống.
                  </FormDescription>
                </FormItem>
              )}
            />
          </div>

          <div className='flex justify-end gap-3'>
            <Button
              type='button'
              variant='outline'
              className='border-border text-foreground hover:bg-accent'
              disabled={!form.formState.isDirty || saveConfig.isPending}
              onClick={() => form.reset(config ? toFormValues(config) : EMPTY)}
            >
              Hoàn tác
            </Button>
            <Button
              type='submit'
              className='bg-primary hover:bg-primary/90 text-primary-foreground'
              disabled={saveConfig.isPending || isLoading}
            >
              {saveConfig.isPending ? (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              ) : (
                <Save className='mr-2 h-4 w-4' />
              )}
              Lưu cấu hình
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  )
}
