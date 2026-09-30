import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Check, ChevronsUpDown, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { getAssets, getFieldValue } from '@/features/asset/api/get-assets'

export interface PickedAsset {
  id: number
  label: string
}

type AssetPickerProps = {
  value: PickedAsset | null
  onChange: (asset: PickedAsset | null) => void
  invalid?: boolean
}

// Chọn 1 thiết kế để gán vào ô (biến) của template CG — tìm theo tên thiết kế
export function AssetPicker({ value, onChange, invalid }: AssetPickerProps) {
  const [open, setOpen] = useState(false)
  const [term, setTerm] = useState('')
  const [debounced, setDebounced] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(term.trim()), 300)
    return () => clearTimeout(timer)
  }, [term])

  const { data, isFetching } = useQuery({
    queryKey: ['assets', { pageNumber: 1, pageSize: 20, folderId: 0, searchTerm: debounced }] as [string, { pageNumber: number; pageSize: number; folderId: number; searchTerm: string }],
    queryFn: getAssets,
    enabled: open,
  })
  // Backend trả 1 phần tử rỗng (id = 0) khi không có kết quả
  const assets = (data?.assets ?? []).filter((a) => a.id > 0)

  return (
    <div className='flex items-center gap-1'>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type='button'
            variant='outline'
            role='combobox'
            aria-expanded={open}
            aria-invalid={invalid}
            aria-label={value ? `Thiết kế: ${value.label}` : 'Chọn thiết kế'}
            className={cn('w-full justify-between font-normal', !value && 'text-muted-foreground', invalid && 'border-destructive')}
          >
            <span className='truncate'>{value?.label ?? 'Chọn thiết kế...'}</span>
            <ChevronsUpDown className='h-4 w-4 opacity-50' />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-[360px] p-0' align='start'>
          <Command shouldFilter={false}>
            <CommandInput placeholder='Tìm theo tên thiết kế...' value={term} onValueChange={setTerm} />
            <CommandList>
              {isFetching ? (
                <div className='text-muted-foreground flex items-center justify-center gap-2 py-6 text-sm'>
                  <Loader2 className='h-4 w-4 animate-spin' /> Đang tìm...
                </div>
              ) : (
                <CommandEmpty>Không tìm thấy thiết kế</CommandEmpty>
              )}
              <CommandGroup>
                {!isFetching &&
                  assets.map((asset) => {
                    const code = getFieldValue(asset.fields, 'ID')
                    const label = [code, asset.name].filter(Boolean).join(' – ')
                    return (
                      <CommandItem
                        key={asset.id}
                        value={String(asset.id)}
                        onSelect={() => {
                          onChange({ id: asset.id, label })
                          setOpen(false)
                        }}
                      >
                        <Check className={cn('h-4 w-4', value?.id === asset.id ? 'opacity-100' : 'opacity-0')} />
                        <span className='truncate'>{label}</span>
                      </CommandItem>
                    )
                  })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {value && (
        <Button type='button' variant='ghost' size='icon' className='h-8 w-8' aria-label='Bỏ chọn thiết kế' onClick={() => onChange(null)}>
          <X className='h-4 w-4' />
        </Button>
      )}
    </div>
  )
}
