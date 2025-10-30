'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useDeleteFolder } from './api/delete-folder'
import { toast } from 'sonner'
import { Folder } from './api/get-folder-details'
import { urls } from '@/routes/urls'
import { useNavigate } from '@tanstack/react-router'

type FolderDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Folder
  onDeleteSuccess?: () => void
}

export function FoldersDeleteDialog({
  open,
  onOpenChange,
  currentRow,
  onDeleteSuccess
}: FolderDeleteDialogProps) {
  const [value, setValue] = useState('')
  const deleteFolder = useDeleteFolder()
  const navigate = useNavigate();

  const handleDelete = async () => {
    // Kiểm tra validation
    if (value.trim() !== currentRow.name) return
    
    // Kiểm tra id có tồn tại
    if (!currentRow.id) {
      toast.error('Không thể xóa thư mục, vui lòng thử lại!')
      return
    }

    try {
      // Gọi API delete - convert number to string
      await deleteFolder.mutateAsync({
        id: currentRow.id.toString()
      })
      
      // Thành công
      // toast.success(`Thư mục "${currentRow.name}" đã được xóa thành công`)
      onOpenChange(false)
      setValue('') // Reset form
      onDeleteSuccess?.()
      navigate({
        to: urls.assets, 
        search: {
          folderId: '0', 
          page: 1, 
          pageSize: 10
        }
      })
      
    } catch (error) {
      // Error đã được handle trong mutation hook
      // Có thể thêm toast error tùy chỉnh ở đây nếu cần
      console.error('Delete folder failed:', error)
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setValue('')
    }
    onOpenChange(open)
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={handleOpenChange}
      handleConfirm={handleDelete}
      disabled={value.trim() !== currentRow.name}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='stroke-destructive me-1 inline-block'
            size={18}
          />{' '}
          Xóa thư mục
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            Bạn có chắc chắn muốn xóa thư mục{' '}
            <span className='font-bold'>{currentRow.name}</span> không?
            <br />
            Thao tác này sẽ xóa vĩnh viễn các thư mục con
            khỏi hệ thống và không thể hoàn tác.
          </p>

          <Label className='my-2'>
            Tên thư mục:
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder='Nhập tên thư mục để xác nhận xóa'
            />
          </Label>

          {deleteFolder.isError && (
            <Alert variant='destructive'>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Lỗi xóa thư mục</AlertTitle>
              <AlertDescription>
                Không thể xóa thư mục. Vui lòng thử lại sau.
              </AlertDescription>
            </Alert>
          )}

          <Alert variant='destructive'>
            <AlertTitle>Cảnh báo!</AlertTitle>
            <AlertDescription>
              Vui lòng thận trọng, thao tác này không thể khôi phục.
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText='Xóa'
      destructive
    />
  )
}
