import { useEffect, useMemo, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ALL_ITEMS } from '../../api/common'
import { NOTIFICATION_SEVERITIES, useSendNotification } from '../../api/notifications'
import { useUsers } from '../../api/users'

const SEVERITY_LABELS = { info: 'Thông tin', success: 'Thành công', warning: 'Cảnh báo', error: 'Lỗi' } as const

// Giới hạn như backend (SendNotificationCommandHandler)
const schema = z.object({
  toUserIds: z.array(z.string()).min(1, 'Cần chọn ít nhất một người nhận').max(1000, 'Tối đa 1000 người nhận'),
  subject: z.string().trim().max(255, 'Tiêu đề tối đa 255 ký tự'),
  message: z.string().trim().min(1, 'Vui lòng nhập nội dung').max(4000, 'Nội dung tối đa 4000 ký tự'),
  url: z.string().trim().max(500, 'Đường dẫn tối đa 500 ký tự'),
  severity: z.enum(NOTIFICATION_SEVERITIES),
})

type FormValues = z.infer<typeof schema>

type SendNotificationDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SendNotificationDialog({ open, onOpenChange }: SendNotificationDialogProps) {
  const [filter, setFilter] = useState('')
  const { data: usersData, isLoading: usersLoading } = useUsers(ALL_ITEMS)
  const send = useSendNotification()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { toUserIds: [], subject: '', message: '', url: '', severity: 'info' },
  })

  useEffect(() => {
    if (!open) return
    setFilter('')
    form.reset({ toUserIds: [], subject: '', message: '', url: '', severity: 'info' })
  }, [open, form])

  const allUsers = useMemo(() => (usersData?.users ?? []).filter((u) => u.isActive), [usersData])
  const users = useMemo(() => {
    const term = filter.trim().toLowerCase()
    return term
      ? allUsers.filter((u) => `${u.fullName} ${u.username} ${u.email}`.toLowerCase().includes(term))
      : allUsers
  }, [allUsers, filter])

  const onSubmit = async (values: FormValues) => {
    await send.mutateAsync({
      toUserIds: values.toUserIds,
      subject: values.subject || null,
      message: values.message,
      url: values.url || null,
      severity: values.severity,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>Gửi thông báo</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='grid gap-4' noValidate>
            <FormField
              control={form.control}
              name='toUserIds'
              render={({ field }) => {
                const visibleIds = users.map((u) => u.id)
                const allVisibleChecked = visibleIds.length > 0 && visibleIds.every((id) => field.value.includes(id))
                return (
                  <FormItem>
                    <div className='flex items-center justify-between'>
                      <FormLabel>Người nhận ({field.value.length})</FormLabel>
                      <Button
                        type='button'
                        variant='link'
                        size='sm'
                        className='h-auto p-0'
                        disabled={visibleIds.length === 0}
                        onClick={() =>
                          field.onChange(
                            allVisibleChecked
                              ? field.value.filter((id) => !visibleIds.includes(id))
                              : [...new Set([...field.value, ...visibleIds])]
                          )
                        }
                      >
                        {allVisibleChecked ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                      </Button>
                    </div>
                    <Input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder='Lọc người dùng...' />
                    <ScrollArea className='h-40 rounded-md border'>
                      <div className='space-y-1 p-2'>
                        {users.map((u) => (
                          <Label
                            key={u.id}
                            className='hover:bg-accent flex cursor-pointer items-center gap-3 rounded px-2 py-1.5 font-normal'
                          >
                            <Checkbox
                              checked={field.value.includes(u.id)}
                              onCheckedChange={(value) =>
                                field.onChange(
                                  value === true ? [...field.value, u.id] : field.value.filter((id) => id !== u.id)
                                )
                              }
                            />
                            <span>{u.fullName || u.username}</span>
                            <span className='text-muted-foreground text-xs'>{u.username}</span>
                          </Label>
                        ))}
                        {users.length === 0 && (
                          <p className='text-muted-foreground p-2 text-sm'>
                            {usersLoading ? 'Đang tải...' : 'Không có người dùng'}
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                    <FormMessage />
                  </FormItem>
                )
              }}
            />

            <div className='grid grid-cols-[1fr_auto] gap-4'>
              <FormField
                control={form.control}
                name='subject'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tiêu đề</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='Để trống: "Thông báo hệ thống"' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='severity'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mức độ</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className='w-36'>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {NOTIFICATION_SEVERITIES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {SEVERITY_LABELS[s]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='message'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nội dung</FormLabel>
                  <FormControl>
                    <Textarea rows={4} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='url'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Đường dẫn (tuỳ chọn)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='/admin/logs hoặc https://...' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
                Huỷ
              </Button>
              <Button type='submit' disabled={send.isPending}>
                Gửi
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
