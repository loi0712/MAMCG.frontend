import { useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { type DataType, type FieldDetail, useCreateField, useUpdateField } from '../../api/fields'

const schema = z.object({
  fieldName: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập mã trường')
    .regex(/^[A-Za-z][A-Za-z0-9_]*$/, 'Chỉ gồm chữ không dấu, số, dấu _ và bắt đầu bằng chữ'),
  displayName: z.string().trim().min(1, 'Vui lòng nhập tên hiển thị'),
  dataTypeId: z.string().min(1, 'Vui lòng chọn kiểu dữ liệu'),
  defaultValue: z.string(),
  isRequired: z.boolean(),
  editable: z.boolean(),
})

type FormValues = z.infer<typeof schema>

type FieldFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  field?: FieldDetail | null
  // Backend chưa có API liệt kê kiểu dữ liệu: dùng các kiểu gặp trong những trường đã tải
  dataTypes: DataType[]
}

export function FieldFormDialog({ open, onOpenChange, field, dataTypes }: FieldFormDialogProps) {
  const isEdit = !!field
  const createField = useCreateField()
  const updateField = useUpdateField()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fieldName: '',
      displayName: '',
      dataTypeId: '',
      defaultValue: '',
      isRequired: false,
      editable: true,
    },
  })

  useEffect(() => {
    if (!open) return
    form.reset({
      fieldName: field?.fieldName ?? '',
      displayName: field?.displayName ?? '',
      dataTypeId: field?.dataType ? String(field.dataType.id) : '',
      defaultValue: '',
      isRequired: field?.isRequired ?? false,
      editable: field?.editable ?? true,
    })
  }, [open, field, form])

  const onSubmit = async (values: FormValues) => {
    const data = {
      fieldName: values.fieldName,
      displayName: values.displayName,
      dataTypeId: Number(values.dataTypeId),
      isRequired: values.isRequired,
      editable: values.editable,
    }
    if (isEdit) {
      // Chỉ gửi giá trị mặc định khi người dùng nhập mới
      await updateField.mutateAsync({
        id: field.id,
        data: values.defaultValue ? { ...data, defaultValue: values.defaultValue } : data,
      })
    } else {
      await createField.mutateAsync({ ...data, defaultValue: values.defaultValue })
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Sửa trường dữ liệu' : 'Thêm trường dữ liệu'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='grid gap-4' noValidate>
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='fieldName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mã trường</FormLabel>
                    <FormControl>
                      <Input {...field} className='font-mono' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='displayName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên hiển thị</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name='dataTypeId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kiểu dữ liệu</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Chọn kiểu dữ liệu' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {dataTypes.map((t) => (
                        <SelectItem key={t.id} value={String(t.id)}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {dataTypes.length === 0 && (
                    <FormDescription>
                      Chưa có kiểu dữ liệu nào trong hệ thống.
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='defaultValue'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Giá trị mặc định</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={isEdit ? 'Bỏ trống nếu giữ nguyên' : undefined} />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className='flex gap-8'>
              <FormField
                control={form.control}
                name='isRequired'
                render={({ field }) => (
                  <FormItem className='flex items-center gap-3'>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className='!mt-0'>Bắt buộc</FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='editable'
                render={({ field }) => (
                  <FormItem className='flex items-center gap-3'>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className='!mt-0'>Cho phép sửa</FormLabel>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
                Huỷ
              </Button>
              <Button type='submit' disabled={createField.isPending || updateField.isPending}>
                {isEdit ? 'Lưu' : 'Thêm'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
