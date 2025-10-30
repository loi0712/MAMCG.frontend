// components/assets/assets-provider.tsx
import { useState } from 'react'
import React from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type ParsedAsset } from '../api/get-assets' // Change this import

type AssetsDialogType = 'add' | 'edit' | 'delete' | 'view' | 'upload' | 'move'

type AssetsContextType = {
  open: AssetsDialogType | null
  setOpen: (str: AssetsDialogType | null) => void
  currentRow: ParsedAsset | null // Change from Asset to ParsedAsset
  setCurrentRow: React.Dispatch<React.SetStateAction<ParsedAsset | null>>
}

const AssetsContext = React.createContext<AssetsContextType | null>(null)

export function AssetsProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<AssetsDialogType>(null)
  const [currentRow, setCurrentRow] = useState<ParsedAsset | null>(null) // Change type

  return (
    <AssetsContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </AssetsContext.Provider>
  )
}

export const useAssetsAction = () => {
  const assetsContext = React.useContext(AssetsContext)

  if (!assetsContext) {
    throw new Error('useAssetsAction has to be used within <AssetsProvider>')
  }

  return assetsContext
}
