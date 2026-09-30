import { useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  type WorkflowDetail,
  type WorkflowListItem,
  WORKFLOW_USAGES,
  useCreateWorkflow,
  useUpdateWorkflow,
} from '../../api/workflows'

const NO_USAGE = 'none'

const schema = z.object({
  name: z.string().trim().min(1, 'Vui lòng nhập tên quy trình').max(255, 'Tối đa 255 ký tự'),
  description: z.string().max(500, 'Tối đa 500 ký tự'),
  isActive: z.boolean(),
  usageKey: z.string(),
})

type FormValues = z.infer<typeof schema>

type WorkflowFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  // Quy trình cần sửa thông tin; null = tạo mới
  workflow?: WorkflowListItem | null
  onCreated?: (created: WorkflowDetail) => void
}

export function WorkflowFormDialog({ open, onOpenChange, workflow, onCreated }: WorkflowFormDialogProps) {
  const isEdit = !!workflow
  const createWorkflow = useCreateWorkflow()
  const updateWorkflow = useUpdateWorkflow()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '', isActive: true, usageKey: NO_USAGE },
  })

  useEffect(() => {
    if (!open) return
    form.reset({
      name: workflow?.name ?? '',
      description: workflow?.description ?? '',
      isActive: workflow?.isActive ?? true,
      usageKey: workflow?.usageKey || NO_USAGE,
    })
  }, [open, workflow, form])

  const onSubmit = async (values: FormValues) => {
    const data = {
      name: values.name,
      description: values.description.trim() || null,
      isActive: values.isActive,
      usageKey: values.usageKey === NO_USAGE ? '' : values.usageKey,
    }
    if (isEdit) {
      await updateWorkflow.mutateAsync({ id: workflow.id, data })
    } else {
      const created = await createWorkflow.mutateAsync(data)
      onCreated?.(created)
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle className='text-primary'>{isEdit ? 'Sửa thông tin quy trình' : 'Tạo quy trình mới'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='grid gap-4' noValidate>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên quy trình *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='vd: Quy trình duyệt tin' />
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
                    <Textarea {...field} className='min-h-20' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='usageKey'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dùng cho</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className='w-full'>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={NO_USAGE}>Không gán</SelectItem>
                      {WORKFLOW_USAGES.map((u) => (
                        <SelectItem key={u.value} value={u.value}>
                          {u.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className='text-muted-foreground text-xs'>
                    Nội dung mới thuộc loại này sẽ chạy theo quy trình. Mỗi loại chỉ gán cho một quy trình đang hoạt động.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='isActive'
              render={({ field }) => (
                <FormItem className='flex items-center gap-3'>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className='!mt-0'>Hoạt động</FormLabel>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
                Huỷ
              </Button>
              <Button type='submit' disabled={createWorkflow.isPending || updateWorkflow.isPending}>
                {isEdit ? 'Lưu' : 'Tạo và thiết kế'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
