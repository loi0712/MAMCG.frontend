// FilterBuilder.tsx - CORRECTED with proper fieldId/columnId usage
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Plus, X, Trash2, Loader2 } from 'lucide-react';
import { Field } from '../layout/api/get-folder-details';

// ==================== INTERFACES ====================

interface Filter {
    fieldId: number;        // ✅ The actual field ID for API
    operator: string;
    value: string;
    logicalGroup: string;
    sortOrder: number;
}

export interface FilterQuery {
    filters: Filter[];
}

export interface FilterItem {
    columnId: string;           // ✅ Internal unique ID for React keys
    logicalOperator: 'AND' | 'OR';
    fieldId: number;            // ✅ Actual field ID
    fieldName: string;          // ✅ Field name for display
    operator: string;
    value: string;
}

export interface DataSource {
    value: string;
    label: string;
    groupId?: string;
}

export interface ColumnWithDataSource {
    id: number;
    value: string;
    label: string;
    dataType: {
        name: string;
        dataSource?: DataSource[];
    };
}

interface FilterBuilderProps {
    columns: ColumnWithDataSource[];
    operators: Array<{ value: string; label: string }>;
    onFiltersApply: (filterQuery: FilterQuery) => Promise<void>;
    initialFilters?: FilterItem[];
    debounceMs?: number;
    autoApply?: boolean;
    isSearch?: boolean;
}

interface FilterRowProps {
    filter: FilterItem;
    filters: FilterItem[];
    isFirst: boolean;
    columns: ColumnWithDataSource[];
    operators: Array<{ value: string; label: string }>;
    onUpdate: (id: string, updates: Partial<FilterItem>) => void;
    onRemove: (id: string) => void;
    disabled?: boolean;
}

// ==================== CONSTANTS ====================

const LOGICAL_OPERATORS = [
    { value: 'AND', label: 'Và' },
    { value: 'OR', label: 'Hoặc' }
] as const;

// ==================== UTILITY FUNCTIONS ====================

/**
 * Generate unique column ID for React keys (internal use only)
 */
const generateColumnId = (): string => {
    return `col-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Parse datasource string to array of standardized options
 */
export const parseDatasource = (datasourceStr: string | null): DataSource[] => {
    if (!datasourceStr || datasourceStr.trim() === '') {
        return [];
    }

    try {
        const parsed = JSON.parse(datasourceStr);

        if (!Array.isArray(parsed)) {
            console.warn('Datasource is not an array:', parsed);
            return [];
        }

        return parsed.map((item: any) => ({
            value: item.Id || item.id || '',
            label: item.Name || item.name || '',
            ...(item.GroupId && { groupId: item.GroupId })
        }));
    } catch (error) {
        console.error('Failed to parse datasource:', error, datasourceStr);
        return [];
    }
};

/**
 * Transform API fields to FilterBuilder columns format
 */
export const transformFieldsToColumns = (fields: Field[]): ColumnWithDataSource[] => {
    return fields.map(field => ({
        id: field.id,
        value: field.fieldName,
        label: field.displayName,
        dataType: {
            name: field.dataType.name,
            dataSource: parseDatasource(field.dataType.datasource)
        }
    }));
};

/**
 * Filter columns that can be used for filtering
 */
export const getFilterableColumns = (
    fields: Field[],
    excludedTypes: string[] = ['image']
): ColumnWithDataSource[] => {
    const filterableFields = fields.filter(
        field => !excludedTypes.includes(field.dataType.name)
    );
    
    return transformFieldsToColumns(filterableFields);
};

/**
 * Get filtered datasource based on parent field dependency
 */
const getFilteredDataSource = (
    dataSource: DataSource[],
    parentFieldName: string,
    filters: FilterItem[]
): DataSource[] => {
    if (!dataSource || dataSource.length === 0) {
        return [];
    }

    const parentFilter = filters.find(f => f.fieldName === parentFieldName);

    if (!parentFilter?.value) {
        return dataSource;
    }

    return dataSource.filter(item => item.groupId === parentFilter.value);
};

// ==================== FILTER ROW COMPONENT ====================
const FilterRow = React.memo<FilterRowProps>(({
    filter,
    filters,
    isFirst,
    columns,
    operators,
    onUpdate,
    onRemove,
    disabled = false
}) => {
    const selectedColumn = useMemo(() =>
        columns.find(col => col.id === filter.fieldId),
        [columns, filter.fieldId]
    );

    const hasDataSource = useMemo(() =>
        selectedColumn?.dataType.dataSource &&
        selectedColumn.dataType.dataSource.length > 0,
        [selectedColumn]
    );

    const filteredDataSource = useMemo(() => {
        if (!hasDataSource || !selectedColumn) return [];

        const dataSource = selectedColumn.dataType.dataSource!;
        const hasGroupDependency = dataSource.some(item => item.groupId);

        if (filter.fieldName === 'Category' && hasGroupDependency) {
            return getFilteredDataSource(dataSource, 'CategoryGroup', filters);
        }

        return dataSource;
    }, [hasDataSource, selectedColumn, filter.fieldName, filters]);

    const handleColumnChange = useCallback((newFieldId: string) => {
        const fieldIdNum = parseInt(newFieldId);
        const newColumn = columns.find(col => col.id === fieldIdNum);

        if (newColumn) {
            onUpdate(filter.columnId, {
                fieldId: newColumn.id,
                fieldName: newColumn.value,
                operator: '',
                value: ''
            });
        }
    }, [filter.columnId, columns, onUpdate]);

    const handleFieldUpdate = useCallback((field: keyof FilterItem, value: string) => {
        onUpdate(filter.columnId, { [field]: value });
    }, [filter.columnId, onUpdate]);

    return (
        <div className="grid grid-cols-[auto_80px_1fr_1fr_1fr] gap-3 items-end mb-3 p-3 rounded-md hover:bg-muted/50 transition-colors">
            {/* Remove button */}
            <button
                className="flex items-center justify-center w-9 h-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition flex-shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={() => onRemove(filter.columnId)}
                disabled={disabled}
                type="button"
                aria-label="Xóa bộ lọc"
            >
                <X size={16} />
            </button>

            {/* Logical Operator */}
            {isFirst ? (
                <div></div>
            ) : (
                <select
                    className="h-9 px-3 border border-input rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    value={filter.logicalOperator}
                    onChange={(e) => handleFieldUpdate('logicalOperator', e.target.value)}
                    disabled={disabled}
                    aria-label="Toán tử logic"
                >
                    {LOGICAL_OPERATORS.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            )}

            {/* Field Column */}
            <div className="flex flex-col gap-1">
                <label className="font-medium text-xs text-muted-foreground">
                    Trường dữ liệu
                </label>
                <select
                    className="h-9 px-3 border border-input rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    value={filter.fieldId}
                    onChange={(e) => handleColumnChange(e.target.value)}
                    disabled={disabled}
                >
                    <option value="">Chọn trường...</option>
                    {columns.map(column => (
                        <option key={column.id} value={column.id}>
                            {column.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Operator */}
            <div className="flex flex-col gap-1">
                <label className="font-medium text-xs text-muted-foreground">
                    Điều kiện
                </label>
                <select
                    className="h-9 px-3 border border-input rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    value={filter.operator}
                    onChange={(e) => handleFieldUpdate('operator', e.target.value)}
                    disabled={disabled || !filter.fieldId}
                >
                    <option value="">Chọn điều kiện...</option>
                    {operators.map(operator => (
                        <option key={operator.value} value={operator.value}>
                            {operator.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Value */}
            <div className="flex flex-col gap-1">
                <label className="font-medium text-xs text-muted-foreground">
                    Giá trị
                </label>
                {hasDataSource ? (
                    <select
                        className="h-9 px-3 border border-input rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                        value={filter.value}
                        onChange={(e) => handleFieldUpdate('value', e.target.value)}
                        disabled={disabled || !filter.fieldId}
                    >
                        <option value="">Chọn giá trị...</option>
                        {filteredDataSource.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                ) : (
                    <input
                        type="text"
                        className="h-9 px-3 border border-input rounded-md text-sm bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="Nhập giá trị"
                        value={filter.value}
                        onChange={(e) => handleFieldUpdate('value', e.target.value)}
                        disabled={disabled || !filter.fieldId}
                    />
                )}
            </div>
        </div>
    );
});

FilterRow.displayName = 'FilterRow';

// ==================== FILTER BUILDER COMPONENT ====================

const FilterBuilder: React.FC<FilterBuilderProps> = ({
    columns = [],
    operators = [],
    onFiltersApply,
    initialFilters = [],
    autoApply = true,
    isSearch = false,
}) => {
    // ✅ Create default filter with proper structure
    const createDefaultFilter = useCallback((): FilterItem => {
        if (columns.length === 0 || operators.length === 0) {
            console.warn('Cannot create filter: columns or operators missing');
            return {
                columnId: generateColumnId(),
                logicalOperator: 'AND',
                fieldId: 0,
                fieldName: '',
                operator: '',
                value: ''
            };
        }

        return {
            columnId: generateColumnId(),
            logicalOperator: 'AND',
            fieldId: columns[0].id,
            fieldName: columns[0].value,
            operator: operators[0].value,
            value: ''
        };
    }, [columns, operators]);

    const initialState = useMemo(() => {
        if (initialFilters.length > 0) {
            return initialFilters.map((filter) => ({
                ...filter,
                columnId: filter.columnId || generateColumnId()
            }));
        }
        return [createDefaultFilter()];
    }, [initialFilters, createDefaultFilter]);

    const [filters, setFilters] = useState<FilterItem[]>(initialState);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const prevInitialFiltersRef = useRef<string>('');
    const isMountedRef = useRef(true);

    useEffect(() => {
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        if (initialFilters.length > 0) {
            const newHash = JSON.stringify(initialFilters);
            if (newHash !== prevInitialFiltersRef.current) {
                setFilters(initialFilters.map((filter) => ({
                    ...filter,
                    columnId: filter.columnId || generateColumnId()
                })));
                prevInitialFiltersRef.current = newHash;
            }
        }
    }, [initialFilters]);

    useEffect(() => {
        if (columns.length > 0 && filters.length > 0) {
            const validFieldIds = new Set(columns.map(col => col.id));
            const needsUpdate = filters.some(f => f.fieldId && !validFieldIds.has(f.fieldId));

            if (needsUpdate) {
                setFilters(currentFilters =>
                    currentFilters.map(filter => {
                        if (!filter.fieldId || !validFieldIds.has(filter.fieldId)) {
                            return {
                                ...filter,
                                fieldId: columns[0]?.id || 0,
                                fieldName: columns[0]?.value || '',
                                operator: operators[0]?.value || '',
                                value: ''
                            };
                        }
                        return filter;
                    })
                );
            }
        }
    }, [columns, operators, filters]);

    // ✅ CORRECT: Build filter query with API format
    const buildFilterQuery = useCallback((filters: FilterItem[]): FilterQuery => {
        console.log('🔍 [DEBUG] Building filter query from:', filters);

        const validFilters = filters.filter(f => {
            const isValid = f.fieldId && 
                           f.fieldName &&
                           f.operator && 
                           f.value && 
                           f.value.trim() !== '';
            
            if (!isValid) {
                console.log('⚠️ [DEBUG] Skipping invalid filter:', f);
            }
            return isValid;
        });

        console.log('✅ [DEBUG] Valid filters:', validFilters);

        if (validFilters.length === 0) {
            console.log('⚠️ [DEBUG] No valid filters found, returning empty query');
            return { filters: [] };
        }

        // ✅ Build API format with fieldId as number
        const filterQuery: FilterQuery = {
            filters: validFilters.map((filter, index) => ({
                fieldId: filter.fieldId,           // ✅ Number for API
                operator: filter.operator,
                value: filter.value.trim(),
                logicalGroup: filter.logicalOperator,
                sortOrder: index
            }))
        };

        console.log('📤 [DEBUG] Final filter query:', JSON.stringify(filterQuery, null, 2));
        return filterQuery;
    }, []);

    useEffect(() => {
        if (!autoApply) return;
        if (filters.length === 0) return;
            const filterQuery = buildFilterQuery(filters);
    
            (async () => {
                try {
                    setIsLoading(true);
                    setError(null);
                    await onFiltersApply(filterQuery).then(()=> setIsLoading(false));
                } catch (err) {
                    if (isMountedRef.current) {
                        const errorMessage = err instanceof Error ? err.message : 'Lọc dữ liệu thất bại';
                        setError(errorMessage);
                        console.error('❌ [API] Auto apply failed:', err);
                    }
                } finally {
                    if (isMountedRef.current) setIsLoading(false);
                }
            })();
    }, [filters, autoApply, onFiltersApply, buildFilterQuery]);

    const addFilter = useCallback(() => {
        if (columns.length === 0) {
            console.warn("Cannot add filter: no columns available.");
            return;
        }

        const newFilter: FilterItem = {
            columnId: generateColumnId(),
            logicalOperator: 'AND',
            fieldId: columns[0].id,
            fieldName: columns[0].value,
            operator: operators[0]?.value || '',
            value: ''
        };

        console.log('➕ [DEBUG] Adding new filter:', newFilter);
        setFilters(prev => [...prev, newFilter]);
    }, [columns, operators]);

    const removeFilter = useCallback((columnId: string) => {
        console.log('➖ [DEBUG] Removing filter:', columnId);
        setFilters(prev => {
            const newFilters = prev.filter(filter => filter.columnId !== columnId);
            return newFilters.length > 0 ? newFilters : [createDefaultFilter()];
        });
    }, [createDefaultFilter]);

    const updateFilter = useCallback(async (columnId: string, updates: Partial<FilterItem>) => {
        console.log('✏️ [DEBUG] Updating filter:', columnId, 'with:', updates);
        setFilters(prev => prev.map(filter =>
            filter.columnId === columnId ? { ...filter, ...updates } : filter
        ));
    }, []);

    const removeAllFilters = useCallback(() => {
        console.log('🗑️ [DEBUG] Removing all filters');
        setFilters([createDefaultFilter()]);
    }, [createDefaultFilter]);

    const handleManualApply = useCallback(async () => {
        if (autoApply) return;

        console.log('🔍 [MANUAL] Manually applying filters:', filters);

        try {
            setIsLoading(true);
            setError(null);
            const filterQuery = buildFilterQuery(filters);
            console.log('📤 [MANUAL] Sending filter query:', filterQuery);
            await onFiltersApply(filterQuery).then(()=> setIsLoading(false));
            console.log('✅ [MANUAL] Manual apply succeeded');
        } catch (err) {
            if (isMountedRef.current) {
                setError(err instanceof Error ? err.message : 'Áp dụng bộ lọc thất bại');
                console.error('❌ [MANUAL] Manual apply failed:', err);
            }
        } finally {
            if (isMountedRef.current) {
                setIsLoading(false);
            }
        }
    }, [autoApply, buildFilterQuery, filters, onFiltersApply]);

    const renderedFilters = useMemo(() =>
        filters.map((filter, index) => (
            <FilterRow
                key={filter.columnId}
                filter={filter}
                filters={filters}
                isFirst={index === 0}
                columns={columns}
                operators={operators}
                onUpdate={updateFilter}
                onRemove={removeFilter}
                disabled={isLoading}
            />
        )), [filters, columns, operators, updateFilter, removeFilter, isLoading]
    );

    if (isSearch) {
        return (
            <div className="border border-border rounded-lg p-4 bg-card min-w-[800px] shadow-sm">
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-border">
                    <h3 className="font-semibold text-base flex items-center gap-2">
                        Bộ lọc tổng hợp
                        {isLoading && <Loader2 className="animate-spin ml-2 text-primary" size={16} />}
                    </h3>
                </div>

                {error && (
                    <div className="bg-destructive/10 border border-destructive/20 text-destructive p-3 rounded-md mb-3 flex justify-between items-center text-sm animate-in fade-in-0 slide-in-from-top-2 duration-200" role="alert">
                        <span>⚠️ {error}</span>
                        <button
                            onClick={() => setError(null)}
                            className="text-destructive hover:text-destructive/80 transition-colors"
                            type="button"
                            aria-label="Dismiss error"
                        >
                            ×
                        </button>
                    </div>
                )}

                <div className="mb-4">{renderedFilters}</div>

                <div className="flex justify-between items-center pt-3 border-t border-border">
                    <button
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-xs font-semibold uppercase hover:bg-primary/90 disabled:opacity-60 transition-colors"
                        onClick={addFilter}
                        disabled={isLoading}
                        type="button"
                    >
                        <Plus size={16} /> THÊM FILTER
                    </button>

                    <div className="flex gap-2">
                        {!autoApply && (
                            <button
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md text-xs font-semibold uppercase hover:bg-green-700 disabled:opacity-60 transition-colors"
                                onClick={handleManualApply}
                                disabled={isLoading}
                                type="button"
                            >
                                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <span>🔍</span>}
                                ÁP DỤNG
                            </button>
                        )}
                        <button
                            className="flex items-center gap-2 px-4 py-2 border border-border rounded-md text-xs font-semibold uppercase hover:bg-muted disabled:opacity-60 transition-colors"
                            onClick={removeAllFilters}
                            disabled={isLoading}
                            type="button"
                        >
                            <Trash2 size={16} /> XOA TẤT CẢ
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="border border-border rounded-lg p-4 bg-card min-w-[800px]">
            {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive p-3 rounded-md mb-3 flex justify-between items-center text-sm animate-in fade-in-0 slide-in-from-top-2 duration-200" role="alert">
                    <span>⚠️ {error}</span>
                    <button
                        onClick={() => setError(null)}
                        className="text-destructive hover:text-destructive/80 transition-colors"
                        type="button"
                        aria-label="Dismiss error"
                    >
                        ×
                    </button>
                </div>
            )}

            <div className="mb-4">{renderedFilters}</div>

            <div className="flex justify-between items-center pt-3 border-t border-border">
                <div></div>
                <div className="flex gap-2">
                    {!autoApply && (
                        <button
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md text-xs font-semibold uppercase hover:bg-green-700 disabled:opacity-60 transition-colors"
                            onClick={handleManualApply}
                            disabled={isLoading}
                            type="button"
                        >
                            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <span>🔍</span>}
                            ÁP DỤNG
                        </button>
                    )}
                    <button
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-xs font-semibold uppercase hover:bg-primary/90 disabled:opacity-60 transition-colors"
                        onClick={addFilter}
                        disabled={isLoading}
                        type="button"
                    >
                        <Plus size={16} /> THÊM FILTER
                    </button>
                    <button
                        className="flex items-center gap-2 px-4 py-2 border border-border rounded-md text-xs font-semibold uppercase hover:bg-muted disabled:opacity-60 transition-colors"
                        onClick={removeAllFilters}
                        disabled={isLoading}
                        type="button"
                    >
                        <Trash2 size={16} /> XOA TẤT CẢ
                    </button>
                </div>
            </div>
        </div>
    );
};

export default React.memo(FilterBuilder);