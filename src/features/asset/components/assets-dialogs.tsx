// components/assets/assets-dialogs.tsx
import { AssetsActionDialog } from './asset-action-dialog'
import { AssetsDeleteDialog } from './assets-delete-dialog'
import { useAssetsAction } from './assets-provider'

export function AssetsDialogs() {
    const { open, setOpen, currentRow, setCurrentRow } = useAssetsAction()

    return (
        <>
            {/* Add new asset dialog */}
            <AssetsActionDialog
                key='asset-add'
                open={open === 'add'}
                onOpenChange={() => setOpen('add')}
            />

            {/* Dialogs that require current asset data */}
            {currentRow && (
                <>
                    {/* View asset dialog - you can reuse AssetsActionDialog or create a separate one */}
                    {/* <AssetsActionDialog
                        key={`asset-view-${currentRow.id}`}
                        open={open === 'view'}
                        onOpenChange={() => {
                            setOpen(null) // Close dialog
                            setTimeout(() => {
                                setCurrentRow(null)
                            }, 500)
                        }}
                        currentRow={currentRow}
                    /> */}

                    {/* Edit asset dialog */}
                    {/* <AssetsActionDialog
                        key={`asset-edit-${currentRow.id}`}
                        open={open === 'edit'}
                        onOpenChange={() => {
                            setOpen(null) // Close dialog
                            setTimeout(() => {
                                setCurrentRow(null)
                            }, 500)
                        }}
                        currentRow={currentRow}
                    /> */}

                    {/* Delete asset dialog */}
                    <AssetsDeleteDialog
                        key={`asset-delete-${currentRow.id}`}
                        open={open === 'delete'}
                        onOpenChange={() => {
                            setOpen(null) // Close dialog
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
