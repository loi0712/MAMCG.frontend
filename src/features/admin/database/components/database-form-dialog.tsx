import { useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Save } from 'lucide-react'
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
import { Textarea } from '@/components/ui/textarea'
import {
  type DatabaseConnection,
  SECRET_MASK,
  useCreateDatabase,
  useUpdateDatabase,
} from '../../api/configuration'
import { DATABASE_TYPES } from './database-types'

const schema = z.object({
  name: z.string().trim().min(1, 'Vui lòng nhập tên kết nối').max(255, 'Tối đa 255 ký tự'),
  type: z.string().trim().min(1, 'Vui lòng chọn loại cơ sở dữ liệu').max(50, 'Tối đa 50 ký tự'),
  connectionString: z.string().trim().min(1, 'Vui lòng nhập connection string'),
  description: z.string().trim().max(500, 'Tối đa 500 ký tự'),
  isActive: z.boolean(),
})

type FormValues = z.infer<typeof schema>

type DatabaseFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  database?: DatabaseConnection | null
}

export function DatabaseFormDialog({ open, onOpenChange, database }: DatabaseFormDialogProps) {
  const isEdit = !!database
  const createDatabase = useCreateDatabase()
  const updateDatabase = useUpdateDatabase()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', type: 'SqlServer', connectionString: '', description: '', isActive: true },
  })

  useEffect(() => {
    if (!open) return
    form.reset({
      name: database?.name ?? '',
      type: database?.type ?? 'SqlServer',
      connectionString: database?.connectionString ?? '',
      description: database?.description ?? '',
      isActive: database?.isActive ?? true,
    })
  }, [open, database, form])

  const type = form.watch('type')
  // Giữ được loại không có trong danh sách (dữ liệu cũ nhập tay)
  const typeOptions = DATABASE_TYPES.some((t) => t.value === type)
    ? DATABASE_TYPES
    : [...DATABASE_TYPES, { value: type, label: type, template: '' }]
  const template = DATABASE_TYPES.find((t) => t.value === type)?.template

  const onSubmit = async (values: FormValues) => {
    const data = { ...values, description: values.description || null }
    if (isEdit && database.id != null) await updateDatabase.mutateAsync({ id: database.id, data })
    else await createDatabase.mutateAsync(data)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='bg-card border-border text-foreground sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle className='text-primary'>
            {isEdit ? 'Chỉnh sửa kết nối cơ sở dữ liệu' : 'Thêm kết nối cơ sở dữ liệu mới'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='grid gap-4' noValidate>
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên kết nối *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='Main Database' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='type'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loại cơ sở dữ liệu *</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder='Chọn loại' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {typeOptions.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='connectionString'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Connection String *</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} className='font-mono text-sm' placeholder={template} />
                  </FormControl>
                  <FormDescription>
                    {isEdit
                      ? `Mật khẩu đang lưu được che bằng "${SECRET_MASK}"; giữ nguyên để không đổi mật khẩu.`
                      : 'Gồm host, cổng, tên database, tài khoản và mật khẩu.'}
                  </FormDescription>
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
              name='isActive'
              render={({ field }) => (
                <FormItem className='flex items-center gap-3'>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className='!mt-0'>Kích hoạt</FormLabel>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
                Huỷ
              </Button>
              <Button type='submit' disabled={createDatabase.isPending || updateDatabase.isPending}>
                <Save className='h-4 w-4' />
                Lưu cấu hình
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
