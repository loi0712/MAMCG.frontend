import { useEffect, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { SelectDropdown } from '@/components/select-dropdown'
import { generateCategoryCode } from '@/lib/utils'
import { useCreateCategory } from '../api/create'
import { useCategoryDetail, useCategoryGroupList, useUpdateCategory } from '../api/manage'

const schema = z.object({
  name: z.string().trim().min(1, 'Tên chuyên mục là bắt buộc.').max(255, 'Tối đa 255 ký tự'),
  groupId: z.string().min(1, 'Vui lòng chọn một nhóm chuyên mục.'),
  code: z.string().trim().min(1, 'Mã chuyên mục là bắt buộc.').max(50, 'Tối đa 50 ký tự'),
  description: z.string().max(500, 'Tối đa 500 ký tự'),
})

type FormValues = z.infer<typeof schema>

type CategoryFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  // Id chuyên mục cần sửa; null = thêm mới
  categoryId: number | null
  // Nhóm gợi ý khi thêm mới (đang lọc theo nhóm)
  defaultGroupId?: number
}

export function CategoryFormDialog({ open, onOpenChange, categoryId, defaultGroupId }: CategoryFormDialogProps) {
  const isEdit = categoryId != null
  const detail = useCategoryDetail(open ? categoryId : null)
  const groups = useCategoryGroupList({ pageNumber: 1, pageSize: 200 })
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', groupId: '', code: '', description: '' },
  })

  const category = detail.data
  // Chỉ dựng form sau khi đã nạp giá trị: Select của Radix xoá giá trị nếu mount với '' rồi mới đổi sang giá trị thật
  const [ready, setReady] = useState(false)
  useEffect(() => {
    setReady(false)
    if (!open || groups.isLoading) return
    if (isEdit && !category) return
    form.reset({
      name: category?.name ?? '',
      groupId: String(category?.group?.id ?? defaultGroupId ?? '') || '',
      code: category?.code ?? '',
      description: category?.description ?? '',
    })
    setReady(true)
  }, [open, isEdit, category, defaultGroupId, form, groups.isLoading])

  // Thêm mới: gợi ý mã từ tên (người dùng vẫn sửa được)
  const watchName = form.watch('name')
  useEffect(() => {
    if (isEdit || !form.getFieldState('name').isDirty) return
    const code = generateCategoryCode(watchName)
    if (code) form.setValue('code', code, { shouldDirty: true })
  }, [watchName, isEdit, form])

  const onSubmit = async (values: FormValues) => {
    const data = {
      name: values.name,
      groupId: Number(values.groupId),
      code: values.code,
      description: values.description.trim(),
    }
    try {
      if (isEdit) await updateCategory.mutateAsync({ id: categoryId, data })
      else await createCategory.mutateAsync(data)
      onOpenChange(false)
    } catch {
      // Lỗi (vd. trùng mã) đã được thông báo chung
    }
  }

  const groupItems = (groups.data?.categoryGroups ?? []).map((g) => ({ label: g.name, value: String(g.id) }))
  const isPending = createCategory.isPending || updateCategory.isPending

  return (
    <Dialog open={open} onOpenChange={(next) => !isPending && onOpenChange(next)}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle className='text-primary'>{isEdit ? 'Sửa chuyên mục' : 'Thêm chuyên mục'}</DialogTitle>
        </DialogHeader>

        {(isEdit && detail.isLoading) || groups.isLoading || (!ready && !(isEdit && detail.isError)) ? (
          <div className='text-muted-foreground flex h-40 items-center justify-center gap-2 text-sm'>
            <Loader2 className='h-4 w-4 animate-spin' /> Đang tải...
          </div>
        ) : isEdit && (detail.isError || !category) ? (
          <div className='text-destructive py-8 text-center text-sm'>Không tải được chuyên mục. Vui lòng thử lại.</div>
        ) : (
          <Form {...form}>
            <form id='category-form' onSubmit={form.handleSubmit(onSubmit)} className='grid gap-4' noValidate>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên chuyên mục *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='Nhập tên chuyên mục' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='groupId'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nhóm chuyên mục *</FormLabel>
                      <SelectDropdown
                        isControlled
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        placeholder='Chọn nhóm chuyên mục'
                        isPending={groups.isLoading}
                        items={groupItems}
                        className='w-full'
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='code'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mã chuyên mục *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder='VD: TS' className='font-mono' />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {isEdit && (
                <p className='text-muted-foreground -mt-2 text-xs'>
                  Đổi mã chỉ áp dụng cho thiết kế tạo mới; mã các thiết kế đã có không thay đổi.
                </p>
              )}
              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder='Mô tả chuyên mục (không bắt buộc)' className='min-h-16' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        )}

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)} disabled={isPending}>
            Huỷ
          </Button>
          <Button type='submit' form='category-form' disabled={isPending || (isEdit && !category)}>
            {isPending && <Loader2 className='h-4 w-4 animate-spin' />}
            {isEdit ? 'Lưu' : 'Thêm chuyên mục'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
