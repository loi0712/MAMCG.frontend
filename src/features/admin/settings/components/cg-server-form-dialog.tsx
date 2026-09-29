import { useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  CG_SERVER_STATUS,
  type CGServer,
  type CGServerRequest,
  useCGServerStatuses,
  useCreateCGServer,
  useUpdateCGServer,
} from '../../api/cg-servers'

const schema = z.object({
  serverName: z.string().trim().min(1, 'Vui lòng nhập tên server').max(255, 'Tối đa 255 ký tự'),
  ipAddress: z.string().trim().min(1, 'Vui lòng nhập địa chỉ IP').max(50, 'Tối đa 50 ký tự'),
  port: z
    .string()
    .trim()
    .refine((v) => v === '' || (/^\d+$/.test(v) && Number(v) >= 1 && Number(v) <= 65535), 'Cổng từ 1 đến 65535'),
  location: z.string().trim().min(1, 'Vui lòng nhập vị trí đặt server').max(255, 'Tối đa 255 ký tự'),
  statusId: z.string().min(1, 'Vui lòng chọn trạng thái'),
  isBackupServer: z.boolean(),
  version: z.string().trim().max(50, 'Tối đa 50 ký tự'),
})

type FormValues = z.infer<typeof schema>

const inputClass = 'bg-muted border-border text-foreground'

type CGServerFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  server?: CGServer | null
}

export function CGServerFormDialog({ open, onOpenChange, server }: CGServerFormDialogProps) {
  const isEdit = !!server?.id
  const { data: statuses = [] } = useCGServerStatuses()
  const createServer = useCreateCGServer()
  const updateServer = useUpdateCGServer()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      serverName: '',
      ipAddress: '',
      port: '',
      location: '',
      statusId: String(CG_SERVER_STATUS.offline),
      isBackupServer: false,
      version: '',
    },
  })

  useEffect(() => {
    if (!open) return
    form.reset({
      serverName: server?.serverName ?? '',
      ipAddress: server?.ipAddress ?? '',
      port: server?.port != null ? String(server.port) : '',
      location: server?.location ?? '',
      statusId: String(server?.statusId ?? CG_SERVER_STATUS.offline),
      isBackupServer: server?.isBackupServer ?? false,
      version: server?.version ?? '',
    })
  }, [open, server, form])

  const onSubmit = async (values: FormValues) => {
    const data: CGServerRequest = {
      serverName: values.serverName,
      ipAddress: values.ipAddress,
      port: values.port ? Number(values.port) : null,
      location: values.location,
      statusId: Number(values.statusId),
      isBackupServer: values.isBackupServer,
      version: values.version || null,
    }
    if (isEdit && server?.id) await updateServer.mutateAsync({ id: server.id, data })
    else await createServer.mutateAsync(data)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='bg-card border-border text-foreground'>
        <DialogHeader>
          <DialogTitle className='text-primary'>{isEdit ? 'Chỉnh sửa Server' : 'Thêm CG Server mới'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4 mt-2' noValidate>
            <FormField
              control={form.control}
              name='serverName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-foreground'>Tên Server *</FormLabel>
                  <FormControl>
                    <Input placeholder='CG Server 1' className={inputClass} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='grid grid-cols-3 gap-4'>
              <FormField
                control={form.control}
                name='ipAddress'
                render={({ field }) => (
                  <FormItem className='col-span-2'>
                    <FormLabel className='text-foreground'>Địa chỉ IP *</FormLabel>
                    <FormControl>
                      <Input placeholder='192.168.1.100' className={`${inputClass} font-mono`} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='port'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-foreground'>Port</FormLabel>
                    <FormControl>
                      <Input type='number' placeholder='5250' className={`${inputClass} font-mono`} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name='location'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-foreground'>Vị trí *</FormLabel>
                  <FormControl>
                    <Input placeholder='Vị trí của server' className={inputClass} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='statusId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-foreground'>Trạng thái</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className={`w-full ${inputClass}`}>
                          <SelectValue placeholder='Chọn trạng thái' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className='bg-card border-border'>
                        {statuses.map((s) => (
                          <SelectItem key={s.id} value={String(s.id)} className='text-foreground'>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription className='text-xs'>Kiểm tra kết nối sẽ tự cập nhật trạng thái</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='version'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-foreground'>Phiên bản</FormLabel>
                    <FormControl>
                      <Input placeholder='2.3.1' className={inputClass} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name='isBackupServer'
              render={({ field }) => (
                <FormItem className='flex items-center justify-between p-4 bg-muted rounded border border-border'>
                  <FormLabel className='text-foreground'>Server dự phòng</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className='data-[state=checked]:bg-primary'
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
                className='border-border text-foreground hover:bg-accent'
              >
                Hủy
              </Button>
              <Button
                type='submit'
                className='bg-primary hover:bg-primary/90 text-primary-foreground'
                disabled={createServer.isPending || updateServer.isPending}
              >
                {isEdit ? 'Cập nhật Server' : 'Thêm Server'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
