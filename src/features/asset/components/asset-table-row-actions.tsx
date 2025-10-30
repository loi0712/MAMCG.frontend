// components/assets/asset-table-row-actions.tsx
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { Trash2, Edit, Eye, Download, Share } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { type ParsedAsset } from '../api/get-assets'
import { useAssetsAction } from './assets-provider' // Add this import

type AssetTableRowActionsProps = {
  row: Row<ParsedAsset>
}

export function AssetTableRowActions({ row }: AssetTableRowActionsProps) {
  // Add the assets provider hook
  const { setOpen, setCurrentRow } = useAssetsAction()
  
  const handleView = () => {
    // Set the current row and open the view dialog
    setCurrentRow(row.original)
    setOpen('view')
  }

  const handleEdit = () => {
    // Set the current row and open the edit dialog
    setCurrentRow(row.original)
    setOpen('edit')
  }

  const handleDelete = () => {
    // Set the current row and open the delete dialog
    setCurrentRow(row.original)
    setOpen('delete')
  }

  const handleDownload = () => {
    // Add download logic here
    if (row.original.filePath) {
      const link = document.createElement('a')
      link.href = row.original.filePath
      link.download = row.original.name || 'tai-san'
      link.click()
    }
  }

  const handleShare = () => {
    // Add share logic here
    if (navigator.share && row.original.filePath) {
      navigator.share({
        title: row.original.name,
        url: row.original.filePath,
      })
    }
  }

  // Rest of your component remains the same...
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='data-[state=open]:bg-muted flex h-8 w-8 p-0'
        >
          <DotsHorizontalIcon className='h-4 w-4' />
          <span className='sr-only'>Mở menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[160px]' onClick={(e) => e.stopPropagation()}>
        <DropdownMenuItem onClick={handleView}>
          Xem
          <DropdownMenuShortcut>
            <Eye size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleEdit}>
          Sửa
          <DropdownMenuShortcut>
            <Edit size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleDownload}>
          Tải xuống
          <DropdownMenuShortcut>
            <Download size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleShare}>
          Chia sẻ
          <DropdownMenuShortcut>
            <Share size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          onClick={handleDelete}
          className='text-red-500!'
        >
          Xóa
          <DropdownMenuShortcut>
            <Trash2 size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
