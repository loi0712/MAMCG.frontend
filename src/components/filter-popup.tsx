// components/FilterPopup.tsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Filter, X } from 'lucide-react';
import FilterBuilder, { 
    type FilterQuery, 
    type FilterItem,
    type ColumnWithDataSource 
} from '@/components/ui/filter';
import { Button } from './ui/button';

// ==================== INTERFACES ====================

interface FilterPopupProps {
    columns: ColumnWithDataSource[];
    operators: Array<{ value: string; label: string }>;
    onFiltersApply: (filterQuery: FilterQuery) => Promise<void>;
    initialFilters?: FilterItem[];
    buttonText?: string;
    buttonClassName?: string;
    popupPosition?: 'left' | 'right' | 'center';
    disabled?: boolean;
    showBadge?: boolean;
    autoClose?: boolean;
}

// ==================== UTILITY FUNCTIONS ====================

const generateId = 1;

const createDefaultFilter = (
    columns: ColumnWithDataSource[],
    operators: Array<{ value: string; label: string }>
): FilterItem => ({
    fieldId: generateId.toString(),
    logicalOperator: 'AND',
    column: columns[0]?.value || '',
    operator: operators[0]?.value || '',
    value: ''
});

// ==================== FILTER POPUP COMPONENT ====================

const FilterPopup: React.FC<FilterPopupProps> = ({
    columns,
    operators,
    onFiltersApply,
    initialFilters = [],
    buttonText = "Bộ lọc",
    buttonClassName = "",
    popupPosition = 'left',
    disabled = false,
    showBadge = true,
    autoClose = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [appliedFilters, setAppliedFilters] = useState<FilterItem[]>([]);
    const [isApplying, setIsApplying] = useState(false);
    const popupRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    // Initialize filters
    const memoizedInitialFilters = useMemo(() => {
        if (initialFilters.length > 0) {
            return initialFilters.map((filter, index) => ({
                ...filter,
                fieldId: filter.fieldId || index.toString()
            }));
        }
        
        return [createDefaultFilter(columns, operators)];
    }, [initialFilters, columns, operators]);

    // Update applied filters when initial filters change
    useEffect(() => {
        if (initialFilters.length > 0) {
            setAppliedFilters(memoizedInitialFilters);
        }
    }, [initialFilters, memoizedInitialFilters]);

    // Handle outside click detection
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                popupRef.current &&
                !popupRef.current.contains(event.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            // Use mousedown for better UX
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscapeKey);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, [isOpen]);

    // Handle filter application
    const handleFilterChange = useCallback(async (filterQuery: FilterQuery) => {
        try {
            setIsApplying(true);

            // Update local state to track applied filters
            const newFilters = filterQuery.filters.map((f, index) => ({
                fieldId: index.toString(),
                logicalOperator: f.logicalOperator as 'AND' | 'OR',
                column: f.field,
                operator: f.operator,
                value: f.value
            }));
            
            setAppliedFilters(newFilters);
            await onFiltersApply(filterQuery);

            // Auto close popup after applying filters if enabled
            if (autoClose) {
                setTimeout(() => setIsOpen(false), 300);
            }
        } catch (error) {
            console.error('Lỗi khi áp dụng bộ lọc:', error);
        } finally {
            setIsApplying(false);
        }
    }, [onFiltersApply, autoClose]);

    // Calculate active filter count
    const activeFilterCount = useMemo(() => {
        return appliedFilters.filter(f => 
            f.column && f.operator && f.value && f.value.trim() !== ''
        ).length;
    }, [appliedFilters]);

    // Get popup position classes
    const getPopupPositionClasses = useCallback(() => {
        switch (popupPosition) {
            case 'right':
                return 'right-0 origin-top-right';
            case 'center':
                return 'left-1/2 -translate-x-1/2 origin-top';
            default:
                return 'left-0 origin-top-left';
        }
    }, [popupPosition]);

    // Toggle popup
    const togglePopup = useCallback(() => {
        if (!disabled) {
            setIsOpen(prev => !prev);
        }
    }, [disabled]);

    // Clear all filters
    const handleClearFilters = useCallback(async () => {
        const emptyQuery: FilterQuery = { filters: [] };
        setAppliedFilters([createDefaultFilter(columns, operators)]);
        await onFiltersApply(emptyQuery);
    }, [columns, operators, onFiltersApply]);

    return (
        <div className="relative inline-block">
            {/* Filter Button */}
            <Button
                ref={buttonRef}
                onClick={togglePopup}
                disabled={disabled}
                className={`
                    flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg
                    hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    transition-all duration-200
                    ${activeFilterCount > 0 
                        ? 'bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100' 
                        : 'bg-white text-gray-700'
                    }
                    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    ${isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''}
                    ${buttonClassName}
                `}
                aria-label="Toggle filter menu"
                aria-expanded={isOpen}
                aria-haspopup="true"
            >
                <Filter size={16} className={activeFilterCount > 0 ? 'text-blue-600' : ''} />
                <span className="font-medium">{buttonText}</span>
                
                {/* Filter Count Badge */}
                {showBadge && activeFilterCount > 0 && (
                    <span 
                        className="inline-flex items-center justify-center min-w-[20px] h-5 px-2 bg-blue-600 text-white text-xs font-semibold rounded-full"
                        aria-label={`${activeFilterCount} active filters`}
                    >
                        {activeFilterCount}
                    </span>
                )}
            </Button>

            {/* Filter Popup */}
            {isOpen && (
                <>
                    {/* Backdrop overlay for mobile */}
                    <div 
                        className="fixed inset-0 z-40 bg-black/10 md:hidden"
                        onClick={() => setIsOpen(false)}
                        aria-hidden="true"
                    />

                    {/* Popup Container */}
                    <div
                        ref={popupRef}
                        className={`
                            absolute top-full mt-2 z-50 
                            rounded-lg shadow-2xl border
                            min-w-[800px] max-w-[1000px]
                            animate-in fade-in slide-in-from-top-2 duration-200
                            ${getPopupPositionClasses()}
                        `}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Filter panel"
                    >
                        {/* Popup Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b">
                            <div className="flex items-center gap-2">
                                <Filter size={18} className="" />
                                <h3 className="text-base font-semibold">
                                    Bộ lọc tìm kiếm
                                </h3>
                                {activeFilterCount > 0 && (
                                    <span className="text-sm">
                                        ({activeFilterCount} đang áp dụng)
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                {/* Clear Filters Button */}
                                {activeFilterCount > 0 && (
                                    <button
                                        onClick={handleClearFilters}
                                        className="text-sm text-red-600 hover:text-red-700 hover:underline font-medium transition-colors"
                                        type="button"
                                    >
                                        Xóa tất cả
                                    </button>
                                )}

                                {/* Close Button */}
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                                    aria-label="Close filter panel"
                                    type="button"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Filter Builder Content */}
                        <div className="p-4">
                            <FilterBuilder
                                columns={columns}
                                operators={operators}
                                onFiltersApply={handleFilterChange}
                                initialFilters={memoizedInitialFilters}
                                autoApply={false}
                                debounceMs={0}
                                isSearch={false}
                            />
                        </div>

                        {/* Loading Overlay */}
                        {isApplying && (
                            <div className="absolute inset-0 flex items-center justify-center rounded-lg">
                                <div className="flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg">
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent" />
                                    <span className="text-sm font-medium">
                                        Đang áp dụng...
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default React.memo(FilterPopup);
