// ===========================================
// FIELD TYPES
// ===========================================

export interface AssetField {
    id: number;
    fieldName: string;
    displayName: string;
    value: string;
}

// ===========================================
// ASSET TYPES
// ===========================================

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

// ===========================================
// API RESPONSE TYPES
// ===========================================

export interface AssetsApiResponse {
    assets: Asset[];
    totalCount: number;
}

// ===========================================
// ALTERNATIVE: SINGLE ASSET RESPONSE
// ===========================================

export interface AssetDetailsResponse {
    asset: Asset;
}

export const assetTypes = [
    { label: "Hình ảnh", value: "image" },
    { label: "Video", value: "video" },
    { label: "Âm thanh", value: "audio" },
    // ... more types
];

export const assetStatuses = [
    { label: "Soạn thảo", value: "draft" },
    { label: "Đã duyệt", value: "approved" },
    { label: "Chờ duyệt", value: "pending" },
    // ... more statuses
];

export const assetCategories = [
    { label: "Khối tin tức", value: "news" },
    { label: "Giải trí", value: "entertainment" },
    // ... more categories
];

export const fileFormats = [
    { label: "PNG", value: "PNG" },
    { label: "JPG", value: "JPG" },
    { label: "MP4", value: "MP4" },
    // ... more formats
];
