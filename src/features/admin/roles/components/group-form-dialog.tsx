import { useEffect, useMemo, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { ALL_ITEMS, joinIds } from '../../api/common'
import { type Group, useCreateGroup, useUpdateGroup } from '../../api/groups'
import { useUsers } from '../../api/users'

const schema = z.object({
  name: z.string().trim().min(1, 'Vui lòng nhập tên nhóm'),
  description: z.string().trim(),
  userIds: z.array(z.string()),
})

type FormValues = z.infer<typeof schema>

type GroupFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  group?: Group | null
}

export function GroupFormDialog({ open, onOpenChange, group }: GroupFormDialogProps) {
  const isEdit = !!group
  const [filter, setFilter] = useState('')
  const { data: usersData } = useUsers(ALL_ITEMS)
  const createGroup = useCreateGroup()
  const updateGroup = useUpdateGroup()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '', userIds: [] },
  })

  useEffect(() => {
    if (!open) return
    setFilter('')
    form.reset({
      name: group?.name ?? '',
      description: group?.description ?? '',
      userIds: group?.users?.map((u) => u.id) ?? [],
    })
  }, [open, group, form])

  const users = useMemo(() => {
    const term = filter.trim().toLowerCase()
    const all = usersData?.users ?? []
    return term
      ? all.filter((u) => `${u.fullName} ${u.username} ${u.email}`.toLowerCase().includes(term))
      : all
  }, [usersData, filter])

  const onSubmit = async (values: FormValues) => {
    const data = {
      name: values.name,
      description: values.description || null,
      userIds: joinIds(values.userIds),
    }
    if (isEdit) {
      await updateGroup.mutateAsync({ id: group.id, data })
    } else {
      await createGroup.mutateAsync(data)
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Sửa nhóm quyền' : 'Thêm nhóm quyền'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='grid gap-4' noValidate>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên nhóm</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                    <Textarea rows={2} {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='userIds'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Thành viên ({field.value.length})</FormLabel>
                  <Input
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    placeholder='Lọc người dùng...'
                  />
                  <ScrollArea className='h-48 rounded-md border'>
                    <div className='space-y-1 p-2'>
                      {users.map((u) => {
                        const checked = field.value.includes(u.id)
                        return (
                          <Label
                            key={u.id}
                            className='hover:bg-accent flex cursor-pointer items-center gap-3 rounded px-2 py-1.5 font-normal'
                          >
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(value) =>
                                field.onChange(
                                  value === true
                                    ? [...field.value, u.id]
                                    : field.value.filter((id) => id !== u.id)
                                )
                              }
                            />
                            <span>{u.fullName}</span>
                            <span className='text-muted-foreground text-xs'>{u.username}</span>
                          </Label>
                        )
                      })}
                      {users.length === 0 && (
                        <p className='text-muted-foreground p-2 text-sm'>Không có người dùng</p>
                      )}
                    </div>
                  </ScrollArea>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
                Huỷ
              </Button>
              <Button type='submit' disabled={createGroup.isPending || updateGroup.isPending}>
                {isEdit ? 'Lưu' : 'Thêm'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
