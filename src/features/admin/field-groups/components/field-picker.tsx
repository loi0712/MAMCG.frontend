import { useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, Loader2, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ALL_ITEMS } from '../../api/common'
import { useFields } from '../../api/fields'

type FieldPickerProps = {
  // Danh sách id trường đã chọn, theo thứ tự hiển thị trong nhóm
  value: number[]
  onChange: (ids: number[]) => void
  // Tên dự phòng cho trường đã chọn nhưng không có trong danh sách tải về
  knownNames?: Map<number, string>
}

// Chọn trường dữ liệu cho nhóm: bên trái tick chọn, bên phải sắp xếp thứ tự bằng nút lên/xuống
export function FieldPicker({ value, onChange, knownNames }: FieldPickerProps) {
  const [term, setTerm] = useState('')
  const { data, isLoading, isError } = useFields(ALL_ITEMS)

  const names = useMemo(() => {
    const map = new Map<number, string>(knownNames)
    data?.fields.forEach((f) => map.set(f.id, f.name))
    return map
  }, [data, knownNames])

  const available = useMemo(() => {
    const t = term.trim().toLowerCase()
    const all = data?.fields ?? []
    return t ? all.filter((f) => f.name.toLowerCase().includes(t)) : all
  }, [data, term])

  const selected = new Set(value)

  const toggle = (id: number, checked: boolean) =>
    onChange(checked ? [...value, id] : value.filter((x) => x !== id))

  const move = (index: number, delta: number) => {
    const next = [...value]
    const target = index + delta
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  return (
    <div className='grid grid-cols-2 gap-3'>
      <div className='rounded-md border'>
        <div className='border-b p-2'>
          <div className='relative'>
            <Search className='text-muted-foreground absolute top-1/2 left-2 h-3.5 w-3.5 -translate-y-1/2' />
            <Input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder='Tìm trường...'
              className='h-8 pl-7 text-sm'
            />
          </div>
        </div>
        <ScrollArea className='h-60'>
          <div className='space-y-0.5 p-1'>
            {isLoading && (
              <div className='text-muted-foreground flex items-center gap-2 p-3 text-sm'>
                <Loader2 className='h-4 w-4 animate-spin' /> Đang tải...
              </div>
            )}
            {isError && <div className='text-destructive p-3 text-sm'>Không tải được danh sách trường.</div>}
            {!isLoading && !isError && available.length === 0 && (
              <div className='text-muted-foreground p-3 text-sm'>Không có trường phù hợp</div>
            )}
            {available.map((f) => (
              <label
                key={f.id}
                className='hover:bg-accent flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm'
              >
                <Checkbox checked={selected.has(f.id)} onCheckedChange={(c) => toggle(f.id, c === true)} />
                <span className='truncate'>{f.name}</span>
              </label>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className='rounded-md border'>
        <div className='text-muted-foreground border-b p-2 text-xs leading-8'>Đã chọn ({value.length}) — thứ tự hiển thị</div>
        <ScrollArea className='h-60'>
          <div className='space-y-0.5 p-1'>
            {value.length === 0 && <div className='text-muted-foreground p-3 text-sm'>Chưa chọn trường nào</div>}
            {value.map((fid, index) => (
              <div key={fid} className='hover:bg-accent flex items-center gap-1 rounded px-2 py-1 text-sm'>
                <span className='text-muted-foreground w-5 text-xs'>{index + 1}</span>
                <span className='flex-1 truncate'>{names.get(fid) ?? `Trường #${fid}`}</span>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  className='h-6 w-6'
                  aria-label='Lên'
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                >
                  <ArrowUp className='h-3.5 w-3.5' />
                </Button>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  className='h-6 w-6'
                  aria-label='Xuống'
                  disabled={index === value.length - 1}
                  onClick={() => move(index, 1)}
                >
                  <ArrowDown className='h-3.5 w-3.5' />
                </Button>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  className='h-6 w-6'
                  aria-label='Bỏ chọn'
                  onClick={() => toggle(fid, false)}
                >
                  <X className='h-3.5 w-3.5' />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
