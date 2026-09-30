import { useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { type OrgUnitRequest } from '../../api/lookups'

const schema = z.object({
  name: z.string().trim().min(1, 'Vui lòng nhập tên').max(255, 'Tên không được vượt quá 255 ký tự'),
  description: z.string().trim().max(500, 'Mô tả không được vượt quá 500 ký tự'),
})

type FormValues = z.infer<typeof schema>

type OrgUnitFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  // "phòng ban" | "chức vụ"
  label: string
  item?: { name: string; description: string | null } | null
  isPending: boolean
  onSubmit: (data: OrgUnitRequest) => Promise<unknown>
}

export function OrgUnitFormDialog({ open, onOpenChange, label, item, isPending, onSubmit }: OrgUnitFormDialogProps) {
  const isEdit = !!item
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { name: '', description: '' } })

  useEffect(() => {
    if (!open) return
    form.reset({ name: item?.name ?? '', description: item?.description ?? '' })
  }, [open, item, form])

  const submit = async (values: FormValues) => {
    try {
      await onSubmit({ name: values.name, description: values.description || null })
      onOpenChange(false)
    } catch {
      // Lỗi (vd. trùng tên) đã được báo qua toast, giữ dialog để sửa
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{isEdit ? `Sửa ${label}` : `Thêm ${label}`}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(submit)} className='grid gap-4' noValidate>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên {label}</FormLabel>
                  <FormControl>
                    <Input {...field} autoFocus />
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
                    <Textarea rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
                Huỷ
              </Button>
              <Button type='submit' disabled={isPending}>
                {isEdit ? 'Lưu' : 'Thêm'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
