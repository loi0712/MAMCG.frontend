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
import { SECRET_MASK, type StoragePoint, useCreateStoragePoint, useUpdateStoragePoint } from '../../api/configuration'
import { STORAGE_TYPES, isCloudType } from './storage-types'

const schema = z.object({
  name: z.string().trim().min(1, 'Vui lòng nhập tên hệ thống lưu trữ').max(255, 'Tối đa 255 ký tự'),
  type: z.string().trim().min(1, 'Vui lòng chọn loại lưu trữ').max(50, 'Tối đa 50 ký tự'),
  path: z.string().trim().min(1, 'Vui lòng nhập đường dẫn'),
  accessKey: z.string().trim(),
  secretKey: z.string(),
  description: z.string().trim().max(500, 'Tối đa 500 ký tự'),
  isActive: z.boolean(),
})

type FormValues = z.infer<typeof schema>

type StorageFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  storage?: StoragePoint | null
}

export function StorageFormDialog({ open, onOpenChange, storage }: StorageFormDialogProps) {
  const isEdit = !!storage
  const createStorage = useCreateStoragePoint()
  const updateStorage = useUpdateStoragePoint()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', type: 'NAS', path: '', accessKey: '', secretKey: '', description: '', isActive: true },
  })

  useEffect(() => {
    if (!open) return
    form.reset({
      name: storage?.name ?? '',
      type: storage?.type ?? 'NAS',
      path: storage?.path ?? '',
      accessKey: storage?.accessKey ?? '',
      // Giữ chuỗi che: gửi lại nguyên "********" thì backend giữ secret cũ
      secretKey: storage?.secretKey ?? '',
      description: storage?.description ?? '',
      isActive: storage?.isActive ?? true,
    })
  }, [open, storage, form])

  const type = form.watch('type')
  const cloud = isCloudType(type)
  const typeOptions = STORAGE_TYPES.some((t) => t.value === type)
    ? STORAGE_TYPES
    : [...STORAGE_TYPES, { value: type, label: type, cloud: false }]

  const onSubmit = async (values: FormValues) => {
    const data = {
      ...values,
      accessKey: values.accessKey || null,
      secretKey: values.secretKey || null,
      description: values.description || null,
    }
    if (isEdit && storage.id != null) await updateStorage.mutateAsync({ id: storage.id, data })
    else await createStorage.mutateAsync(data)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='bg-card border-border text-foreground sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle className='text-primary'>
            {isEdit ? 'Chỉnh sửa hệ thống lưu trữ' : 'Thêm hệ thống lưu trữ mới'}
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
                    <FormLabel>Tên hệ thống lưu trữ *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='Main Storage' />
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
                    <FormLabel>Loại lưu trữ *</FormLabel>
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
              name='path'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{cloud ? 'Bucket/Container *' : 'Đường dẫn *'}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className='font-mono'
                      placeholder={cloud ? 's3://my-bucket-name' : '/mnt/nas/media hoặc \\\\192.168.1.100\\media'}
                    />
                  </FormControl>
                  <FormDescription>
                    Dung lượng chỉ đọc được khi máy chủ API truy cập được đường dẫn này (ổ cục bộ hoặc đã mount).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='accessKey'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{cloud ? 'Access Key ID' : 'Tài khoản'}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={cloud ? 'AKIAIOSFODNN7EXAMPLE' : 'username'} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='secretKey'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{cloud ? 'Secret Access Key' : 'Mật khẩu'}</FormLabel>
                    <FormControl>
                      <Input {...field} type='password' autoComplete='new-password' placeholder='••••••••' />
                    </FormControl>
                    {isEdit && storage.secretKey === SECRET_MASK && (
                      <FormDescription>Giữ nguyên để không đổi giá trị đang lưu.</FormDescription>
                    )}
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
                <FormItem className='bg-muted border-border flex items-center justify-between rounded border p-4'>
                  <div>
                    <FormLabel>Kích hoạt</FormLabel>
                    <FormDescription className='mt-1 text-xs'>Cho phép hệ thống sử dụng điểm lưu trữ này</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
                Huỷ
              </Button>
              <Button type='submit' disabled={createStorage.isPending || updateStorage.isPending}>
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
