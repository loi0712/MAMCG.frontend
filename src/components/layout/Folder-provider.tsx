import { useCallback, useMemo, useState, useEffect } from 'react'
import React from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type Folder } from '@/components/layout/Folder-action-dialog'
import { useFolderDetailsRaw } from '@/components/layout/api/get-folder-details'

type FoldersDialogType = 'addChildFolder' | 'edit' | 'delete' | 'addParent'

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
}

const FoldersContext = React.createContext<FoldersContextType | null>(null)

export function FoldersProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<FoldersDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Folder | null>(null)
  const [selectedFolderId, setSelectedFolderId] = useState<string>('')

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
        isSmartFolder: folder.filters?.length > 0,
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
        isSmartFolder: folder.filters?.length > 0,
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
    clearError
  }), [
    open, 
    setOpen, 
    currentRow, 
    isLoading, 
    selectedFolderId, 
    error, 
    fetchFolderById, 
    refetchFolder, 
    clearError
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
