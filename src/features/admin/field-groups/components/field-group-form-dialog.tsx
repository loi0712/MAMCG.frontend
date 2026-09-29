import { useEffect, useMemo } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useCreateFieldGroup, useFieldGroup, useUpdateFieldGroup } from '../../api/field-groups'
import { FieldPicker } from './field-picker'

const schema = z.object({
  name: z.string().trim().min(1, 'Vui lòng nhập tên nhóm trường').max(255, 'Tối đa 255 ký tự'),
  description: z.string().max(500, 'Tối đa 500 ký tự'),
  displayOrder: z.string().regex(/^\d*$/, 'Thứ tự phải là số nguyên không âm'),
  isActive: z.boolean(),
  fieldIds: z.array(z.number()),
})

type FormValues = z.infer<typeof schema>

type FieldGroupFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  // Id nhóm cần sửa; null = thêm mới
  groupId: number | null
  // Thứ tự gợi ý cho nhóm mới
  nextOrder?: number
}

export function FieldGroupFormDialog({ open, onOpenChange, groupId, nextOrder = 1 }: FieldGroupFormDialogProps) {
  const isEdit = groupId != null
  const detail = useFieldGroup(open ? groupId : null)
  const createGroup = useCreateFieldGroup()
  const updateGroup = useUpdateFieldGroup()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '', displayOrder: '', isActive: true, fieldIds: [] },
  })

  const group = detail.data
  useEffect(() => {
    if (!open) return
    if (isEdit && !group) return
    form.reset({
      name: group?.name ?? '',
      description: group?.description ?? '',
      displayOrder: String(group?.displayOrder ?? nextOrder),
      isActive: group?.isActive ?? true,
      fieldIds: group?.fields.map((f) => f.id) ?? [],
    })
  }, [open, isEdit, group, nextOrder, form])

  const knownNames = useMemo(
    () => new Map<number, string>(group?.fields.map((f) => [f.id, f.displayName]) ?? []),
    [group]
  )

  const onSubmit = async (values: FormValues) => {
    const data = {
      name: values.name,
      description: values.description.trim() || null,
      displayOrder: Number(values.displayOrder || 0),
      isActive: values.isActive,
      fieldIds: values.fieldIds,
    }
    if (isEdit) await updateGroup.mutateAsync({ id: groupId, data })
    else await createGroup.mutateAsync(data)
    onOpenChange(false)
  }

  const loadingDetail = isEdit && detail.isLoading

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle className='text-primary'>{isEdit ? 'Chỉnh sửa nhóm trường' : 'Thêm nhóm trường mới'}</DialogTitle>
        </DialogHeader>

        {loadingDetail ? (
          <div className='text-muted-foreground flex h-40 items-center justify-center gap-2 text-sm'>
            <Loader2 className='h-4 w-4 animate-spin' /> Đang tải...
          </div>
        ) : isEdit && detail.isError ? (
          <div className='text-destructive py-8 text-center text-sm'>Không tải được nhóm trường. Vui lòng thử lại.</div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='grid gap-4' noValidate>
              <div className='grid grid-cols-[1fr_140px] gap-4'>
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên nhóm trường *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder='Nhập tên nhóm trường' />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='displayOrder'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thứ tự hiển thị</FormLabel>
                      <FormControl>
                        <Input {...field} type='number' min={0} placeholder='1' />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder='Mô tả về nhóm trường này' className='min-h-16' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='fieldIds'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trường dữ liệu trong nhóm</FormLabel>
                    <FieldPicker value={field.value} onChange={field.onChange} knownNames={knownNames} />
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
                <Button type='submit' disabled={createGroup.isPending || updateGroup.isPending}>
                  {isEdit ? 'Cập nhật' : 'Tạo nhóm'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
