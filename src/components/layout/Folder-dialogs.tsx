import { FoldersActionDialog } from '@/components/layout/Folder-action-dialog'
import { useFoldersAction } from './Folder-provider'
import { FoldersDeleteDialog } from '@/components/layout/Folder-delete-dialog'

export function FoldersDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useFoldersAction()
  return (
    <>
      <FoldersActionDialog
        key='addParent'
        open={open === 'addParent'}
        onOpenChange={() => setOpen('addParent')}
        isEdit= {false}
      />

      {currentRow && (
        <>
          <FoldersActionDialog
            key={`add-children-${currentRow.id}`}
            open={open === 'addChildFolder'}
            onOpenChange={() => {
              setOpen('addChildFolder')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
            isEdit= {false}
          />
          
          <FoldersActionDialog
            key={`folder-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
            isEdit= {true}
          />

          <FoldersDeleteDialog
            key={`folder-delete-${currentRow.id}`}
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen('delete')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />
        </>
      )}
    </>
  )
}
