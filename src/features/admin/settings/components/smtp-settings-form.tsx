import { useEffect, useMemo, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, CheckCircle, Lock, Mail, Send, Server } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  type ConnectionTestResult,
  EMAIL_KEYS,
  SECRET_MASK,
  type Setting,
  type SettingUpsertItem,
  toSettingMap,
  useSaveSettings,
  useSendTestEmail,
} from '../../api/settings'

const schema = z
  .object({
    host: z.string().trim().min(1, 'Vui lòng nhập SMTP host'),
    port: z
      .string()
      .trim()
      .regex(/^\d+$/, 'Cổng phải là số')
      .refine((v) => Number(v) >= 1 && Number(v) <= 65535, 'Cổng từ 1 đến 65535'),
    enableSsl: z.boolean(),
    enableAuth: z.boolean(),
    username: z.string().trim(),
    password: z.string(),
    fromName: z.string().trim().min(1, 'Vui lòng nhập tên người gửi'),
    fromAddress: z.email('Email người gửi không hợp lệ'),
  })
  .superRefine((v, ctx) => {
    if (v.enableAuth && !v.username) {
      ctx.addIssue({ code: 'custom', path: ['username'], message: 'Vui lòng nhập tên đăng nhập' })
    }
  })

type FormValues = z.infer<typeof schema>

const recipientSchema = z.email()

const toFormValues = (map: Map<string, string>): FormValues => ({
  host: map.get(EMAIL_KEYS.host) ?? '',
  port: map.get(EMAIL_KEYS.port) || '25',
  enableSsl: map.get(EMAIL_KEYS.enableSsl)?.toLowerCase() === 'true',
  enableAuth: !!map.get(EMAIL_KEYS.username),
  username: map.get(EMAIL_KEYS.username) ?? '',
  // Mật khẩu đã lưu bị che: để trống ô nhập, gửi lại chuỗi che khi lưu để giữ nguyên
  password: '',
  fromName: map.get(EMAIL_KEYS.fromName) ?? '',
  fromAddress: map.get(EMAIL_KEYS.fromAddress) ?? '',
})

type SmtpSettingsFormProps = {
  settings: Setting[]
}

export function SmtpSettingsForm({ settings }: SmtpSettingsFormProps) {
  const saveSettings = useSaveSettings()
  const sendTestEmail = useSendTestEmail()
  const [recipient, setRecipient] = useState('')
  const [recipientError, setRecipientError] = useState<string | null>(null)
  const [testResult, setTestResult] = useState<ConnectionTestResult | null>(null)

  const map = useMemo(() => toSettingMap(settings), [settings])
  const hasStoredPassword = map.get(EMAIL_KEYS.password) === SECRET_MASK

  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: toFormValues(map) })
  const enableAuth = form.watch('enableAuth')

  // Chỉ nạp lại khi giá trị của form này trên máy chủ thay đổi (lưu tab khác không xoá thay đổi đang sửa)
  const savedKey = JSON.stringify(toFormValues(map))
  useEffect(() => {
    form.reset(JSON.parse(savedKey) as FormValues)
  }, [savedKey, form])

  const buildItems = (v: FormValues): SettingUpsertItem[] => [
    { key: EMAIL_KEYS.host, value: v.host },
    { key: EMAIL_KEYS.port, value: v.port },
    { key: EMAIL_KEYS.enableSsl, value: String(v.enableSsl) },
    { key: EMAIL_KEYS.username, value: v.enableAuth ? v.username : '' },
    {
      key: EMAIL_KEYS.password,
      value: !v.enableAuth ? '' : v.password || (hasStoredPassword ? SECRET_MASK : ''),
    },
    { key: EMAIL_KEYS.fromName, value: v.fromName },
    { key: EMAIL_KEYS.fromAddress, value: v.fromAddress },
  ]

  // Sau khi lưu, ô mật khẩu trở về trống (máy chủ đã giữ giá trị, chỉ trả về chuỗi che)
  const save = async (values: FormValues) => {
    await saveSettings.mutateAsync(buildItems(values))
    form.reset({ ...values, password: '' })
  }

  const onSubmit = (values: FormValues) => save(values)

  // Backend gửi thử bằng cấu hình đã lưu: nếu form có thay đổi thì lưu trước rồi mới gửi
  const handleTestEmail = async () => {
    setTestResult(null)
    if (!recipientSchema.safeParse(recipient.trim()).success) {
      setRecipientError('Vui lòng nhập email nhận hợp lệ')
      return
    }
    setRecipientError(null)
    try {
      if (form.formState.isDirty) {
        if (!(await form.trigger())) return
        await save(schema.parse(form.getValues()))
      }
      setTestResult(await sendTestEmail.mutateAsync(recipient.trim()))
    } catch {
      // Lỗi HTTP đã được hiển thị bởi bộ xử lý lỗi chung
    }
  }

  const isSending = sendTestEmail.isPending

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6' noValidate>
        <div className='grid grid-cols-2 gap-6'>
          {/* Máy chủ SMTP */}
          <Card className='bg-card border-border p-6'>
            <h3 className='text-primary mb-4 flex items-center gap-2'>
              <Server className='w-5 h-5' />
              Máy chủ SMTP
            </h3>

            <div className='space-y-4'>
              <FormField
                control={form.control}
                name='host'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-foreground'>SMTP Host *</FormLabel>
                    <FormControl>
                      <Input placeholder='smtp.gmail.com' className='bg-muted border-border text-foreground' {...field} />
                    </FormControl>
                    <FormDescription className='text-xs'>Địa chỉ máy chủ SMTP</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='port'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-foreground'>Cổng (Port) *</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        placeholder='587'
                        className='bg-muted border-border text-foreground'
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className='text-xs'>Thường dùng 587 (STARTTLS) hoặc 25</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='enableSsl'
                render={({ field }) => (
                  <FormItem className='flex items-center justify-between pt-2 pb-2 border-t border-border'>
                    <div className='flex items-center gap-2'>
                      <Lock className='w-4 h-4 text-primary' />
                      <FormLabel className='text-foreground'>Sử dụng SSL/TLS</FormLabel>
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
                name='enableAuth'
                render={({ field }) => (
                  <FormItem className='flex items-center justify-between pb-2'>
                    <FormLabel className='text-foreground'>Yêu cầu xác thực</FormLabel>
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

              {enableAuth && (
                <>
                  <FormField
                    control={form.control}
                    name='username'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-foreground'>Tên đăng nhập *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='user@example.com'
                            autoComplete='off'
                            className='bg-muted border-border text-foreground'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='password'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-foreground'>Mật khẩu</FormLabel>
                        <FormControl>
                          <Input
                            type='password'
                            autoComplete='new-password'
                            placeholder={hasStoredPassword ? 'Đã lưu — để trống nếu giữ nguyên' : '••••••••••••'}
                            className='bg-muted border-border text-foreground'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </div>
          </Card>

          <div className='space-y-6'>
            {/* Thông tin người gửi */}
            <Card className='bg-card border-border p-6'>
              <h3 className='text-primary mb-4 flex items-center gap-2'>
                <Mail className='w-5 h-5' />
                Thông tin người gửi
              </h3>

              <div className='space-y-4'>
                <FormField
                  control={form.control}
                  name='fromName'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-foreground'>Tên người gửi *</FormLabel>
                      <FormControl>
                        <Input placeholder='MAMCG System' className='bg-muted border-border text-foreground' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='fromAddress'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-foreground'>Email người gửi *</FormLabel>
                      <FormControl>
                        <Input
                          type='email'
                          placeholder='noreply@mamcg.vn'
                          className='bg-muted border-border text-foreground'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Card>

            {/* Gửi email thử */}
            <Card className='bg-card border-border p-6'>
              <h3 className='text-primary mb-4 flex items-center gap-2'>
                <Send className='w-5 h-5' />
                Kiểm tra kết nối
              </h3>

              <div className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='test-email-recipient' className='text-foreground'>
                    Email nhận thử nghiệm
                  </Label>
                  <Input
                    id='test-email-recipient'
                    type='email'
                    placeholder='test@example.com'
                    className='bg-muted border-border text-foreground'
                    value={recipient}
                    onChange={(e) => {
                      setRecipient(e.target.value)
                      setRecipientError(null)
                    }}
                  />
                  {recipientError && <p className='text-destructive text-sm'>{recipientError}</p>}
                  {form.formState.isDirty && (
                    <p className='text-xs text-muted-foreground'>
                      Cấu hình đang có thay đổi chưa lưu: hệ thống sẽ lưu trước rồi mới gửi thử.
                    </p>
                  )}
                </div>

                <Button
                  type='button'
                  onClick={handleTestEmail}
                  disabled={isSending || saveSettings.isPending}
                  className='w-full bg-primary hover:bg-primary/90 text-primary-foreground'
                >
                  {isSending ? (
                    <>
                      <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2' />
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <Send className='w-4 h-4 mr-2' />
                      {form.formState.isDirty ? 'Lưu và gửi email thử nghiệm' : 'Gửi email thử nghiệm'}
                    </>
                  )}
                </Button>

                {testResult?.success && (
                  <div className='bg-green-900/20 border border-green-500 rounded p-3 text-sm text-green-600 flex gap-2'>
                    <CheckCircle className='w-4 h-4 mt-0.5 shrink-0' />
                    <span>
                      {testResult.message ?? 'Email đã được gửi thành công.'} Vui lòng kiểm tra hộp thư đến.
                    </span>
                  </div>
                )}

                {testResult && !testResult.success && (
                  <div className='bg-red-900/20 border border-red-500 rounded p-3 text-sm text-destructive flex gap-2'>
                    <AlertCircle className='w-4 h-4 mt-0.5 shrink-0' />
                    <span>{testResult.message ?? 'Không thể gửi email. Vui lòng kiểm tra lại cấu hình SMTP.'}</span>
                  </div>
                )}
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
