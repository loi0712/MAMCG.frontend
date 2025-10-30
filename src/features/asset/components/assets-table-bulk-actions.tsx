// components/assets/asset-table-bulk-actions.tsx
import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { Trash2, CheckCircle, XCircle, Download, FolderOpen, Archive } from 'lucide-react'
import { toast } from 'sonner'
import { sleep } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table'
import { type ParsedAsset } from '../api/get-assets'
import { AssetMultiDeleteDialog } from './assets-multi-delete-dialog'

type AssetTableBulkActionsProps<TData> = {
  table: Table<TData>
}

export function AssetTableBulkActions<TData>({
  table,
}: AssetTableBulkActionsProps<TData>) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const selectedRows = table.getFilteredSelectedRowModel().rows

  // Handle bulk approval status change
  const handleBulkApprovalChange = (approved: boolean) => {
    const selectedAssets = selectedRows.map((row) => row.original as ParsedAsset)
    toast.promise(sleep(2000), {
      loading: `${approved ? 'Approving' : 'Unapproving'} assets...`,
      success: () => {
        table.resetRowSelection()
        return `${approved ? 'Approved' : 'Unapproved'} ${selectedAssets.length} asset${selectedAssets.length > 1 ? 's' : ''}`
      },
      error: `Error ${approved ? 'approving' : 'unapproving'} assets`,
    })
    table.resetRowSelection()
  }

  // Handle bulk download
  const handleBulkDownload = () => {
    const selectedAssets = selectedRows.map((row) => row.original as ParsedAsset)
    toast.promise(
      // Simulate download preparation
      sleep(3000),
      {
        loading: 'Preparing assets for download...',
        success: () => {
          // In a real implementation, you would:
          // 1. Create a zip file with selected assets
          // 2. Provide download link
          // For now, we'll just show success
          table.resetRowSelection()
          return `Prepared ${selectedAssets.length} asset${selectedAssets.length > 1 ? 's' : ''} for download`
        },
        error: 'Error preparing assets for download',
      }
    )
  }

  // Handle bulk archive
  const handleBulkArchive = () => {
    const selectedAssets = selectedRows.map((row) => row.original as ParsedAsset)
    toast.promise(sleep(2000), {
      loading: 'Archiving assets...',
      success: () => {
        table.resetRowSelection()
        return `Archived ${selectedAssets.length} asset${selectedAssets.length > 1 ? 's' : ''}`
      },
      error: 'Error archiving assets',
    })
  }

  // Handle bulk move to folder
  const handleBulkMoveToFolder = () => {
    const selectedAssets = selectedRows.map((row) => row.original as ParsedAsset)
    // In a real implementation, you would open a folder selection dialog
    toast.promise(sleep(2000), {
      loading: 'Moving assets to folder...',
      success: () => {
        table.resetRowSelection()
        return `Moved ${selectedAssets.length} asset${selectedAssets.length > 1 ? 's' : ''} to folder`
      },
      error: 'Error moving assets to folder',
    })
  }

  return (
    <>
      <BulkActionsToolbar table={table} entityName='asset'>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              onClick={handleBulkDownload}
              className='size-8'
              aria-label='Download selected assets'
              title='Download selected assets'
            >
              <Download />
              <span className='sr-only'>Download selected assets</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Download selected assets</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              onClick={handleBulkMoveToFolder}
              className='size-8'
              aria-label='Move selected assets to folder'
              title='Move selected assets to folder'
            >
              <FolderOpen />
              <span className='sr-only'>Move selected assets to folder</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Move to folder</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              onClick={() => handleBulkApprovalChange(true)}
              className='size-8'
              aria-label='Approve selected assets'
              title='Approve selected assets'
            >
              <CheckCircle />
              <span className='sr-only'>Approve selected assets</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Approve selected assets</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              onClick={() => handleBulkApprovalChange(false)}
              className='size-8'
              aria-label='Unapprove selected assets'
              title='Unapprove selected assets'
            >
              <XCircle />
              <span className='sr-only'>Unapprove selected assets</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Unapprove selected assets</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              onClick={handleBulkArchive}
              className='size-8'
              aria-label='Archive selected assets'
              title='Archive selected assets'
            >
              <Archive />
              <span className='sr-only'>Archive selected assets</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Archive selected assets</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='destructive'
              size='icon'
              onClick={() => setShowDeleteConfirm(true)}
              className='size-8'
              aria-label='Delete selected assets'
              title='Delete selected assets'
            >
              <Trash2 />
              <span className='sr-only'>Delete selected assets</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Delete selected assets</p>
          </TooltipContent>
        </Tooltip>
      </BulkActionsToolbar>

      <AssetMultiDeleteDialog
        table={table}
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
      />
    </>
  )
}
