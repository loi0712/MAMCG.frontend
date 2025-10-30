// components/assets/assets-table.tsx
import { useEffect, useState } from 'react'
import {
    type SortingState,
    type VisibilityState,
    flexRender,
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { type NavigateFn, useTableUrlState } from '@/hooks/use-table-url-state'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
import {
    type TAssetsResponse,
    parseAssetsResponse,
} from '../api/get-assets'
import { useAssetColumns } from './assets-column'
import { AssetTableBulkActions } from './assets-table-bulk-actions'
import { Asset } from '../data/assets'
import PreviewDrawer from './asset-preview'
import { FolderOpen } from 'lucide-react'
import { useMenuStore } from '@/stores/menu-store'
import { useNavigate } from '@tanstack/react-router'

// Get all unique field names from assets for dynamic column generation
export const extractUniqueFieldNames = (assets: Asset[]): string[] => {
    const uniqueFieldNames = new Set<string>()

    assets.forEach(asset => {
        asset.fields.forEach(field => {
            uniqueFieldNames.add(field.fieldName)
        })
    })

    return Array.from(uniqueFieldNames)
}

// Get field definition for a specific field name from any asset
export const getFieldDefinition = (assets: Asset[], fieldName: string) => {
    for (const asset of assets) {
        const field = asset.fields.find(f => f.fieldName === fieldName)
        if (field) {
            return field
        }
    }
    return null
}

type AssetsTableProps = {
    folderPath: string
    data: TAssetsResponse
    search: Record<string, unknown>
    navigate: NavigateFn
    onRefresh?: () => Promise<void>
}

export function AssetsTable({ folderPath, data, search, navigate: navigateUrl, onRefresh }: AssetsTableProps) {

    // Local UI-only states
    const [rowSelection, setRowSelection] = useState({})
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [sorting, setSorting] = useState<SortingState>([])

    const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null)
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const { menu } = useMenuStore()
    const navigate = useNavigate()

    // Add the handleRowClick function
    const handleRowClick = (row: any, event: React.MouseEvent) => {
        // Prevent triggering when clicking on interactive elements
        const target = event.target as HTMLElement

        // Skip if clicking on checkboxes, buttons, links, or other interactive elements
        if (
            target.closest('input[type="checkbox"]') ||
            target.closest('button') ||
            target.closest('[role="button"]') ||
            target.closest('a') ||
            target.closest('[data-prevent-row-click]') ||
            target.tagName === 'BUTTON' ||
            target.tagName === 'INPUT'
        ) {
            return
        }

        // Get asset ID from row data
        const assetId = row.original?.id || row.original?.assetId
        if (assetId) {
            if (menu === 'CG') {
                navigate({
                    to: '/assets/cg/details',
                    search: { id: String(assetId) }
                })
            } else {
                setSelectedAssetId(String(assetId))
                setIsDrawerOpen(true)
            }
        }
    }

    // Parse the asset data using the existing utility
    const parsedData = parseAssetsResponse(data)

    // Generate dynamic columns based on raw assets (for field definitions)
    const columns = useAssetColumns(data.assets)

    // Generate dynamic filter options based on unique field values
    const generateFilterOptions = (fieldName: string) => {
        const uniqueValues = new Set<string>()

        parsedData.assets.forEach(asset => {
            const value = (asset as any)[fieldName]
            if (value) {
                uniqueValues.add(String(value))
            }
        })

        return Array.from(uniqueValues).map(value => ({
            label: value,
            value: value
        }))
    }

    // Synced with URL states
    const {
        columnFilters,
        onColumnFiltersChange,
        pagination,
        onPaginationChange,
        ensurePageInRange,
    } = useTableUrlState({
        search,
        navigate: navigateUrl,
        pagination: { defaultPage: 1, defaultPageSize: 10 },
        globalFilter: { enabled: false },
        columnFilters: [
            { columnId: 'name', searchKey: 'name', type: 'string' },
            { columnId: 'status', searchKey: 'status', type: 'array' },
            { columnId: 'Status', searchKey: 'status', type: 'array' },
            { columnId: 'type', searchKey: 'type', type: 'array' },
            { columnId: 'Type', searchKey: 'type', type: 'array' },
            { columnId: 'category', searchKey: 'category', type: 'array' },
            { columnId: 'Category', searchKey: 'category', type: 'array' },
            { columnId: 'isApproved', searchKey: 'approved', type: 'array' },
        ],
    })

    const table = useReactTable({
        data: parsedData.assets,
        columns,
        state: {
            sorting,
            pagination,
            rowSelection,
            columnFilters,
            columnVisibility,
        },
        manualPagination: true,
        rowCount: data.totalCount,

        enableRowSelection: true,
        onPaginationChange,
        onColumnFiltersChange,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnVisibilityChange: setColumnVisibility,
        getPaginationRowModel: getPaginationRowModel(),
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
    })

    useEffect(() => {
        ensurePageInRange(table.getPageCount())
    }, [table, ensurePageInRange])

    // Generate dynamic filters based on available fields
    const dynamicFilters = extractUniqueFieldNames(data.assets)
        .filter((fieldName: string) => {
            // Include commonly filtered fields
            const filterableFields = ['status', 'type', 'category', 'author', 'projectname']
            return filterableFields.some(field =>
                fieldName.toLowerCase().includes(field)
            )
        })
        .map((fieldName: string) => {
            const fieldDef = getFieldDefinition(data.assets, fieldName)
            return {
                columnId: fieldName,
                title: fieldDef?.displayName || fieldName,
                options: generateFilterOptions(fieldName),
            }
        })

    const isDataEmpty = (fields: any[]) => {
        if (!fields || fields.length === 0) return true;

        return fields.every(field => {
            const value = field.value;
            return value === null || value === '' || value === undefined;
        });
    };

    const handleAssetCreated = async () => {
        try {
            if (onRefresh) {
                await onRefresh()
            }
        } catch (error) {
            console.error('Failed to refresh assets after creation:', error)
        }
    }

    return (
        <>
            <div className='space-y-4 h-full'>
                <DataTableToolbar
                    folderPath={folderPath}
                    totalCount={data.totalCount}
                    table={table}
                    searchPlaceholder='Tìm kiếm thiết kế...'
                    searchKey='name'
                    onAssetCreated={handleAssetCreated}
                    filters={[
                        // Static filters
                        {
                            columnId: 'isApproved',
                            title: 'Trạng thái duyệt',
                            options: [
                                { label: 'Đã duyệt', value: 'true' },
                                { label: 'Chờ duyệt', value: 'false' },
                            ],
                        },
                        // Dynamic filters based on field data
                        ...dynamicFilters,
                    ]}
                />

                <div className="h-full">
                    {(data.assets.length === 0) ?
                        (
                            <div className="flex flex-col items-center justify-center space-y-4 text-muted-foreground">
                                <FolderOpen className="h-12 w-12" />
                                <p>Không tìm thấy thiết kế trong thư mục này</p>
                            </div>
                        )
                        :
                        (
                            <div className='rounded-md border'>
                                <Table>
                                    <TableHeader>
                                        {table.getHeaderGroups().map((headerGroup) => (
                                            <TableRow key={headerGroup.id} className='group/row'>
                                                {headerGroup.headers.map((header) => {
                                                    return (
                                                        <TableHead
                                                            key={header.id}
                                                            colSpan={header.colSpan}
                                                            className={
                                                                'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted'}
                                                        >
                                                            {header.isPlaceholder
                                                                ? null
                                                                : flexRender(
                                                                    header.column.columnDef.header,
                                                                    header.getContext()
                                                                )}
                                                        </TableHead>
                                                    )
                                                })}
                                            </TableRow>
                                        ))}
                                    </TableHeader>
                                    <TableBody>
                                        {table.getRowModel().rows?.length && !isDataEmpty(table.getRowModel().rows[0]?.original?.fields) ? (
                                            table.getRowModel().rows.map((row) => (
                                                <TableRow
                                                    key={row.id}
                                                    data-state={row.getIsSelected() && 'selected'}
                                                    className={cn(
                                                        'group/row cursor-pointer hover:bg-muted/50 transition-colors overflow-scroll',
                                                        selectedAssetId === String(row.original?.id || row.original?.assetId) && 'bg-muted'
                                                    )}
                                                    onClick={(event) => handleRowClick(row, event)}
                                                >
                                                    {row.getVisibleCells().map((cell) => (
                                                        <TableCell
                                                            key={cell.id}
                                                            className={'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted'}
                                                        >
                                                            {flexRender(
                                                                cell.column.columnDef.cell,
                                                                cell.getContext()
                                                            )}
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={columns.length}
                                                    className='h-32'
                                                >
                                                    <div className="flex flex-col items-center justify-center gap-3 py-8 px-4 rounded-lg border-2 border-dashed border-muted bg-muted/20">
                                                        <FolderOpen className="h-12 w-12 text-muted-foreground opacity-50" />
                                                        <p className="text-sm font-medium text-muted-foreground">
                                                            Không có thiết kế nào phù hợp với điều kiện lọc của thư mục này
                                                        </p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>)}
                    <DataTablePagination table={table} />
                    <AssetTableBulkActions table={table} />
                </div>
            </div>

            {/* Preview Drawer */}
            <PreviewDrawer
                isOpen={isDrawerOpen}
                onOpenChange={setIsDrawerOpen}
                assetId={selectedAssetId || '0'}
                onAssetUpdated={handleAssetCreated}
            />
        </>
    )
}
