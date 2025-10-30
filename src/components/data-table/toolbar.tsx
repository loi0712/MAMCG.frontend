import { Cross2Icon } from '@radix-ui/react-icons'
import { type Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import FilterPopup from '@/components/filter-popup'
import { type FilterQuery } from '@/components/ui/filter'
import { DataTableViewOptions } from './view-options'
import { useMemo, useCallback, useState } from 'react'
import { FolderOpen, Pen } from 'lucide-react'
import { AssetsCreateNewDialog } from '@/features/asset/components/asset-create-new'

type DataTableToolbarProps<TData> = {
  folderPath: string
  totalCount: number
  table: Table<TData>
  searchPlaceholder?: string
  searchKey?: string
  onFiltersApply?: (filterQuery: FilterQuery) => Promise<void>
  onAssetCreated?: () => Promise<void> // Callback khi tạo asset thành công
  columns?: Array<{ value: string; label: string }>
  operators?: Array<{ value: string; label: string }>
  filters?: {
    columnId: string
    title: string
    options: {
      label: string
      value: string
      icon?: React.ComponentType<{ className?: string }>
    }[]
  }[]
}

export function DataTableToolbar<TData>({
  folderPath,
  totalCount,
  table,
  onFiltersApply,
  onAssetCreated,
  columns = [],
  operators = [],
  // filters = [],
}: DataTableToolbarProps<TData>) {
  // State để manage create asset dialog
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const isFiltered =
    table.getState().columnFilters.length > 0 || table.getState().globalFilter

  const defaultColumns = useMemo(() => {
    if (columns.length > 0) return columns;
    
    return table.getAllColumns()
      .filter(column => column.getCanFilter())
      .map(column => ({
        value: column.id,
        label: (column.columnDef.header as string) || column.id
      }));
  }, [columns, table]);

  const defaultOperators = useMemo(() => {
    if (operators.length > 0) return operators;
    
    return [
      { value: 'contains', label: 'contains' },
      { value: 'equals', label: 'equals' },
      { value: 'notEquals', label: 'not equals' },
      { value: 'startsWith', label: 'starts with' },
      { value: 'endsWith', label: 'ends with' },
      { value: 'greaterThan', label: 'greater than' },
      { value: 'lessThan', label: 'less than' },
      { value: 'isEmpty', label: 'is empty' },
      { value: 'isNotEmpty', label: 'is not empty' }
    ];
  }, [operators]);

  const handleFiltersApply = useCallback(async (filterQuery: FilterQuery): Promise<void> => {
    try {
      if (onFiltersApply) {
        await onFiltersApply(filterQuery);
      } else {
        // Client-side filtering
        table.resetColumnFilters();
        
        filterQuery.filters.forEach(filter => {
          const column = table.getColumn(filter.field);
          if (column) {
            switch (filter.operator) {
              case 'contains':
                column.setFilterValue(filter.value);
                break;
              case 'equals':
                column.setFilterValue(filter.value);
                break;
              // ... other operators
              default:
                column.setFilterValue(filter.value);
            }
          }
        });
      }
    } catch (error) {
      console.error('Failed to apply filters:', error);
      throw error;
    }
  }, [onFiltersApply, table]);

  const handleResetFilters = useCallback((): void => {
    table.resetColumnFilters();
    table.setGlobalFilter('');
    
    if (onFiltersApply) {
      onFiltersApply({ filters: [] }).catch((error: Error) => {
        console.error('Failed to reset filters:', error);
      });
    }
  }, [table, onFiltersApply]);

  // Handler cho create button
  const handleCreateAsset = useCallback(() => {
    setIsCreateDialogOpen(true);
  }, []);

  // Handler khi dialog đóng
  const handleCreateDialogClose = useCallback((created: boolean = false) => {
    setIsCreateDialogOpen(false);
    
    // Nếu asset được tạo thành công, gọi callback để refresh data
    if (created && onAssetCreated) {
      onAssetCreated().catch((error) => {
        console.error('Failed to refresh data after asset creation:', error);
      });
    }
  }, [onAssetCreated]);

  return (
    <>
      <div className='flex items-center justify-between '>
        <div className='flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2'>
          <div className="flex items-center space-x-2">
            <FolderOpen className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">
              {folderPath}
            </h2>
            <span className="text-sm text-muted-foreground">
              ({totalCount})
            </span>
          </div>
        </div>
        
        <div className='flex items-center gap-x-2'>
          <FilterPopup
            columns={defaultColumns}
            operators={defaultOperators}
            onFiltersApply={handleFiltersApply}
            buttonText="Lọc"
            buttonClassName="h-8"
            popupPosition="right"
          />

          <DataTableViewOptions table={table} />

          {isFiltered && (
            <Button
              variant='ghost'
              onClick={handleResetFilters}
              className='h-8 px-2 lg:px-3'
            >
              Reset
              <Cross2Icon className='ms-2 h-4 w-4' />
            </Button>
          )}
          
          <Button 
            className='space-x-1 h-8' 
            onClick={handleCreateAsset}
          >
            <span>Tạo thiết kế</span> 
            <Pen size={16} />
          </Button>
        </div>
      </div>

      {/* Create Asset Dialog */}
      <AssetsCreateNewDialog
        open={isCreateDialogOpen}
        onOpenChange={(open: any) => handleCreateDialogClose(!open)}
      />
    </>
  );
}
