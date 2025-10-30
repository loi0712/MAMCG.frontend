import { apiUrls } from '@/api/config/endpoints'
import { axios } from '@/shared/lib/axios'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner';

// ===========================================
// TYPES
// ===========================================

export interface DataSource {
    Id: string;
    Name: string;
    GroupId?: string | null;
}

export interface DataType {
    id: number;
    name: string;
    datasource: string | null;
}

export interface DynamicField {
    id: number;
    fieldName: string;
    displayName: string;
    dataType: DataType;
}

export interface FieldsJSONItem {
    id: number;
    fieldName: string;
    value: string;
}

export interface CreateAssetRequest {
    FieldsJSON: string;
    file: File;
}

export interface CreateAssetResponse {
    id: number;
    message: string;
    success: boolean;
}

// ===========================================
// UTILITY FUNCTIONS
// ===========================================

/**
 * Parse datasource JSON string to array of DataSource objects
 */
export const parseDatasource = (datasource: string | null): DataSource[] => {
    if (!datasource) return [];
    
    try {
        return JSON.parse(datasource);
    } catch (error) {
        console.error('Error parsing datasource:', error);
        return [];
    }
};

/**
 * Get select items for dropdown from datasource
 */
export const getSelectItems = (datasource: string | null) => {
    const options = parseDatasource(datasource);
    return options.map((item) => ({
        label: item.Name,
        value: item.Id,
        groupId: item.GroupId ?? null
    }));
};

/**
 * Check if field is required based on its type
 */
export const isFieldRequired = (field: DynamicField): boolean => {
    return ['singleline', 'category', 'project', 'assettype'].includes(field.dataType.name);
};

export const getFieldKey = (fieldId: number): string => {
    return `field_${fieldId}`;
};

/**
 * Transform form values to submit format - Updated for new API structure
 */
export const transformFormValues = (
    values: Record<string, any>,
    fields: DynamicField[]
): FormData => {
    const formData = new FormData();
    const fieldsJSON: FieldsJSONItem[] = fields.map((field) => {
        const fieldKey = getFieldKey(field.id);
        let fieldValue = values[fieldKey] || '';

        if (field.dataType.name === 'table' && Array.isArray(fieldValue)) {
            fieldValue = JSON.stringify(fieldValue);
        }

        return {
            id: field.id,
            fieldName: field.fieldName,
            value: fieldValue,
        };
    });

    formData.append('FieldsJSON', JSON.stringify(fieldsJSON));
    if (values.file) {
        if (values.file instanceof FileList) {
            for (let i = 0; i < values.file.length; i++) {
                formData.append('file', values.file[i]);
            }
        } else if (values.file instanceof File) {
            formData.append('file', values.file);
        }
    }

    return formData;
};

/**
 * Generate default form values
 */
export const generateDefaultValues = (fields: DynamicField[]): Record<string, string> => {
    const values: Record<string, string> = {};
    
    fields.forEach((field) => {
        const fieldKey = getFieldKey(field.id);
        values[fieldKey] = '';
    });
    return values;
};

// ===========================================
// API FUNCTIONS
// ===========================================

/**
 * Fetch dynamic fields for create asset form
 * GET /Asset/upload-info
 */
export const getDynamicFieldsForCreate = async ({ 
    signal 
}: { signal?: AbortSignal } = {}): Promise<DynamicField[]> => {
    const response = await axios.get<DynamicField[]>(apiUrls.asset.uploadInfo, {
        signal
    });

    return response.data;
};

/**
 * Create new asset with dynamic fields - Updated for new request format
 * POST /Asset/create
 */
export const createAssetWithFields = async ( data: FormData ): Promise<CreateAssetResponse> => {
    
    const response = await axios.post<CreateAssetResponse>(apiUrls.asset.create, data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        }
    });

    return response.data;
};

// ===========================================
// CUSTOM HOOKS
// ===========================================

/**
 * Hook for fetching dynamic fields for create form
 */
export const useDynamicFieldsForCreate = ({ enabled }: { enabled: boolean }) =>
    useQuery({
        queryKey: ['dynamic-fields-create'],
        queryFn: ({ signal }) => getDynamicFieldsForCreate({ signal }),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        enabled,
    });

/**
 * Enhanced hook with form utilities
 */
export const useDynamicFieldsForCreateForm = ({ enabled }: { enabled: boolean }) => {
    const query = useDynamicFieldsForCreate({ enabled });

    return {
        ...query,
        fields: query.data || [],
        isLoadingFields: query.isLoading,
        hasFields: (query.data?.length || 0) > 0,
        defaultValues: query.data ? generateDefaultValues(query.data) : {},
        fieldError: query.error,
    };
};

/**
 * Mutation hook for creating assets - Updated with better error handling
 */
export const useCreateAsset = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: createAssetWithFields,
        onSuccess: () => {
            toast.success('Tạo thiết kế thành công!');
            // Invalidate relevant queries
            queryClient.invalidateQueries({ queryKey: ['assets'] });
            queryClient.invalidateQueries({ queryKey: ['dynamic-fields-create'] });
        },
        onError: (error: any) => {
            console.error('Error creating asset:', error);
            // Log detailed error information
            if (error.response) {
                console.error('Error response:', error.response.data);
                console.error('Error status:', error.response.status);
            }
        }
    });
};

/**
 * Hook for prefetching dynamic fields
 */
export const usePrefetchDynamicFieldsForCreate = () => {
    const queryClient = useQueryClient();
    
    const prefetchFields = () => {
        return queryClient.prefetchQuery({
            queryKey: ['dynamic-fields-create'],
            queryFn: ({ signal }) => getDynamicFieldsForCreate({ signal }),
            staleTime: 5 * 60 * 1000,
        });
    };
    
    return { prefetchFields };
};
