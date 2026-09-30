import { useEffect, useMemo, useRef, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  type EmailTemplate,
  type EmailTemplateRequest,
  RECIPIENT_GROUP_LABEL,
  type SystemEvent,
  useCreateEmailTemplate,
  useSystemEvents,
  useUpdateEmailTemplate,
} from '../../api/email-templates'
import { EmailTemplatePreview } from './email-template-preview'

const schema = z.object({
  code: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập mã mẫu')
    .max(100, 'Tối đa 100 ký tự')
    .regex(/^[A-Za-z0-9_.-]+$/, "Chỉ gồm chữ, số, '-', '_', '.'"),
  name: z.string().trim().min(1, 'Vui lòng nhập tên mẫu').max(255, 'Tối đa 255 ký tự'),
  subject: z.string().trim().min(1, 'Vui lòng nhập tiêu đề').max(500, 'Tối đa 500 ký tự'),
  body: z.string().min(1, 'Vui lòng nhập nội dung').max(200000, 'Tối đa 200.000 ký tự'),
  isHtml: z.boolean(),
  description: z.string().trim().max(500, 'Tối đa 500 ký tự'),
  isActive: z.boolean(),
})

type FormValues = z.infer<typeof schema>
type TextField = 'subject' | 'body'

const inputClass = 'bg-muted border-border text-foreground'

const EMPTY: FormValues = {
  code: '',
  name: '',
  subject: '[{{app_name}}] {{title}}',
  body: '<p>{{title}}</p>\n<p>{{message}}</p>\n<p>Thời điểm: {{time}}</p>',
  isHtml: true,
  description: '',
  isActive: true,
}

// Biến có trong mọi sự kiện (app_name, title, message, time...)
const commonVariables = (events: SystemEvent[]) => {
  const keys = events.map((e) => Object.keys(e.variables ?? {}))
  if (keys.length === 0) return ['app_name', 'event_code', 'event_name', 'severity', 'title', 'message', 'time', 'server']
  return keys.reduce((acc, k) => acc.filter((x) => k.includes(x)))
}

type EmailTemplateEditorDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  template?: EmailTemplate | null
}

export function EmailTemplateEditorDialog({ open, onOpenChange, template }: EmailTemplateEditorDialogProps) {
  const isEdit = !!template?.id
  const isSystem = !!template?.isSystem
  const { data: events = [] } = useSystemEvents()
  const createTemplate = useCreateEmailTemplate()
  const updateTemplate = useUpdateEmailTemplate()

  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: EMPTY })
  const subjectRef = useRef<HTMLInputElement | null>(null)
  const bodyRef = useRef<HTMLTextAreaElement | null>(null)
  const [lastFocused, setLastFocused] = useState<TextField>('body')

  useEffect(() => {
    if (!open) return
    form.reset(
      template
        ? {
            code: template.code ?? '',
            name: template.name ?? '',
            subject: template.subject ?? '',
            body: template.body ?? '',
            isHtml: template.isHtml ?? true,
            description: template.description ?? '',
            isActive: template.isActive ?? true,
          }
        : EMPTY
    )
  }, [open, template, form])

  const [code, subject, body, isHtml] = form.watch(['code', 'subject', 'body', 'isHtml'])
  const event = useMemo(
    () => events.find((e) => e.code?.toLowerCase() === code.trim().toLowerCase()),
    [events, code]
  )
  const common = useMemo(() => commonVariables(events), [events])
  const eventVariables = useMemo(
    () => Object.keys(event?.variables ?? {}).filter((v) => !common.includes(v)),
    [event, common]
  )

  // Chèn {{bien}} vào vị trí con trỏ của ô tiêu đề/nội dung được focus gần nhất
  const insertVariable = (name: string) => {
    const token = `{{${name}}}`
    const el = lastFocused === 'subject' ? subjectRef.current : bodyRef.current
    const current = form.getValues(lastFocused)
    const start = el?.selectionStart ?? current.length
    const end = el?.selectionEnd ?? current.length
    form.setValue(lastFocused, current.slice(0, start) + token + current.slice(end), {
      shouldDirty: true,
      shouldValidate: true,
    })
    requestAnimationFrame(() => {
      if (!el) return
      el.focus()
      el.setSelectionRange(start + token.length, start + token.length)
    })
  }

  const onSubmit = async (values: FormValues) => {
    const data: EmailTemplateRequest = {
      code: values.code,
      name: values.name,
      subject: values.subject,
      body: values.body,
      isHtml: values.isHtml,
      description: values.description || null,
      isActive: values.isActive,
    }
    if (isEdit && template?.id) await updateTemplate.mutateAsync({ id: template.id, data })
    else await createTemplate.mutateAsync(data)
    onOpenChange(false)
  }

  const isPending = createTemplate.isPending || updateTemplate.isPending

  const chip = (name: string) => (
    <button
      key={name}
      type='button'
      onClick={() => insertVariable(name)}
      title={`Chèn {{${name}}}`}
      className='rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground hover:border-primary hover:text-primary'
    >
      {`{{${name}}}`}
    </button>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='bg-card border-border text-foreground max-h-[92vh] overflow-y-auto sm:max-w-6xl'>
        <DialogHeader>
          <DialogTitle className='text-primary'>{isEdit ? 'Chỉnh sửa mẫu email' : 'Thêm mẫu email'}</DialogTitle>
          <DialogDescription className='text-muted-foreground'>
            Dùng biến dạng <code>{'{{ten_bien}}'}</code>; giá trị được mã hoá HTML khi gửi. Mẫu có mã trùng mã sự kiện sẽ
            được dùng khi sự kiện đó xảy ra.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4' noValidate>
            <div className='grid grid-cols-2 gap-6'>
              <div className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='code'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-foreground'>Mã mẫu / mã sự kiện *</FormLabel>
                        <FormControl>
                          <Input
                            list='email-event-codes'
                            placeholder='storage-warning'
                            disabled={isSystem}
                            className={`${inputClass} font-mono`}
                            {...field}
                          />
                        </FormControl>
                        <datalist id='email-event-codes'>
                          {events.map((e) => (
                            <option key={e.code} value={e.code ?? ''}>
                              {e.name}
                            </option>
                          ))}
                        </datalist>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='name'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-foreground'>Tên mẫu *</FormLabel>
                        <FormControl>
                          <Input placeholder='Cảnh báo dung lượng' className={inputClass} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className='text-xs text-muted-foreground'>
                  {event ? (
                    <span className='inline-flex flex-wrap items-center gap-1'>
                      Sự kiện: <span className='text-foreground'>{event.name}</span>
                      <Badge variant='outline' className='border-primary/50 text-primary text-[10px]'>
                        {event.category}
                      </Badge>
                      <Badge variant='outline' className='border-border text-muted-foreground text-[10px]'>
                        → {RECIPIENT_GROUP_LABEL[event.recipientGroup ?? ''] ?? event.recipientGroup}
                      </Badge>
                    </span>
                  ) : (
                    'Mã không trùng sự kiện hệ thống nào: mẫu chỉ dùng khi gửi thử hoặc do module khác gọi theo mã.'
                  )}
                </div>

                <FormField
                  control={form.control}
                  name='subject'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-foreground'>Tiêu đề *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          ref={(el) => {
                            field.ref(el)
                            subjectRef.current = el
                          }}
                          onFocus={() => setLastFocused('subject')}
                          className={inputClass}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className='space-y-1.5'>
                  <div className='text-xs text-muted-foreground'>
                    Bấm để chèn biến vào {lastFocused === 'subject' ? 'tiêu đề' : 'nội dung'}:
                  </div>
                  <div className='flex flex-wrap gap-1'>{common.map(chip)}</div>
                  {eventVariables.length > 0 && <div className='flex flex-wrap gap-1'>{eventVariables.map(chip)}</div>}
                </div>

                <FormField
                  control={form.control}
                  name='body'
                  render={({ field }) => (
                    <FormItem>
                      <div className='flex items-center justify-between'>
                        <FormLabel className='text-foreground'>Nội dung *</FormLabel>
                        <FormField
                          control={form.control}
                          name='isHtml'
                          render={({ field: htmlField }) => (
                            <FormItem className='flex items-center gap-2'>
                              <FormLabel className='text-muted-foreground text-xs'>HTML</FormLabel>
                              <FormControl>
                                <Switch
                                  checked={htmlField.value}
                                  onCheckedChange={htmlField.onChange}
                                  className='data-[state=checked]:bg-primary'
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormControl>
                        <Textarea
                          {...field}
                          ref={(el) => {
                            field.ref(el)
                            bodyRef.current = el
                          }}
                          onFocus={() => setLastFocused('body')}
                          rows={16}
                          spellCheck={false}
                          className={`${inputClass} min-h-[320px] font-mono text-xs`}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='description'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-foreground'>Mô tả</FormLabel>
                      <FormControl>
                        <Input className={inputClass} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='isActive'
                  render={({ field }) => (
                    <FormItem className='flex items-center justify-between rounded border border-border bg-muted px-3 py-2'>
                      <FormLabel className='text-foreground'>Kích hoạt</FormLabel>
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
              </div>

              <EmailTemplatePreview subject={subject} body={body} isHtml={isHtml} code={code} />
            </div>

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                className='border-border text-muted-foreground hover:bg-accent'
                onClick={() => onOpenChange(false)}
              >
                Hủy
              </Button>
              <Button
                type='submit'
                className='bg-primary hover:bg-primary/90 text-primary-foreground'
                disabled={isPending}
              >
                {isPending ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Thêm mẫu'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
