import { useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { type CategoryGroupListItem, useCreateCategoryGroup, useUpdateCategoryGroup } from '../api/manage'

const schema = z.object({
  name: z.string().trim().min(1, 'Tên nhóm chuyên mục là bắt buộc.').max(255, 'Tối đa 255 ký tự'),
  description: z.string().max(500, 'Tối đa 500 ký tự'),
})

type FormValues = z.infer<typeof schema>

type CategoryGroupFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  // Nhóm cần sửa; null = thêm mới
  group: CategoryGroupListItem | null
}

export function CategoryGroupFormDialog({ open, onOpenChange, group }: CategoryGroupFormDialogProps) {
  const isEdit = group != null
  const createGroup = useCreateCategoryGroup()
  const updateGroup = useUpdateCategoryGroup()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '' },
  })

  useEffect(() => {
    if (open) form.reset({ name: group?.name ?? '', description: group?.description ?? '' })
  }, [open, group, form])

  const onSubmit = async (values: FormValues) => {
    const data = { name: values.name, description: values.description.trim() }
    try {
      if (isEdit) await updateGroup.mutateAsync({ id: group.id, data })
      else await createGroup.mutateAsync(data)
      onOpenChange(false)
    } catch {
      // Lỗi đã được thông báo chung
    }
  }

  const isPending = createGroup.isPending || updateGroup.isPending

  return (
    <Dialog open={open} onOpenChange={(next) => !isPending && onOpenChange(next)}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle className='text-primary'>{isEdit ? 'Sửa nhóm chuyên mục' : 'Thêm nhóm chuyên mục'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form id='category-group-form' onSubmit={form.handleSubmit(onSubmit)} className='grid gap-4' noValidate>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên nhóm *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='Nhập tên nhóm chuyên mục' />
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
                    <Textarea {...field} placeholder='Mô tả nhóm (không bắt buộc)' className='min-h-16' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)} disabled={isPending}>
            Huỷ
          </Button>
          <Button type='submit' form='category-group-form' disabled={isPending}>
            {isPending && <Loader2 className='h-4 w-4 animate-spin' />}
            {isEdit ? 'Lưu' : 'Thêm nhóm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
