import { useMemo, useState } from 'react'
import { Check, ChevronsUpDown, User, Users, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ALL_ITEMS } from '../../api/common'
import { useGroups } from '../../api/groups'
import { useUsers } from '../../api/users'

// Backend lưu người/nhóm được giao dạng chuỗi: id người dùng (GUID) và id nhóm (số), cách nhau bởi dấu phẩy
export const splitAssignees = (value: string | null | undefined) =>
  (value ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

const isGroupToken = (token: string) => /^\d+$/.test(token)

type AssigneePickerProps = {
  value: string[]
  onChange: (tokens: string[]) => void
  disabled?: boolean
}

export function AssigneePicker({ value, onChange, disabled }: AssigneePickerProps) {
  const [open, setOpen] = useState(false)
  const { data: usersData, isLoading: usersLoading } = useUsers(ALL_ITEMS)
  const { data: groupsData, isLoading: groupsLoading } = useGroups(ALL_ITEMS)

  const labels = useMemo(() => {
    const map = new Map<string, string>()
    groupsData?.groups.forEach((g) => map.set(String(g.id), g.name ?? `Nhóm #${g.id}`))
    usersData?.users.forEach((u) => map.set(u.id, u.fullName || u.username || u.email || u.id))
    return map
  }, [usersData, groupsData])

  const selected = new Set(value)
  const toggle = (token: string) =>
    onChange(selected.has(token) ? value.filter((t) => t !== token) : [...value, token])

  const loading = usersLoading || groupsLoading

  return (
    <div className='space-y-2'>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type='button'
            variant='outline'
            role='combobox'
            disabled={disabled}
            className='bg-muted border-border h-9 w-full justify-between font-normal'
          >
            <span className='text-muted-foreground truncate'>
              {value.length ? `Đã chọn ${value.length}` : 'Chọn người dùng / nhóm...'}
            </span>
            <ChevronsUpDown className='h-4 w-4 opacity-50' />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-72 p-0' align='start'>
          <Command>
            <CommandInput placeholder='Tìm người dùng, nhóm...' />
            <CommandList>
              <CommandEmpty>{loading ? 'Đang tải...' : 'Không tìm thấy'}</CommandEmpty>
              <CommandGroup heading='Nhóm người dùng'>
                {groupsData?.groups.map((g) => {
                  const token = String(g.id)
                  return (
                    <CommandItem key={`g-${token}`} value={`nhom ${g.name ?? ''} ${token}`} onSelect={() => toggle(token)}>
                      <Check className={cn('h-4 w-4', selected.has(token) ? 'opacity-100' : 'opacity-0')} />
                      <Users className='text-muted-foreground h-3.5 w-3.5' />
                      <span className='truncate'>{labels.get(token)}</span>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
              <CommandGroup heading='Người dùng'>
                {usersData?.users.map((u) => (
                  <CommandItem
                    key={`u-${u.id}`}
                    value={`${u.fullName ?? ''} ${u.username ?? ''} ${u.email ?? ''} ${u.id}`}
                    onSelect={() => toggle(u.id)}
                  >
                    <Check className={cn('h-4 w-4', selected.has(u.id) ? 'opacity-100' : 'opacity-0')} />
                    <User className='text-muted-foreground h-3.5 w-3.5' />
                    <span className='truncate'>{labels.get(u.id)}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {value.length > 0 && (
        <div className='flex flex-wrap gap-1'>
          {value.map((token) => (
            <Badge key={token} variant='outline' className='border-border gap-1 pr-1 text-[11px]'>
              {isGroupToken(token) ? <Users className='h-3 w-3' /> : <User className='h-3 w-3' />}
              <span className='max-w-40 truncate'>
                {labels.get(token) ?? (isGroupToken(token) ? `Nhóm #${token}` : token)}
              </span>
              {!disabled && (
                <button
                  type='button'
                  aria-label='Bỏ chọn'
                  className='hover:text-destructive'
                  onClick={() => toggle(token)}
                >
                  <X className='h-3 w-3' />
                </button>
              )}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
