import { useEffect, useMemo, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { ALL_ITEMS, joinIds } from '../../api/common'
import { useFields } from '../../api/fields'
import { type PanelDetail, useCreatePanel, useUpdatePanel } from '../../api/panels'

const schema = z.object({
  panelName: z.string().trim().min(1, 'Vui lòng nhập tên panel'),
  description: z.string().trim(),
  index: z.string().regex(/^\d*$/, 'Thứ tự phải là số'),
  visibilityRules: z.string().trim(),
  // Thứ tự trong mảng = thứ tự hiển thị trường trong panel
  fieldIds: z.array(z.number()),
})

type FormValues = z.infer<typeof schema>

type PanelFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  panel?: PanelDetail | null
}

export function PanelFormDialog({ open, onOpenChange, panel }: PanelFormDialogProps) {
  const isEdit = !!panel
  const [filter, setFilter] = useState('')
  const { data: fieldsData } = useFields(ALL_ITEMS)
  const createPanel = useCreatePanel()
  const updatePanel = useUpdatePanel()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { panelName: '', description: '', index: '', visibilityRules: '', fieldIds: [] },
  })

  useEffect(() => {
    if (!open) return
    setFilter('')
    form.reset({
      panelName: panel?.panelName ?? '',
      description: panel?.description ?? '',
      index: panel ? String(panel.index) : '',
      visibilityRules: panel?.visibilityRules ?? '',
      fieldIds: panel?.fields.map((f) => f.id) ?? [],
    })
  }, [open, panel, form])

  const allFields = useMemo(() => fieldsData?.fields ?? [], [fieldsData])
  const fieldName = (id: number) => allFields.find((f) => f.id === id)?.name ?? `#${id}`
  const visibleFields = useMemo(() => {
    const term = filter.trim().toLowerCase()
    return term ? allFields.filter((f) => f.name.toLowerCase().includes(term)) : allFields
  }, [allFields, filter])

  const onSubmit = async (values: FormValues) => {
    const data = {
      panelName: values.panelName,
      description: values.description || null,
      visibilityRules: values.visibilityRules || null,
      index: values.index ? Number(values.index) : null,
      fieldIds: joinIds(values.fieldIds),
    }
    if (isEdit) {
      await updatePanel.mutateAsync({ id: panel.id, data })
    } else {
      await createPanel.mutateAsync(data)
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Sửa panel hiển thị' : 'Thêm panel hiển thị'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='grid gap-4' noValidate>
            <div className='grid grid-cols-[1fr_8rem] gap-4'>
              <FormField
                control={form.control}
                name='panelName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên panel</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='index'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thứ tự</FormLabel>
                    <FormControl>
                      <Input inputMode='numeric' {...field} />
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
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='fieldIds'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trường hiển thị ({field.value.length}, theo thứ tự chọn)</FormLabel>
                  {field.value.length > 0 && (
                    <div className='flex flex-wrap gap-1'>
                      {field.value.map((id, i) => (
                        <Badge key={id} variant='secondary' className='gap-1'>
                          {i + 1}. {fieldName(id)}
                          <button
                            type='button'
                            aria-label={`Bỏ ${fieldName(id)}`}
                            onClick={() => field.onChange(field.value.filter((x) => x !== id))}
                          >
                            <X className='h-3 w-3' />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                  <Input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder='Lọc trường...' />
                  <ScrollArea className='h-40 rounded-md border'>
                    <div className='grid grid-cols-2 gap-1 p-2'>
                      {visibleFields.map((f) => (
                        <Label
                          key={f.id}
                          className='hover:bg-accent flex cursor-pointer items-center gap-3 rounded px-2 py-1.5 font-normal'
                        >
                          <Checkbox
                            checked={field.value.includes(f.id)}
                            onCheckedChange={(value) =>
                              field.onChange(
                                value === true ? [...field.value, f.id] : field.value.filter((x) => x !== f.id)
                              )
                            }
                          />
                          {f.name}
                        </Label>
                      ))}
                    </div>
                  </ScrollArea>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='visibilityRules'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Điều kiện hiển thị</FormLabel>
                  <FormControl>
                    <Textarea rows={2} className='font-mono text-xs' {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
                Huỷ
              </Button>
              <Button type='submit' disabled={createPanel.isPending || updatePanel.isPending}>
                {isEdit ? 'Lưu' : 'Thêm'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
