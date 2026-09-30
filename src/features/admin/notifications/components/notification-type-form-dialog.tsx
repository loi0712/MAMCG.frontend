import { useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  type NotificationTypeListItem,
  useCreateNotificationType,
  useNotificationType,
  useUpdateNotificationType,
} from '../../api/notification-types'

const schema = z.object({
  name: z.string().trim().min(1, 'Vui lòng nhập tên loại thông báo').max(255, 'Tên tối đa 255 ký tự'),
  description: z.string().trim().max(500, 'Mô tả tối đa 500 ký tự'),
  inAppTemplate: z.string().trim().max(4000, 'Mẫu tối đa 4000 ký tự'),
  emailSubject: z.string().trim().max(255, 'Tiêu đề tối đa 255 ký tự'),
})

type FormValues = z.infer<typeof schema>

type NotificationTypeFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  // null = thêm mới
  type: NotificationTypeListItem | null
}

const EMPTY: FormValues = { name: '', description: '', inAppTemplate: '', emailSubject: '' }

export function NotificationTypeFormDialog({ open, onOpenChange, type }: NotificationTypeFormDialogProps) {
  const isEdit = !!type
  const { data: detail, isLoading } = useNotificationType(open && type ? type.id : undefined)
  const create = useCreateNotificationType()
  const update = useUpdateNotificationType()
  const pending = create.isPending || update.isPending

  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: EMPTY })

  useEffect(() => {
    if (!open) return
    form.reset(
      detail && isEdit
        ? {
            name: detail.name,
            description: detail.description ?? '',
            inAppTemplate: detail.inAppTemplate ?? '',
            emailSubject: detail.emailSubject ?? '',
          }
        : { ...EMPTY, name: type?.name ?? '', description: type?.description ?? '' }
    )
  }, [open, detail, isEdit, type, form])

  const onSubmit = async (values: FormValues) => {
    const data = {
      name: values.name,
      description: values.description || null,
      inAppTemplate: values.inAppTemplate || null,
      emailSubject: values.emailSubject || null,
      // Kênh email/SMS chưa dùng: giữ nguyên giá trị hiện có
      emailTemplate: detail?.emailTemplate ?? null,
      smsTemplate: detail?.smsTemplate ?? null,
    }
    if (isEdit) await update.mutateAsync({ id: type.id, data })
    else await create.mutateAsync(data)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-xl'>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Sửa loại thông báo' : 'Thêm loại thông báo'}</DialogTitle>
          <DialogDescription>
            Chọn loại thông báo ở bước chuyển quy trình để báo cho người được giao khi nội dung chuyển tới bước đó.
          </DialogDescription>
        </DialogHeader>

        {isEdit && isLoading ? (
          <Loader2 className='text-muted-foreground mx-auto my-8 h-6 w-6 animate-spin' />
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='grid gap-4' noValidate>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên loại thông báo</FormLabel>
                    <FormControl>
                      <Input placeholder='vd: Giao việc duyệt' {...field} />
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
                    <FormLabel>Mô tả</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='emailSubject'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tiêu đề thông báo</FormLabel>
                    <FormControl>
                      <Input placeholder='Bỏ trống để dùng tên loại thông báo' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='inAppTemplate'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mẫu nội dung</FormLabel>
                    <FormControl>
                      <Textarea rows={4} placeholder='Bạn được giao xử lý "{{item}}" ở bước {{status}}.' {...field} />
                    </FormControl>
                    <FormDescription>
                      Biến: {'{{item}}'} (mã nội dung), {'{{workflow}}'}, {'{{status}}'}, {'{{deadline}}'}. Bỏ trống để dùng câu mặc định.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
                  Huỷ
                </Button>
                <Button type='submit' disabled={pending}>
                  {pending && <Loader2 className='h-4 w-4 animate-spin' />}
                  {isEdit ? 'Lưu' : 'Thêm'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
