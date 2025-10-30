import { apiUrls } from '@/api/config/endpoints'
import { env } from '@/config/env';
import { axios } from '@/shared/lib/axios'
import { useQuery, keepPreviousData } from '@tanstack/react-query'

// ===========================================
// TYPES
// ===========================================

export interface AssetsQueryParams {
    pageNumber?: number;
    pageSize?: number;
    folderId?: number;
    searchTerm?: string;
}

export interface AssetField {
    id: number;
    fieldName: string;
    displayName: string;
    value: string;
    color: string;
}

export interface Asset {
    id: number;
    name: string;
    filePath: string;
    extension: string;
    size: number;
    isApproved: boolean;
    createdAt: string;
    modifiedAt: string;
    workflowItemId: number;
    fields: AssetField[];
}

export interface TAssetsResponse {
    assets: Asset[];
    totalCount: number;
}

export interface ParsedAsset extends Asset {
    // Parsed field values for easier access
    fileName: string;
    thumbnail: string;
    status: string;
    author: string;
    assignedTo: string;
    assetId: string;
    type: string;
    category: string;
    projectName: string;
    description: string;
    duration: string;
    fileFormat: string;
    updatedAt: string;
}

export interface ParsedAssetsResponse {
    assets: ParsedAsset[];
    totalCount: number;
}

export interface AssetsQueryContext {
    queryKey: [string, AssetsQueryParams];
    signal?: AbortSignal;
}

// ===========================================
// UTILITY FUNCTIONS
// ===========================================

/**
 * Get field value by field name
 */
export const getFieldValue = (fields: AssetField[], fieldName: string): string => {
    const field = fields.find(f => f.fieldName === fieldName);
    return field?.value || '';
};

/**
 * Transform raw asset to parsed asset for easier use
 */
export const parseAsset = (asset: Asset): ParsedAsset => {
    const getFieldVal = (fieldName: string) => getFieldValue(asset.fields, fieldName);
    
    return {
        // Basic asset info
        ...asset,
        
        // Parsed field values
        fileName: getFieldVal('FileName'),
        thumbnail: env.apiUrl + getFieldVal('Thumbnail'),
        status: getFieldVal('Status'),
        author: getFieldVal('Author'),
        assignedTo: getFieldVal('AssignedTo'),
        assetId: getFieldVal('ID'),
        type: getFieldVal('Type'),
        category: getFieldVal('Category'),
        projectName: getFieldVal('ProjectName'),
        description: getFieldVal('Description'),
        duration: getFieldVal('Duration'),
        fileFormat: getFieldVal('FileFormat'),
        updatedAt: getFieldVal('UpdatedAt'),
    };
};

/**
 * Transform assets response to parsed format
 */
export const parseAssetsResponse = (response: TAssetsResponse): ParsedAssetsResponse => ({
    assets: response.assets.map(parseAsset),
    totalCount: response.totalCount
});

// ===========================================
// API FUNCTIONS
// ===========================================

export const getAssets = async ({ queryKey }: AssetsQueryContext): Promise<TAssetsResponse> => {
    const [, params] = queryKey;

    const response = await axios.get<TAssetsResponse>(apiUrls.asset.list, {
        params: {
            pageNumber: params.pageNumber ?? 1,
            pageSize: params.pageSize ?? 10,
            folderId: params.folderId ?? 0,
            searchTerm: params.searchTerm ?? ''
        }
    });

    return response.data;
};

// ===========================================
// CUSTOM HOOKS
// ===========================================

// Main hook with parsing
export const useAssets = (params: AssetsQueryParams = {}) =>
    useQuery({
        queryKey: ['assets', params],
        queryFn: getAssets,
    });

// Hook for paginated assets
export const useAssetsPaginated = ({
    pageNumber,
    pageSize,
    folderId,
    searchTerm
}: AssetsQueryParams = {}) =>
    useQuery({
        queryKey: ['assets', { pageNumber, pageSize, folderId, searchTerm }],
        queryFn: getAssets,
        placeholderData: keepPreviousData,
    });

// Hook for assets in specific folder
export const useAssetsByFolder = (folderId: number, searchTerm?: string) =>
    useQuery({
        queryKey: ['assets', { folderId, searchTerm, pageSize: 100 }],
        queryFn: getAssets,
        enabled: !!folderId,
    });

// Hook for searching assets
export const useAssetsSearch = (searchTerm: string, pageNumber: number, pageSize: number) =>
    useQuery({
        queryKey: ['assets', { searchTerm, pageNumber, pageSize }],
        queryFn: getAssets,
        enabled: searchTerm.length > 0,
    });

// Hook for raw assets data (without parsing)
export const useAssetsRaw = (params: AssetsQueryParams = {}) =>
    useQuery({
        queryKey: ['assets-raw', params],
        queryFn: getAssets,
    });
