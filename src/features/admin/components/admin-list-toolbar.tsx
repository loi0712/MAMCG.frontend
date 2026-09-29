import { useEffect, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type AdminListToolbarProps = {
  placeholder: string
  onSearch: (term: string) => void
  addLabel?: string
  onAdd?: () => void
}

// Ô tìm kiếm (trễ 300ms trước khi gọi API) + nút thêm mới
export function AdminListToolbar({ placeholder, onSearch, addLabel, onAdd }: AdminListToolbarProps) {
  const [term, setTerm] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => onSearch(term.trim()), 300)
    return () => clearTimeout(timer)
  }, [term, onSearch])

  return (
    <div className='flex items-center justify-between gap-4'>
      <div className='relative w-full max-w-sm'>
        <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
        <Input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder={placeholder}
          className='pl-9'
        />
      </div>
      {onAdd && (
        <Button onClick={onAdd}>
          <Plus className='h-4 w-4' />
          {addLabel}
        </Button>
      )}
    </div>
  )
}
