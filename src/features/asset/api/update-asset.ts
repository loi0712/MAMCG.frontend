// ===========================================
// TYPES - UPDATE
// ===========================================

import { axios } from "@/shared/lib/axios";
import { DynamicField, FieldsJSONItem } from "./create";
import { apiUrls } from "@/api/config/endpoints";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export interface UpdateAssetRequest {
    actionId: string;
    comment?: string;
    FieldsJSON: string;
    File?: File
}

export interface UpdateAssetResponse {
    id: number;
    message: string;
    success: boolean;
}

// ===========================================
// UTILITY FUNCTIONS - UPDATE
// ===========================================

/**
 * Transform form values for update - includes comment and actionType
 */
export const transformFormValuesForUpdate = (
    values: Record<string, any>,
    fields: DynamicField[],
    actionId: string,
    comment?: string
): UpdateAssetRequest => {
    const fieldsJSON: FieldsJSONItem[] = fields.map((field) => {
        // Use fieldName directly as key for update form
        const fieldValue = values[field.fieldName] || '';
        
        return {
            id: field.id,
            fieldName: field.fieldName,
            value: fieldValue,
        };
    });

    const transformedData: UpdateAssetRequest = {
        actionId,
        FieldsJSON: JSON.stringify(fieldsJSON)
    };

    // Add comment if provided
    if (comment) {
        transformedData.comment = comment;
    }

    return transformedData;
};

/**
 * Generate default values for update form from existing asset data
 */
export const generateDefaultValuesForUpdate = (
    fields: Array<{ fieldName: string; value: string }>
): Record<string, string> => {
    const values: Record<string, string> = { comment: '' };
    
    fields.forEach((field) => {
        values[field.fieldName] = field.value || '';
    });
    
    return values;
};

// ===========================================
// API FUNCTIONS - UPDATE
// ===========================================

/**
 * Update existing asset with dynamic fields
 * PUT /Asset/update/{assetId}
 */
export const updateAssetWithFields = async (
    assetId: string,
    data: UpdateAssetRequest
): Promise<UpdateAssetResponse> => {
    
    const response = await axios.put<UpdateAssetResponse>(
        apiUrls.asset.update(assetId),
        data,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        }
    );
    
    return response.data;
};

// ===========================================
// CUSTOM HOOKS - UPDATE
// ===========================================

/**
 * Mutation hook for updating assets
 */
export const useUpdateAsset = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ assetId, data }: { assetId: string; data : UpdateAssetRequest }) => 
            updateAssetWithFields(assetId, data),
        onSuccess: (data, variables) => {
            // Invalidate relevant queries
            queryClient.invalidateQueries({ queryKey: ['assets'] });
            queryClient.invalidateQueries({ queryKey: ['asset-detail', variables.assetId] });
        },
        onError: (error: any) => {
            console.error('Error updating asset:', error);
            if (error.response) {
                console.error('Error response:', error.response.data);
                console.error('Error status:', error.response.status);
            }
        }
    });
};

/**
 * Enhanced mutation hook with loading states and callbacks
 */
export const useUpdateAssetWithCallbacks = (
    onSuccessCallback?: ( data : UpdateAssetResponse) => void,
    onErrorCallback?: (error: any) => void
) => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ assetId, data }: { assetId: string; data : UpdateAssetRequest }) => 
            updateAssetWithFields(assetId, data),
        onSuccess: (data, variables) => {
            // Invalidate and refetch
            queryClient.invalidateQueries({ queryKey: ['assets'] });
            queryClient.invalidateQueries({ queryKey: ['asset-detail', variables.assetId] });
            
            // Call custom success callback
            onSuccessCallback?.(data);
        },
        onError: (error: any) => {
            console.error('Error updating asset:', error);
            if (error.response) {
                console.error('Error response:', error.response.data);
                console.error('Error status:', error.response.status);
            }
            
            // Call custom error callback
            onErrorCallback?.(error);
        }
    });
};

/**
 * Hook for optimistic updates
 */
export const useUpdateAssetOptimistic = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ assetId, data }: { assetId: string; data : UpdateAssetRequest }) => 
            updateAssetWithFields(assetId, data),
        
        // Optimistic update
        onMutate: async ({ assetId, data }) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['asset-detail', assetId] });
            
            // Snapshot previous value
            const previousAsset = queryClient.getQueryData(['asset-detail', assetId]);
            
            // Optimistically update to new value
            if (previousAsset) {
                queryClient.setQueryData(['asset-detail', assetId], (old: any) => {
                    // Update the asset with new values
                    return {
                        ...old,
                        // Parse and apply updates
                        panels: old.panels.map((panel: any) => ({
                            ...panel,
                            fields: panel.fields.map((field: any) => {
                                const updates = JSON.parse(data.FieldsJSON);
                                const update = updates.find((u: any) => u.fieldName === field.fieldName);
                                return update ? { ...field, value: update.value } : field;
                            })
                        }))
                    };
                });
            }
            
            // Return context with snapshot
            return { previousAsset };
        },
        
        // If mutation fails, rollback
        onError: (err, variables, context) => {
            if (context?.previousAsset) {
                queryClient.setQueryData(
                    ['asset-detail', variables.assetId],
                    context.previousAsset
                );
            }
        },
        
        // Always refetch after error or success
        onSettled: (data, error, variables) => {
            queryClient.invalidateQueries({ queryKey: ['asset-detail', variables.assetId] });
        }
    });
};
