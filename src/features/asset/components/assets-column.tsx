 
// components/assets/assets-columns.tsx
import { useMemo } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { type Asset, type ParsedAsset } from '../api/get-assets'
import { AssetTableRowActions } from './asset-table-row-actions'
import { env } from "@/config/env";

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

// Custom cell renderer based on field name and data type
const renderCellByFieldName = (value: any, fieldName: string, dataTypeName: string, color?: string) => {
    // Handle image fields (typically Thumbnail)
    if (fieldName.toLowerCase().includes('thumbnail') || fieldName.toLowerCase().includes('image')) {
        return value ? (
            <div className='flex items-center justify-center w-36 py-1'>
                <div className='relative'>
                    <img
                        src={env.apiUrl +""+ value}
                        alt={`${fieldName} thumbnail`}
                        className='w-32 h-18 object-cover border border-gray-200 shadow-sm rounded-sm'
                    />
                </div>
            </div>
        ) : (
            <div className='w-36 border h-18 flex items-center justify-center rounded-sm'>
                <span className='text-xs'>No image</span>
            </div>
        )
    }

    // Handle status fields with badges
    if (fieldName.toLowerCase() === 'status') {
        return (
            <Badge
            variant='outline'
            className='capitalize p-1 text-white'
            style={{
                // backgroundColor: color,
                color: color
            }}
            >
                {value || 'N/A'}
            </Badge>
        )
    }

    if (fieldName.toLowerCase() === 'description') {
        try {
            // Check if the value is a JSON string before parsing
            if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
                const parsedData = JSON.parse(value);
                
                const formattedContent = parsedData
                    .map((item: { title: string; content: string }) => 
                        `${item.title}: ${item.content}`
                    )
                    .join(', ');
                
                return (
                    <div className='max-w-36'>
                        <LongText>{formattedContent || '-'}</LongText>
                    </div>
                );
            }

            // If it's not a JSON string, treat it as a regular string
            return (
                <div className='max-w-36'>
                    <LongText>{value || '-'}</LongText>
                </div>
            );
        } catch (error) {
            console.error('Error parsing table ', error);
            return (
                <div className='max-w-36'>
                    <LongText>{value || '-'}</LongText>
                </div>
            );
        }
    }
    
    return (
        <div className='max-w-36'>
            <LongText>{value || '-'}</LongText>
        </div>
    )
}

export const useAssetColumns = (assets: Asset[]): ColumnDef<ParsedAsset>[] => {
    return useMemo(() => {
        const uniqueFieldNames = extractUniqueFieldNames(assets)

        const staticColumns: ColumnDef<ParsedAsset>[] = [
            // Selection column
            {
                id: 'select',
                header: ({ table }) => (
                    <Checkbox
                        checked={
                            table.getIsAllPageRowsSelected() ||
                            (table.getIsSomePageRowsSelected() && 'indeterminate')
                        }
                        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                        aria-label='Select all'
                    />
                ),
                meta: {
                    className: cn('sticky md:table-cell start-0 rounded-tl-[inherit]'),
                },
                cell: ({ row }) => (
                    <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                        aria-label='Select row'
                        className='translate-y-[2px]'
                    />
                ),
                enableSorting: false,
                enableHiding: false,
            },
        ]

        // Generate dynamic columns based on unique field names
        const dynamicColumns: ColumnDef<ParsedAsset>[] = uniqueFieldNames
            .map(fieldName => {
                const fieldDef = getFieldDefinition(assets, fieldName)
                const isImageField = fieldName.toLowerCase().includes('thumbnail') || fieldName.toLowerCase().includes('image')

                return {
                    // Use accessorFn instead of accessorKey for nested data access
                    accessorFn: (row) => {
                        // Find the field with matching fieldName and return its value
                        const field = row.fields?.find(f => f.fieldName === fieldName)
                        return field?.value || null
                    },
                    id: fieldName, // Required when using accessorFn
                    header: ({ column }) => (
                        <DataTableColumnHeader
                            column={column}
                            title={fieldDef?.displayName || fieldName}
                        />
                    ),
                    cell: ({ row }) => {
                        // Use getValue with the field ID
                        const value = row.getValue(fieldName)
                        const field = row.original.fields?.find(f => f.fieldName === fieldName)
                        const color = field?.color || fieldDef?.color
                        return renderCellByFieldName(value, fieldName, field?.dataType.name || '', color)
                    },
                    meta: {
                        className: isImageField ? 'w-36' : ''
                    },
                    enableSorting: !isImageField,
                    filterFn: fieldName === 'Status' || fieldName === 'status' ? (row, id, value) => {
                        return value.includes(row.getValue(id))
                    } : undefined,
                }
            })

        // Actions column (commented out - uncomment when ready to use)
        const actionColumn: ColumnDef<ParsedAsset> = {
            id: 'actions',
            cell: ({ row }) => <AssetTableRowActions row={row} />,
        }

        return [...staticColumns, ...dynamicColumns, actionColumn]
    }, [assets])
}
