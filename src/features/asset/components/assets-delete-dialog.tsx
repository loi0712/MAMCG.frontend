'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type ParsedAsset } from '../api/get-assets'
import { useDeleteAsset } from '../api/delete'

type AssetsDeleteDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    currentRow: ParsedAsset
    onDeleteSuccess?: () => void
}

export function AssetsDeleteDialog({
    open,
    onOpenChange,
    currentRow,
}: AssetsDeleteDialogProps) {
    const [value, setValue] = useState('')

    const deleteAsset = useDeleteAsset()

    const handleDelete = async () => {
        if (value.trim() !== currentRow.assetId) return
        
        try {
            await deleteAsset.mutateAsync({ id: currentRow.id })
            onOpenChange(false)
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <ConfirmDialog
            open={open}
            onOpenChange={onOpenChange}
            handleConfirm={handleDelete}
            disabled={value.trim() !== currentRow.assetId}
            title={
                <span className='text-destructive'>
                    <AlertTriangle
                        className='stroke-destructive me-1 inline-block'
                        size={18}
                    />{' '}
                    Xóa thiết kế
                </span>
            }
            desc={
                <div className='space-y-4'>
                    <p className='mb-2'>
                        Bạn có chắc chắn muốn xóa bản thiết kế{' '}
                        <span className='font-bold'>{currentRow.assetId} </span>?
                        <br />
                        Bản thiết kế thuộc loại{' '}
                        <span className='font-bold'>
                            {currentRow.type?.toUpperCase() || 'KHÔNG XÁC ĐỊNH'}
                        </span>{' '}
                        sẽ được chuyển vào thùng rác; quản trị viên có thể khôi phục hoặc xoá vĩnh viễn.
                    </p>

                    <Label className='my-2'>
                        Mã thiết kế:
                        <Input
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            placeholder='Nhập mã thiết kế để xác nhận xóa.'
                        />
                    </Label>

                    <Alert variant='destructive'>
                        <AlertTitle>Cảnh báo!</AlertTitle>
                        <AlertDescription>
                            Thiết kế trong thùng rác sẽ bị xoá vĩnh viễn (kể cả file gốc) sau thời hạn lưu do quản trị viên cấu hình.
                        </AlertDescription>
                    </Alert>
                </div>
            }
            confirmText='Xóa'
            destructive
        />
    )
}
