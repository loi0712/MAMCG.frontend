import { useCallback, useMemo, useState, useEffect } from 'react'
import React from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type Folder } from '@/components/layout/Folder-action-dialog'
import { useFolderDetailsRaw } from '@/components/layout/api/get-folder-details'

type FoldersDialogType = 'addChildFolder' | 'edit' | 'delete' | 'addParent' | 'permissions'

// Thư mục đang mở dialog phân quyền (chỉ cần id + tên, không tải chi tiết)
export type PermissionFolder = { id: string; name: string }

type FoldersContextType = {
  open: FoldersDialogType | null
  setOpen: (str: FoldersDialogType | null) => void
  currentRow: Folder | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Folder | null>>
  isLoading: boolean
  error: string | null
  fetchFolderById: (id: string) => Promise<void>
  refetchFolder: () => void
  clearError: () => void
  permissionFolder: PermissionFolder | null
  setPermissionFolder: (folder: PermissionFolder | null) => void
}

const FoldersContext = React.createContext<FoldersContextType | null>(null)

export function FoldersProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<FoldersDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Folder | null>(null)
  const [selectedFolderId, setSelectedFolderId] = useState<string>('')
  const [permissionFolder, setPermissionFolder] = useState<PermissionFolder | null>(null)

  const {
    data,
    isLoading,
    error: queryError,
    isError,
    refetch
  } = useFolderDetailsRaw(selectedFolderId, !!selectedFolderId)

  // Convert error to string for context compatibility
  const error = useMemo(() => {
    if (!isError || !selectedFolderId) return null 
    return queryError instanceof Error ? queryError.message : 'Failed to fetch folder'
  }, [isError, queryError, selectedFolderId])

  // Update currentRow when folder data is received from raw API
  useEffect(() => {
    if (data && selectedFolderId) {
      const { folder } = data
      
      setCurrentRow({
        id: folder.id,
        name: folder.name,
        description: folder.description || '',
        parentId: folder.parentId,
        parentName: folder.parentName || '',
        index: folder.index,
        isSmartFolder: folder.filters?.length > 0,
        isCreateCategory: false,
        categoryGroupId: null,
        categoryCode: null,
        filters: folder.filters
      })
    } else if (!selectedFolderId) {
      setCurrentRow(null)
    }
  }, [data, selectedFolderId])

  // Fetch folder by ID - async version that waits for data
  const fetchFolderById = useCallback(async (id: string) => {
    if (!id) return

    // Set the selected folder ID to trigger the query
    setSelectedFolderId(id)
    
    // Wait for refetch to complete and get fresh data
    const result = await refetch()
    
    // Update currentRow with the fetched data
    if (result.data) {
      const { folder } = result.data
      
      setCurrentRow({
        id: folder.id,
        name: folder.name,
        description: folder.description || '',
        parentId: folder.parentId,
        parentName: folder.parentName || '',
        index: folder.index,
        isSmartFolder: folder.filters?.length > 0,
        isCreateCategory: false,
        categoryGroupId: null,
        categoryCode: null,
        filters: folder.filters
      })
    }
  }, [refetch])

  // Function to refetch current folder
  const refetchFolder = useCallback(() => {
    if (selectedFolderId && refetch) {
      return refetch()
    }
  }, [selectedFolderId, refetch])

  // Function to clear error state and reset
  const clearError = useCallback(() => {
    setSelectedFolderId('')
    setCurrentRow(null)
  }, [])

  const contextValue = useMemo(() => ({
    open,
    setOpen,
    currentRow,
    setCurrentRow,
    isLoading: isLoading && Boolean(selectedFolderId),
    error,
    fetchFolderById,
    refetchFolder,
    clearError,
    permissionFolder,
    setPermissionFolder
  }), [
    open, 
    setOpen, 
    currentRow, 
    isLoading, 
    selectedFolderId, 
    error, 
    fetchFolderById, 
    refetchFolder, 
    clearError,
    permissionFolder
  ])

  return (
    <FoldersContext.Provider value={contextValue}>
      {children}
    </FoldersContext.Provider>
  )
}

export const useFoldersAction = () => {
  const foldersContext = React.useContext(FoldersContext)

  if (!foldersContext) {
    throw new Error('useFoldersAction has to be used within <FoldersProvider>')
  }

  return foldersContext
}
