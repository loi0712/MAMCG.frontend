/**
 * FILE SINH TỰ ĐỘNG – KHÔNG SỬA TAY.
 * Nguồn: openapi/mamcg-api.json (Swagger của MAMCG.Backend).
 * Cập nhật: yarn api:types
 */

export interface paths {
    "/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": string;
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Asset/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["PageDetailAssetDto"];
                        "text/json": components["schemas"]["PageDetailAssetDto"];
                        "text/plain": components["schemas"]["PageDetailAssetDto"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Asset/cg-info/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["AssetCgInfoResponseDto"];
                        "text/json": components["schemas"]["AssetCgInfoResponseDto"];
                        "text/plain": components["schemas"]["AssetCgInfoResponseDto"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Asset/delete/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": boolean;
                        "text/json": boolean;
                        "text/plain": boolean;
                    };
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Asset/paged": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: {
                    folderId?: number;
                    pageNumber?: number;
                    pageSize?: number;
                    searchTerm?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["PageListAssetDto"];
                        "text/json": components["schemas"]["PageListAssetDto"];
                        "text/plain": components["schemas"]["PageListAssetDto"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Asset/update/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "multipart/form-data": {
                        /** Format: int32 */
                        ActionId?: number;
                        Comment?: string;
                        Fields?: components["schemas"]["UpdateAssetFieldDto"][];
                        FieldsJSON?: string;
                        /** Format: binary */
                        File?: string;
                    };
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["AssetDto"];
                        "text/json": components["schemas"]["AssetDto"];
                        "text/plain": components["schemas"]["AssetDto"];
                    };
                };
            };
        };
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Asset/upload": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "multipart/form-data": {
                        Comment?: string;
                        Fields?: components["schemas"]["UpdateAssetFieldDto"][];
                        FieldsJSON: string;
                        /** Format: binary */
                        File?: string;
                        /** Format: int32 */
                        FolderId?: number;
                    };
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["AssetDto"];
                        "text/json": components["schemas"]["AssetDto"];
                        "text/plain": components["schemas"]["AssetDto"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Asset/upload-info": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ViewFilterFieldDto"];
                        "text/json": components["schemas"]["ViewFilterFieldDto"];
                        "text/plain": components["schemas"]["ViewFilterFieldDto"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Auth/login": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/*+json": components["schemas"]["AuthenticateAdUserDto"];
                    "application/json": components["schemas"]["AuthenticateAdUserDto"];
                    "text/json": components["schemas"]["AuthenticateAdUserDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["UserDto"];
                        "text/json": components["schemas"]["UserDto"];
                        "text/plain": components["schemas"]["UserDto"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Backup/config": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["BackupConfigDto"];
                        "text/json": components["schemas"]["BackupConfigDto"];
                        "text/plain": components["schemas"]["BackupConfigDto"];
                    };
                };
            };
        };
        put: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/*+json": components["schemas"]["BackupConfigDto"];
                    "application/json": components["schemas"]["BackupConfigDto"];
                    "text/json": components["schemas"]["BackupConfigDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["BackupConfigDto"];
                        "text/json": components["schemas"]["BackupConfigDto"];
                        "text/plain": components["schemas"]["BackupConfigDto"];
                    };
                };
            };
        };
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Backup/databases": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["BackupDatabaseDto"][];
                        "text/json": components["schemas"]["BackupDatabaseDto"][];
                        "text/plain": components["schemas"]["BackupDatabaseDto"][];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Backup/history": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: {
                    BatchId?: string;
                    ConnectionName?: string;
                    From?: string;
                    PageNumber?: number;
                    PageSize?: number;
                    Status?: string;
                    To?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["BackupHistoryDtoPagedResult"];
                        "text/json": components["schemas"]["BackupHistoryDtoPagedResult"];
                        "text/plain": components["schemas"]["BackupHistoryDtoPagedResult"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Backup/history/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["BackupHistoryDto"];
                        "text/json": components["schemas"]["BackupHistoryDto"];
                        "text/plain": components["schemas"]["BackupHistoryDto"];
                    };
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Backup/run": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/*+json": components["schemas"]["RunBackupDto"];
                    "application/json": components["schemas"]["RunBackupDto"];
                    "text/json": components["schemas"]["RunBackupDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["BackupRunResultDto"];
                        "text/json": components["schemas"]["BackupRunResultDto"];
                        "text/plain": components["schemas"]["BackupRunResultDto"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Backup/status": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["BackupStatusDto"];
                        "text/json": components["schemas"]["BackupStatusDto"];
                        "text/plain": components["schemas"]["BackupStatusDto"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Category/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["GetDetailCategoryResponseDto"];
                        "text/json": components["schemas"]["GetDetailCategoryResponseDto"];
                        "text/plain": components["schemas"]["GetDetailCategoryResponseDto"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Category/create": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/*+json": components["schemas"]["CreateCategoryDto"];
                    "application/json": components["schemas"]["CreateCategoryDto"];
                    "text/json": components["schemas"]["CreateCategoryDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ViewDetailCategoryDto"];
                        "text/json": components["schemas"]["ViewDetailCategoryDto"];
                        "text/plain": components["schemas"]["ViewDetailCategoryDto"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Category/delete/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": boolean;
                        "text/json": boolean;
                        "text/plain": boolean;
                    };
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Category/paged": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: {
                    groupId?: number;
                    pageNumber?: number;
                    pageSize?: number;
                    searchTerm?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["GetCategoriesPagedResponseDto"];
                        "text/json": components["schemas"]["GetCategoriesPagedResponseDto"];
                        "text/plain": components["schemas"]["GetCategoriesPagedResponseDto"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Category/update/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/*+json": components["schemas"]["UpdateCategoryDto"];
                    "application/json": components["schemas"]["UpdateCategoryDto"];
                    "text/json": components["schemas"]["UpdateCategoryDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ViewDetailCategoryDto"];
                        "text/json": components["schemas"]["ViewDetailCategoryDto"];
                        "text/plain": components["schemas"]["ViewDetailCategoryDto"];
                    };
                };
            };
        };
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/CategoryGroup/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ViewDetailCategoryGroupDto"];
                        "text/json": components["schemas"]["ViewDetailCategoryGroupDto"];
                        "text/plain": components["schemas"]["ViewDetailCategoryGroupDto"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/CategoryGroup/create": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/*+json": components["schemas"]["CreateCategoryGroupDto"];
                    "application/json": components["schemas"]["CreateCategoryGroupDto"];
                    "text/json": components["schemas"]["CreateCategoryGroupDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ViewDetailCategoryGroupDto"];
                        "text/json": components["schemas"]["ViewDetailCategoryGroupDto"];
                        "text/plain": components["schemas"]["ViewDetailCategoryGroupDto"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/CategoryGroup/delete/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": boolean;
                        "text/json": boolean;
                        "text/plain": boolean;
                    };
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/CategoryGroup/paged": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: {
                    pageNumber?: number;
                    pageSize?: number;
                    searchTerm?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["GetCategoryGroupsPagedResponseDto"];
                        "text/json": components["schemas"]["GetCategoryGroupsPagedResponseDto"];
                        "text/plain": components["schemas"]["GetCategoryGroupsPagedResponseDto"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/CategoryGroup/update/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/*+json": components["schemas"]["UpdateCategoryGroupDto"];
                    "application/json": components["schemas"]["UpdateCategoryGroupDto"];
                    "text/json": components["schemas"]["UpdateCategoryGroupDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ViewDetailCategoryGroupDto"];
                        "text/json": components["schemas"]["ViewDetailCategoryGroupDto"];
                        "text/plain": components["schemas"]["ViewDetailCategoryGroupDto"];
                    };
                };
            };
        };
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/CGCommand/PreviewCGScene": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/*+json": components["schemas"]["PreviewCGDto"];
                    "application/json": components["schemas"]["PreviewCGDto"];
                    "text/json": components["schemas"]["PreviewCGDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["PreviewCGResponseDto"];
                        "text/json": components["schemas"]["PreviewCGResponseDto"];
                        "text/plain": components["schemas"]["PreviewCGResponseDto"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/CGScene/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["CGSceneDto"];
                        "text/json": components["schemas"]["CGSceneDto"];
                        "text/plain": components["schemas"]["CGSceneDto"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/CGScene/approval/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/*+json": components["schemas"]["ApproveCGSceneDto"];
                    "application/json": components["schemas"]["ApproveCGSceneDto"];
                    "text/json": components["schemas"]["ApproveCGSceneDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["CGSceneDto"];
                        "text/json": components["schemas"]["CGSceneDto"];
                        "text/plain": components["schemas"]["CGSceneDto"];
                    };
                };
            };
        };
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/CGScene/create": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/*+json": components["schemas"]["CreateCGSceneDto"];
                    "application/json": components["schemas"]["CreateCGSceneDto"];
                    "text/json": components["schemas"]["CreateCGSceneDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["CGSceneDto"];
                        "text/json": components["schemas"]["CGSceneDto"];
                        "text/plain": components["schemas"]["CGSceneDto"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/CGScene/paged": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: {
                    folderId?: number;
                    pageNumber?: number;
                    pageSize?: number;
                    searchTerm?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["PagedCGSceneDto"];
                        "text/json": components["schemas"]["PagedCGSceneDto"];
                        "text/plain": components["schemas"]["PagedCGSceneDto"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/CGServer/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["CGServerAdminDto"];
                        "text/json": components["schemas"]["CGServerAdminDto"];
                        "text/plain": components["schemas"]["CGServerAdminDto"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/CGServer/check/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["CGServerCheckResultDto"];
                        "text/json": components["schemas"]["CGServerCheckResultDto"];
                        "text/plain": components["schemas"]["CGServerCheckResultDto"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/CGServer/create": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/*+json": components["schemas"]["SaveCGServerDto"];
                    "application/json": components["schemas"]["SaveCGServerDto"];
                    "text/json": components["schemas"]["SaveCGServerDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["CGServerAdminDto"];
                        "text/json": components["schemas"]["CGServerAdminDto"];
                        "text/plain": components["schemas"]["CGServerAdminDto"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/CGServer/delete/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": boolean;
                        "text/json": boolean;
                        "text/plain": boolean;
                    };
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/CGServer/heartbeat": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: {
                    "X-CG-Key"?: string;
                };
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/*+json": components["schemas"]["CGServerHeartbeatDto"];
                    "application/json": components["schemas"]["CGServerHeartbeatDto"];
                    "text/json": components["schemas"]["CGServerHeartbeatDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["CGServerHeartbeatResultDto"];
                        "text/json": components["schemas"]["CGServerHeartbeatResultDto"];
                        "text/plain": components["schemas"]["CGServerHeartbeatResultDto"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/CGServer/metrics/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: {
                    from?: string;
                    limit?: number;
                    to?: string;
                };
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["CGServerMetricPointDto"][];
                        "text/json": components["schemas"]["CGServerMetricPointDto"][];
                        "text/plain": components["schemas"]["CGServerMetricPointDto"][];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/CGServer/paged": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: {
                    pageNumber?: number;
                    pageSize?: number;
                    searchTerm?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["PagedCGServersDto"];
                        "text/json": components["schemas"]["PagedCGServersDto"];
                        "text/plain": components["schemas"]["PagedCGServersDto"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/CGServer/statuses": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["CGServerStatusDto"][];
                        "text/json": components["schemas"]["CGServerStatusDto"][];
                        "text/plain": components["schemas"]["CGServerStatusDto"][];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/CGServer/update/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/*+json": components["schemas"]["SaveCGServerDto"];
                    "application/json": components["schemas"]["SaveCGServerDto"];
                    "text/json": components["schemas"]["SaveCGServerDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["CGServerAdminDto"];
                        "text/json": components["schemas"]["CGServerAdminDto"];
                        "text/plain": components["schemas"]["CGServerAdminDto"];
                    };
                };
            };
        };
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/CGTemplate/all": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["CGTemplateDto"][];
                        "text/json": components["schemas"]["CGTemplateDto"][];
                        "text/plain": components["schemas"]["CGTemplateDto"][];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Database/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["DatabaseDto"];
                        "text/json": components["schemas"]["DatabaseDto"];
                        "text/plain": components["schemas"]["DatabaseDto"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Database/create": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/*+json": components["schemas"]["SaveDatabaseDto"];
                    "application/json": components["schemas"]["SaveDatabaseDto"];
                    "text/json": components["schemas"]["SaveDatabaseDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["DatabaseDto"];
                        "text/json": components["schemas"]["DatabaseDto"];
                        "text/plain": components["schemas"]["DatabaseDto"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Database/delete/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": boolean;
                        "text/json": boolean;
                        "text/plain": boolean;
                    };
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Database/paged": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: {
                    pageNumber?: number;
                    pageSize?: number;
                    searchTerm?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["DatabaseDtoPagedResult"];
                        "text/json": components["schemas"]["DatabaseDtoPagedResult"];
                        "text/plain": components["schemas"]["DatabaseDtoPagedResult"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Database/test/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ConnectionTestResult"];
                        "text/json": components["schemas"]["ConnectionTestResult"];
                        "text/plain": components["schemas"]["ConnectionTestResult"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Database/update/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/*+json": components["schemas"]["SaveDatabaseDto"];
                    "application/json": components["schemas"]["SaveDatabaseDto"];
                    "text/json": components["schemas"]["SaveDatabaseDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["DatabaseDto"];
                        "text/json": components["schemas"]["DatabaseDto"];
                        "text/plain": components["schemas"]["DatabaseDto"];
                    };
                };
            };
        };
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Department/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["DepartmentDto"];
                        "text/json": components["schemas"]["DepartmentDto"];
                        "text/plain": components["schemas"]["DepartmentDto"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Department/create": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/*+json": components["schemas"]["CreateDepartmentDto"];
                    "application/json": components["schemas"]["CreateDepartmentDto"];
                    "text/json": components["schemas"]["CreateDepartmentDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["DepartmentDto"];
                        "text/json": components["schemas"]["DepartmentDto"];
                        "text/plain": components["schemas"]["DepartmentDto"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Department/delete/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": boolean;
                        "text/json": boolean;
                        "text/plain": boolean;
                    };
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Department/paged": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: {
                    includeDeleted?: boolean;
                    pageNumber?: number;
                    pageSize?: number;
                    searchTerm?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["GetDepartmentsPagedResponseDto"];
                        "text/json": components["schemas"]["GetDepartmentsPagedResponseDto"];
                        "text/plain": components["schemas"]["GetDepartmentsPagedResponseDto"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Department/update/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/*+json": components["schemas"]["UpdateDepartmentDto"];
                    "application/json": components["schemas"]["UpdateDepartmentDto"];
                    "text/json": components["schemas"]["UpdateDepartmentDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["DepartmentDto"];
                        "text/json": components["schemas"]["DepartmentDto"];
                        "text/plain": components["schemas"]["DepartmentDto"];
                    };
                };
            };
        };
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/EmailLog": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete: {
            parameters: {
                query?: {
                    before?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/EmailLog/paged": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: {
                    EventCode?: string;
                    From?: string;
                    PageNumber?: number;
                    PageSize?: number;
                    SearchTerm?: string;
                    Status?: string;
                    To?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["EmailLogDtoPagedResult"];
                        "text/json": components["schemas"]["EmailLogDtoPagedResult"];
                        "text/plain": components["schemas"]["EmailLogDtoPagedResult"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/EmailTemplate/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["EmailTemplateDto"];
                        "text/json": components["schemas"]["EmailTemplateDto"];
                        "text/plain": components["schemas"]["EmailTemplateDto"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/EmailTemplate/create": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/*+json": components["schemas"]["EmailTemplateUpsertDto"];
                    "application/json": components["schemas"]["EmailTemplateUpsertDto"];
                    "text/json": components["schemas"]["EmailTemplateUpsertDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["EmailTemplateDto"];
                        "text/json": components["schemas"]["EmailTemplateDto"];
                        "text/plain": components["schemas"]["EmailTemplateDto"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/EmailTemplate/delete/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/EmailTemplate/events": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["EventVariablesDto"][];
                        "text/json": components["schemas"]["EventVariablesDto"][];
                        "text/plain": components["schemas"]["EventVariablesDto"][];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/EmailTemplate/paged": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: {
                    pageNumber?: number;
                    pageSize?: number;
                    searchTerm?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["EmailTemplateDtoPagedResult"];
                        "text/json": components["schemas"]["EmailTemplateDtoPagedResult"];
                        "text/plain": components["schemas"]["EmailTemplateDtoPagedResult"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/EmailTemplate/preview": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/*+json": components["schemas"]["EmailPreviewDto"];
                    "application/json": components["schemas"]["EmailPreviewDto"];
                    "text/json": components["schemas"]["EmailPreviewDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["EmailPreviewResult"];
                        "text/json": components["schemas"]["EmailPreviewResult"];
                        "text/plain": components["schemas"]["EmailPreviewResult"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/EmailTemplate/reset/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["EmailTemplateDto"];
                        "text/json": components["schemas"]["EmailTemplateDto"];
                        "text/plain": components["schemas"]["EmailTemplateDto"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/EmailTemplate/send-test/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/*+json": components["schemas"]["EmailTemplateTestDto"];
                    "application/json": components["schemas"]["EmailTemplateTestDto"];
                    "text/json": components["schemas"]["EmailTemplateTestDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ConnectionTestResult"];
                        "text/json": components["schemas"]["ConnectionTestResult"];
                        "text/plain": components["schemas"]["ConnectionTestResult"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/EmailTemplate/trigger-event/{code}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    code: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["NotifyOutcome"];
                        "text/json": components["schemas"]["NotifyOutcome"];
                        "text/plain": components["schemas"]["NotifyOutcome"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/EmailTemplate/update/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/*+json": components["schemas"]["EmailTemplateUpsertDto"];
                    "application/json": components["schemas"]["EmailTemplateUpsertDto"];
                    "text/json": components["schemas"]["EmailTemplateUpsertDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["EmailTemplateDto"];
                        "text/json": components["schemas"]["EmailTemplateDto"];
                        "text/plain": components["schemas"]["EmailTemplateDto"];
                    };
                };
            };
        };
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Field/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ViewDetailFieldDto"];
                        "text/json": components["schemas"]["ViewDetailFieldDto"];
                        "text/plain": components["schemas"]["ViewDetailFieldDto"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Field/create": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/*+json": components["schemas"]["CreateFieldDto"];
                    "application/json": components["schemas"]["CreateFieldDto"];
                    "text/json": components["schemas"]["CreateFieldDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ViewDetailFieldDto"];
                        "text/json": components["schemas"]["ViewDetailFieldDto"];
                        "text/plain": components["schemas"]["ViewDetailFieldDto"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Field/data-types": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["DataTypeDto"][];
                        "text/json": components["schemas"]["DataTypeDto"][];
                        "text/plain": components["schemas"]["DataTypeDto"][];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Field/delete/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": boolean;
                        "text/json": boolean;
                        "text/plain": boolean;
                    };
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Field/paged": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: {
                    includeSystemField?: boolean;
                    pageNumber?: number;
                    pageSize?: number;
                    searchTerm?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["GetFieldsPagedResponseDto"];
                        "text/json": components["schemas"]["GetFieldsPagedResponseDto"];
                        "text/plain": components["schemas"]["GetFieldsPagedResponseDto"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Field/update/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/*+json": components["schemas"]["UpdateFieldDto"];
                    "application/json": components["schemas"]["UpdateFieldDto"];
                    "text/json": components["schemas"]["UpdateFieldDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ViewDetailFieldDto"];
                        "text/json": components["schemas"]["ViewDetailFieldDto"];
                        "text/plain": components["schemas"]["ViewDetailFieldDto"];
                    };
                };
            };
        };
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/FieldGroup/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["FieldGroupDetailDto"];
                        "text/json": components["schemas"]["FieldGroupDetailDto"];
                        "text/plain": components["schemas"]["FieldGroupDetailDto"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/FieldGroup/create": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/*+json": components["schemas"]["FieldGroupUpsertDto"];
                    "application/json": components["schemas"]["FieldGroupUpsertDto"];
                    "text/json": components["schemas"]["FieldGroupUpsertDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["FieldGroupDetailDto"];
                        "text/json": components["schemas"]["FieldGroupDetailDto"];
                        "text/plain": components["schemas"]["FieldGroupDetailDto"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/FieldGroup/delete/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/FieldGroup/fields/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/*+json": components["schemas"]["FieldGroupFieldsDto"];
                    "application/json": components["schemas"]["FieldGroupFieldsDto"];
                    "text/json": components["schemas"]["FieldGroupFieldsDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["FieldGroupDetailDto"];
                        "text/json": components["schemas"]["FieldGroupDetailDto"];
                        "text/plain": components["schemas"]["FieldGroupDetailDto"];
                    };
                };
            };
        };
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/FieldGroup/paged": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: {
                    isActive?: boolean;
                    pageNumber?: number;
                    pageSize?: number;
                    searchTerm?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["FieldGroupPagedResult"];
                        "text/json": components["schemas"]["FieldGroupPagedResult"];
                        "text/plain": components["schemas"]["FieldGroupPagedResult"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/FieldGroup/update/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/*+json": components["schemas"]["FieldGroupUpsertDto"];
                    "application/json": components["schemas"]["FieldGroupUpsertDto"];
                    "text/json": components["schemas"]["FieldGroupUpsertDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["FieldGroupDetailDto"];
                        "text/json": components["schemas"]["FieldGroupDetailDto"];
                        "text/plain": components["schemas"]["FieldGroupDetailDto"];
                    };
                };
            };
        };
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Folder/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["GetFolderByIdResponseDto"];
                        "text/json": components["schemas"]["GetFolderByIdResponseDto"];
                        "text/plain": components["schemas"]["GetFolderByIdResponseDto"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Folder/create": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/*+json": components["schemas"]["CreateFolderDto"];
                    "application/json": components["schemas"]["CreateFolderDto"];
                    "text/json": components["schemas"]["CreateFolderDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["FolderDto"];
                        "text/json": components["schemas"]["FolderDto"];
                        "text/plain": components["schemas"]["FolderDto"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Folder/delete/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": boolean;
                        "text/json": boolean;
                        "text/plain": boolean;
                    };
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Folder/folder-tree": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: {
                    isGetAll?: boolean;
                    parentId?: number;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ViewTreeFolderDto"][];
                        "text/json": components["schemas"]["ViewTreeFolderDto"][];
                        "text/plain": components["schemas"]["ViewTreeFolderDto"][];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Folder/update/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/*+json": components["schemas"]["UpdateFolderDto"];
                    "application/json": components["schemas"]["UpdateFolderDto"];
                    "text/json": components["schemas"]["UpdateFolderDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["FolderDto"];
                        "text/json": components["schemas"]["FolderDto"];
                        "text/plain": components["schemas"]["FolderDto"];
                    };
                };
            };
        };
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Group/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ProductGroupDto"];
                        "text/json": components["schemas"]["ProductGroupDto"];
                        "text/plain": components["schemas"]["ProductGroupDto"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Group/create": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/*+json": components["schemas"]["CreateProductGroupDto"];
                    "application/json": components["schemas"]["CreateProductGroupDto"];
                    "text/json": components["schemas"]["CreateProductGroupDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ProductGroupDto"];
                        "text/json": components["schemas"]["ProductGroupDto"];
                        "text/plain": components["schemas"]["ProductGroupDto"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Group/delete/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": boolean;
                        "text/json": boolean;
                        "text/plain": boolean;
                    };
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Group/paged": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: {
                    includeDeleted?: boolean;
                    pageNumber?: number;
                    pageSize?: number;
                    searchTerm?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["GetGroupsPagedResponseDto"];
                        "text/json": components["schemas"]["GetGroupsPagedResponseDto"];
                        "text/plain": components["schemas"]["GetGroupsPagedResponseDto"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Group/update/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/*+json": components["schemas"]["UpdateProductGroupDto"];
                    "application/json": components["schemas"]["UpdateProductGroupDto"];
                    "text/json": components["schemas"]["UpdateProductGroupDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ProductGroupDto"];
                        "text/json": components["schemas"]["ProductGroupDto"];
                        "text/plain": components["schemas"]["ProductGroupDto"];
                    };
                };
            };
        };
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/LdapConfiguration/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["LdapConfigurationDto"];
                        "text/json": components["schemas"]["LdapConfigurationDto"];
                        "text/plain": components["schemas"]["LdapConfigurationDto"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/LdapConfiguration/create": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/*+json": components["schemas"]["SaveLdapConfigurationDto"];
                    "application/json": components["schemas"]["SaveLdapConfigurationDto"];
                    "text/json": components["schemas"]["SaveLdapConfigurationDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["LdapConfigurationDto"];
                        "text/json": components["schemas"]["LdapConfigurationDto"];
                        "text/plain": components["schemas"]["LdapConfigurationDto"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/LdapConfiguration/delete/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": boolean;
                        "text/json": boolean;
                        "text/plain": boolean;
                    };
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/LdapConfiguration/paged": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: {
                    pageNumber?: number;
                    pageSize?: number;
                    searchTerm?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["LdapConfigurationDtoPagedResult"];
                        "text/json": components["schemas"]["LdapConfigurationDtoPagedResult"];
                        "text/plain": components["schemas"]["LdapConfigurationDtoPagedResult"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/LdapConfiguration/sync/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: {
                    dryRun?: boolean;
                };
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["LdapSyncResultDto"];
                        "text/json": components["schemas"]["LdapSyncResultDto"];
                        "text/plain": components["schemas"]["LdapSyncResultDto"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/LdapConfiguration/test/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/*+json": components["schemas"]["TestLdapDto"];
                    "application/json": components["schemas"]["TestLdapDto"];
                    "text/json": components["schemas"]["TestLdapDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ConnectionTestResult"];
                        "text/json": components["schemas"]["ConnectionTestResult"];
                        "text/plain": components["schemas"]["ConnectionTestResult"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/LdapConfiguration/update/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/*+json": components["schemas"]["SaveLdapConfigurationDto"];
                    "application/json": components["schemas"]["SaveLdapConfigurationDto"];
                    "text/json": components["schemas"]["SaveLdapConfigurationDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["LdapConfigurationDto"];
                        "text/json": components["schemas"]["LdapConfigurationDto"];
                        "text/plain": components["schemas"]["LdapConfigurationDto"];
                    };
                };
            };
        };
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/LdapConfiguration/users/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: {
                    limit?: number;
                };
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["LdapUserRecord"][];
                        "text/json": components["schemas"]["LdapUserRecord"][];
                        "text/plain": components["schemas"]["LdapUserRecord"][];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Log/{kind}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete: {
            parameters: {
                query?: {
                    before?: string;
                };
                header?: never;
                path: {
                    kind: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["LogPurgeResultDto"];
                        "text/json": components["schemas"]["LogPurgeResultDto"];
                        "text/plain": components["schemas"]["LogPurgeResultDto"];
                    };
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Log/{kind}/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                    kind: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": boolean;
                        "text/json": boolean;
                        "text/plain": boolean;
                    };
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Log/action-types": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ActionTypeDto"][];
                        "text/json": components["schemas"]["ActionTypeDto"][];
                        "text/plain": components["schemas"]["ActionTypeDto"][];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Log/activities": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: {
                    ActionTypeId?: number;
                    From?: string;
                    Outcome?: string;
                    PageNumber?: number;
                    PageSize?: number;
                    SearchTerm?: string;
                    To?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ActivityLogDtoPagedLogResult"];
                        "text/json": components["schemas"]["ActivityLogDtoPagedLogResult"];
                        "text/plain": components["schemas"]["ActivityLogDtoPagedLogResult"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Log/cg-server": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: {
                    From?: string;
                    PageNumber?: number;
                    PageSize?: number;
                    ServerId?: number;
                    To?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["CGServerLogDtoPagedLogResult"];
                        "text/json": components["schemas"]["CGServerLogDtoPagedLogResult"];
                        "text/plain": components["schemas"]["CGServerLogDtoPagedLogResult"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Log/ldap-sync": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: {
                    pageNumber?: number;
                    pageSize?: number;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["LdapSyncLogDtoPagedLogResult"];
                        "text/json": components["schemas"]["LdapSyncLogDtoPagedLogResult"];
                        "text/plain": components["schemas"]["LdapSyncLogDtoPagedLogResult"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Log/system": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: {
                    From?: string;
                    LogLevel?: string;
                    PageNumber?: number;
                    PageSize?: number;
                    SearchTerm?: string;
                    To?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["SystemLogDtoPagedLogResult"];
                        "text/json": components["schemas"]["SystemLogDtoPagedLogResult"];
                        "text/plain": components["schemas"]["SystemLogDtoPagedLogResult"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Notification/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: {
                    IsRead?: boolean;
                    PageNumber?: number;
                    PageSize?: number;
                    SearchTerm?: string;
                    Severity?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["InboxPagedResult"];
                        "text/json": components["schemas"]["InboxPagedResult"];
                        "text/plain": components["schemas"]["InboxPagedResult"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Notification/me/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Notification/me/read": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Notification/me/read-all": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Notification/me/read/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Notification/me/unread-count": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Notification/send": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/*+json": components["schemas"]["SendNotificationDto"];
                    "application/json": components["schemas"]["SendNotificationDto"];
                    "text/json": components["schemas"]["SendNotificationDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["SendNotificationResult"];
                        "text/json": components["schemas"]["SendNotificationResult"];
                        "text/plain": components["schemas"]["SendNotificationResult"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/NotificationType": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/*+json": components["schemas"]["CreateNotificationTypeDto"];
                    "application/json": components["schemas"]["CreateNotificationTypeDto"];
                    "text/json": components["schemas"]["CreateNotificationTypeDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ViewDetailNotificationTypeDto"];
                        "text/json": components["schemas"]["ViewDetailNotificationTypeDto"];
                        "text/plain": components["schemas"]["ViewDetailNotificationTypeDto"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/NotificationType/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ViewDetailNotificationTypeDto"];
                        "text/json": components["schemas"]["ViewDetailNotificationTypeDto"];
                        "text/plain": components["schemas"]["ViewDetailNotificationTypeDto"];
                    };
                };
            };
        };
        put: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/*+json": components["schemas"]["UpdateNotificationTypeDto"];
                    "application/json": components["schemas"]["UpdateNotificationTypeDto"];
                    "text/json": components["schemas"]["UpdateNotificationTypeDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ViewDetailNotificationTypeDto"];
                        "text/json": components["schemas"]["ViewDetailNotificationTypeDto"];
                        "text/plain": components["schemas"]["ViewDetailNotificationTypeDto"];
                    };
                };
            };
        };
        post?: never;
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": boolean;
                        "text/json": boolean;
                        "text/plain": boolean;
                    };
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/NotificationType/paged": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: {
                    pageNumber?: number;
                    pageSize?: number;
                    searchTerm?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["GetNotificationTypesPagedResponseDto"];
                        "text/json": components["schemas"]["GetNotificationTypesPagedResponseDto"];
                        "text/plain": components["schemas"]["GetNotificationTypesPagedResponseDto"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Panel/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ViewDetailPanelDto"];
                        "text/json": components["schemas"]["ViewDetailPanelDto"];
                        "text/plain": components["schemas"]["ViewDetailPanelDto"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Panel/create": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/*+json": components["schemas"]["CreatePanelDto"];
                    "application/json": components["schemas"]["CreatePanelDto"];
                    "text/json": components["schemas"]["CreatePanelDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ViewDetailPanelDto"];
                        "text/json": components["schemas"]["ViewDetailPanelDto"];
                        "text/plain": components["schemas"]["ViewDetailPanelDto"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Panel/delete/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": boolean;
                        "text/json": boolean;
                        "text/plain": boolean;
                    };
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Panel/paged": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: {
                    includeDeleted?: boolean;
                    isDetail?: boolean;
                    pageNumber?: number;
                    pageSize?: number;
                    searchTerm?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["GetPanelsPagedResponseDto"];
                        "text/json": components["schemas"]["GetPanelsPagedResponseDto"];
                        "text/plain": components["schemas"]["GetPanelsPagedResponseDto"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Panel/update/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/*+json": components["schemas"]["UpdatePanelDto"];
                    "application/json": components["schemas"]["UpdatePanelDto"];
                    "text/json": components["schemas"]["UpdatePanelDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ViewDetailPanelDto"];
                        "text/json": components["schemas"]["ViewDetailPanelDto"];
                        "text/plain": components["schemas"]["ViewDetailPanelDto"];
                    };
                };
            };
        };
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Permission/check-permission": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: {
                    objectId?: number;
                    objectTypeId?: number;
                    permissionId?: number;
                    userId?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": boolean;
                        "text/json": boolean;
                        "text/plain": boolean;
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Permission/create": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/*+json": components["schemas"]["CreateACEDto"];
                    "application/json": components["schemas"]["CreateACEDto"];
                    "text/json": components["schemas"]["CreateACEDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": boolean;
                        "text/json": boolean;
                        "text/plain": boolean;
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Permission/folder/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["GetFolderPermissionsResponseDto"];
                        "text/json": components["schemas"]["GetFolderPermissionsResponseDto"];
                        "text/plain": components["schemas"]["GetFolderPermissionsResponseDto"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Permission/folder/create": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/*+json": components["schemas"]["CreateFolderPermissionDto"];
                    "application/json": components["schemas"]["CreateFolderPermissionDto"];
                    "text/json": components["schemas"]["CreateFolderPermissionDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": boolean;
                        "text/json": boolean;
                        "text/plain": boolean;
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Permission/get-by-target": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: {
                    targetId?: string;
                    targetType?: components["schemas"]["TargetEnum"];
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["GetPermissionResponseDto"];
                        "text/json": components["schemas"]["GetPermissionResponseDto"];
                        "text/plain": components["schemas"]["GetPermissionResponseDto"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Permission/get-list": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: {
                    parentId?: number;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["PermissionDto"];
                        "text/json": components["schemas"]["PermissionDto"];
                        "text/plain": components["schemas"]["PermissionDto"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Permission/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Position/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["PositionDto"];
                        "text/json": components["schemas"]["PositionDto"];
                        "text/plain": components["schemas"]["PositionDto"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Position/create": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/*+json": components["schemas"]["CreatePositionDto"];
                    "application/json": components["schemas"]["CreatePositionDto"];
                    "text/json": components["schemas"]["CreatePositionDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["PositionDto"];
                        "text/json": components["schemas"]["PositionDto"];
                        "text/plain": components["schemas"]["PositionDto"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Position/delete/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": boolean;
                        "text/json": boolean;
                        "text/plain": boolean;
                    };
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Position/paged": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: {
                    pageNumber?: number;
                    pageSize?: number;
                    searchTerm?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["GetPositionsPagedResponseDto"];
                        "text/json": components["schemas"]["GetPositionsPagedResponseDto"];
                        "text/plain": components["schemas"]["GetPositionsPagedResponseDto"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Position/update/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/*+json": components["schemas"]["UpdatePositionDto"];
                    "application/json": components["schemas"]["UpdatePositionDto"];
                    "text/json": components["schemas"]["UpdatePositionDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["PositionDto"];
                        "text/json": components["schemas"]["PositionDto"];
                        "text/plain": components["schemas"]["PositionDto"];
                    };
                };
            };
        };
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Server/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ServerDto"];
                        "text/json": components["schemas"]["ServerDto"];
                        "text/plain": components["schemas"]["ServerDto"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Server/create": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/*+json": components["schemas"]["SaveServerDto"];
                    "application/json": components["schemas"]["SaveServerDto"];
                    "text/json": components["schemas"]["SaveServerDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ServerDto"];
                        "text/json": components["schemas"]["ServerDto"];
                        "text/plain": components["schemas"]["ServerDto"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Server/delete/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": boolean;
                        "text/json": boolean;
                        "text/plain": boolean;
                    };
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Server/paged": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: {
                    pageNumber?: number;
                    pageSize?: number;
                    searchTerm?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ServerDtoPagedResult"];
                        "text/json": components["schemas"]["ServerDtoPagedResult"];
                        "text/plain": components["schemas"]["ServerDtoPagedResult"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Server/update/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/*+json": components["schemas"]["SaveServerDto"];
                    "application/json": components["schemas"]["SaveServerDto"];
                    "text/json": components["schemas"]["SaveServerDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ServerDto"];
                        "text/json": components["schemas"]["ServerDto"];
                        "text/plain": components["schemas"]["ServerDto"];
                    };
                };
            };
        };
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Setting": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: {
                    prefix?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["SettingDto"][];
                        "text/json": components["schemas"]["SettingDto"][];
                        "text/plain": components["schemas"]["SettingDto"][];
                    };
                };
            };
        };
        put: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/*+json": components["schemas"]["UpsertSettingItemDto"][];
                    "application/json": components["schemas"]["UpsertSettingItemDto"][];
                    "text/json": components["schemas"]["UpsertSettingItemDto"][];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["SettingDto"][];
                        "text/json": components["schemas"]["SettingDto"][];
                        "text/plain": components["schemas"]["SettingDto"][];
                    };
                };
            };
        };
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Setting/test-email": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/*+json": components["schemas"]["SendTestEmailDto"];
                    "application/json": components["schemas"]["SendTestEmailDto"];
                    "text/json": components["schemas"]["SendTestEmailDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ConnectionTestResult"];
                        "text/json": components["schemas"]["ConnectionTestResult"];
                        "text/plain": components["schemas"]["ConnectionTestResult"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/StoragePoint/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["StoragePointDto"];
                        "text/json": components["schemas"]["StoragePointDto"];
                        "text/plain": components["schemas"]["StoragePointDto"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/StoragePoint/create": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/*+json": components["schemas"]["SaveStoragePointDto"];
                    "application/json": components["schemas"]["SaveStoragePointDto"];
                    "text/json": components["schemas"]["SaveStoragePointDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["StoragePointDto"];
                        "text/json": components["schemas"]["StoragePointDto"];
                        "text/plain": components["schemas"]["StoragePointDto"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/StoragePoint/delete/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": boolean;
                        "text/json": boolean;
                        "text/plain": boolean;
                    };
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/StoragePoint/paged": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: {
                    pageNumber?: number;
                    pageSize?: number;
                    searchTerm?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["StoragePointDtoPagedResult"];
                        "text/json": components["schemas"]["StoragePointDtoPagedResult"];
                        "text/plain": components["schemas"]["StoragePointDtoPagedResult"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/StoragePoint/update/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/*+json": components["schemas"]["SaveStoragePointDto"];
                    "application/json": components["schemas"]["SaveStoragePointDto"];
                    "text/json": components["schemas"]["SaveStoragePointDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["StoragePointDto"];
                        "text/json": components["schemas"]["StoragePointDto"];
                        "text/plain": components["schemas"]["StoragePointDto"];
                    };
                };
            };
        };
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/StoragePoint/usage/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["StorageUsageDto"];
                        "text/json": components["schemas"]["StorageUsageDto"];
                        "text/plain": components["schemas"]["StorageUsageDto"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/SystemStatus/dashboard": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["DashboardDto"];
                        "text/json": components["schemas"]["DashboardDto"];
                        "text/plain": components["schemas"]["DashboardDto"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/SystemStatus/server": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ServerInfoDto"];
                        "text/json": components["schemas"]["ServerInfoDto"];
                        "text/plain": components["schemas"]["ServerInfoDto"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/SystemStatus/services": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ServiceHealthDto"][];
                        "text/json": components["schemas"]["ServiceHealthDto"][];
                        "text/plain": components["schemas"]["ServiceHealthDto"][];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/User/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["UserDto"];
                        "text/json": components["schemas"]["UserDto"];
                        "text/plain": components["schemas"]["UserDto"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/User/create": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/*+json": components["schemas"]["CreateUserDto"];
                    "application/json": components["schemas"]["CreateUserDto"];
                    "text/json": components["schemas"]["CreateUserDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["UserDto"];
                        "text/json": components["schemas"]["UserDto"];
                        "text/plain": components["schemas"]["UserDto"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/User/delete/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": boolean;
                        "text/json": boolean;
                        "text/plain": boolean;
                    };
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/User/paged": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: {
                    pageNumber?: number;
                    pageSize?: number;
                    searchTerm?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["GetUsersPagedResponseDto"];
                        "text/json": components["schemas"]["GetUsersPagedResponseDto"];
                        "text/plain": components["schemas"]["GetUsersPagedResponseDto"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/User/update/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/*+json": components["schemas"]["UpdateUserDto"];
                    "application/json": components["schemas"]["UpdateUserDto"];
                    "text/json": components["schemas"]["UpdateUserDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["UserDto"];
                        "text/json": components["schemas"]["UserDto"];
                        "text/plain": components["schemas"]["UserDto"];
                    };
                };
            };
        };
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Workflow/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["WorkflowDto"];
                        "text/json": components["schemas"]["WorkflowDto"];
                        "text/plain": components["schemas"]["WorkflowDto"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/Workflow/item/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["WorkflowItemDto"];
                        "text/json": components["schemas"]["WorkflowItemDto"];
                        "text/plain": components["schemas"]["WorkflowItemDto"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/WorkflowDefinition/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["WorkflowDetailDto"];
                        "text/json": components["schemas"]["WorkflowDetailDto"];
                        "text/plain": components["schemas"]["WorkflowDetailDto"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/WorkflowDefinition/{workflowId}/statuses": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    workflowId: number;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/*+json": components["schemas"]["WorkflowStatusUpsertDto"];
                    "application/json": components["schemas"]["WorkflowStatusUpsertDto"];
                    "text/json": components["schemas"]["WorkflowStatusUpsertDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["WorkflowStatusAdminDto"];
                        "text/json": components["schemas"]["WorkflowStatusAdminDto"];
                        "text/plain": components["schemas"]["WorkflowStatusAdminDto"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/WorkflowDefinition/{workflowId}/transitions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    workflowId: number;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/*+json": components["schemas"]["WorkflowTransitionUpsertDto"];
                    "application/json": components["schemas"]["WorkflowTransitionUpsertDto"];
                    "text/json": components["schemas"]["WorkflowTransitionUpsertDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["WorkflowTransitionAdminDto"];
                        "text/json": components["schemas"]["WorkflowTransitionAdminDto"];
                        "text/plain": components["schemas"]["WorkflowTransitionAdminDto"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/WorkflowDefinition/actions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["WorkflowActionAdminDto"][];
                        "text/json": components["schemas"]["WorkflowActionAdminDto"][];
                        "text/plain": components["schemas"]["WorkflowActionAdminDto"][];
                    };
                };
            };
        };
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/*+json": components["schemas"]["WorkflowActionUpsertDto"];
                    "application/json": components["schemas"]["WorkflowActionUpsertDto"];
                    "text/json": components["schemas"]["WorkflowActionUpsertDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["WorkflowActionAdminDto"];
                        "text/json": components["schemas"]["WorkflowActionAdminDto"];
                        "text/plain": components["schemas"]["WorkflowActionAdminDto"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/WorkflowDefinition/actions/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/*+json": components["schemas"]["WorkflowActionUpsertDto"];
                    "application/json": components["schemas"]["WorkflowActionUpsertDto"];
                    "text/json": components["schemas"]["WorkflowActionUpsertDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["WorkflowActionAdminDto"];
                        "text/json": components["schemas"]["WorkflowActionAdminDto"];
                        "text/plain": components["schemas"]["WorkflowActionAdminDto"];
                    };
                };
            };
        };
        post?: never;
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/WorkflowDefinition/clone/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: {
                    name?: string;
                };
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["WorkflowDetailDto"];
                        "text/json": components["schemas"]["WorkflowDetailDto"];
                        "text/plain": components["schemas"]["WorkflowDetailDto"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/WorkflowDefinition/create": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/*+json": components["schemas"]["WorkflowUpsertDto"];
                    "application/json": components["schemas"]["WorkflowUpsertDto"];
                    "text/json": components["schemas"]["WorkflowUpsertDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["WorkflowDetailDto"];
                        "text/json": components["schemas"]["WorkflowDetailDto"];
                        "text/plain": components["schemas"]["WorkflowDetailDto"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/WorkflowDefinition/delete/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/WorkflowDefinition/layout/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/*+json": components["schemas"]["WorkflowLayoutDto"];
                    "application/json": components["schemas"]["WorkflowLayoutDto"];
                    "text/json": components["schemas"]["WorkflowLayoutDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/WorkflowDefinition/paged": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: {
                    isActive?: boolean;
                    pageNumber?: number;
                    pageSize?: number;
                    searchTerm?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["WorkflowPagedResult"];
                        "text/json": components["schemas"]["WorkflowPagedResult"];
                        "text/plain": components["schemas"]["WorkflowPagedResult"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/WorkflowDefinition/statuses/{statusId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    statusId: number;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/*+json": components["schemas"]["WorkflowStatusUpsertDto"];
                    "application/json": components["schemas"]["WorkflowStatusUpsertDto"];
                    "text/json": components["schemas"]["WorkflowStatusUpsertDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["WorkflowStatusAdminDto"];
                        "text/json": components["schemas"]["WorkflowStatusAdminDto"];
                        "text/plain": components["schemas"]["WorkflowStatusAdminDto"];
                    };
                };
            };
        };
        post?: never;
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    statusId: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/WorkflowDefinition/transitions/{transitionId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    transitionId: number;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/*+json": components["schemas"]["WorkflowTransitionUpsertDto"];
                    "application/json": components["schemas"]["WorkflowTransitionUpsertDto"];
                    "text/json": components["schemas"]["WorkflowTransitionUpsertDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["WorkflowTransitionAdminDto"];
                        "text/json": components["schemas"]["WorkflowTransitionAdminDto"];
                        "text/plain": components["schemas"]["WorkflowTransitionAdminDto"];
                    };
                };
            };
        };
        post?: never;
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    transitionId: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/WorkflowDefinition/update/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/*+json": components["schemas"]["WorkflowUpsertDto"];
                    "application/json": components["schemas"]["WorkflowUpsertDto"];
                    "text/json": components["schemas"]["WorkflowUpsertDto"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["WorkflowDetailDto"];
                        "text/json": components["schemas"]["WorkflowDetailDto"];
                        "text/plain": components["schemas"]["WorkflowDetailDto"];
                    };
                };
            };
        };
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/health": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        ActionTypeDto: {
            description?: string | null;
            /** Format: int32 */
            id?: number;
            name?: string | null;
        };
        ActivityLogDto: {
            actionDetail?: string | null;
            /** Format: int32 */
            actionTypeId?: number;
            actionTypeName?: string | null;
            /** Format: date-time */
            createdAt?: string;
            deviceInfo?: string | null;
            /** Format: int32 */
            durationMs?: number | null;
            /** Format: int32 */
            id?: number;
            ipAddress?: string | null;
            outcome?: string | null;
            userId?: string | null;
            userName?: string | null;
        };
        ActivityLogDtoPagedLogResult: {
            items?: components["schemas"]["ActivityLogDto"][] | null;
            /** Format: int32 */
            totalCount?: number;
        };
        ApproveCGSceneDto: {
            /** Format: int32 */
            actionId: number;
            comment?: string | null;
        };
        AssetCgInfoResponseDto: {
            asset?: components["schemas"]["ViewListAssetDto"];
            scenes?: components["schemas"]["SceneInfo"][] | null;
        };
        AssetDto: {
            /** Format: date-time */
            createdAt?: string;
            extension?: string | null;
            filePath?: string | null;
            /** Format: int32 */
            id?: number;
            isApproved?: boolean;
            /** Format: date-time */
            modifiedAt?: string;
            name?: string | null;
            /** Format: int64 */
            size?: number;
            workflowItem?: components["schemas"]["WorkflowItemResponseDto"];
        };
        AuthenticateAdUserDto: {
            password: string;
            username: string;
        };
        BackupConfigDto: {
            compression?: boolean;
            copyOnly?: boolean;
            databases?: string[] | null;
            days?: string[] | null;
            enabled?: boolean;
            path?: string | null;
            /** Format: int32 */
            retentionDays?: number;
            time?: string | null;
            verify?: boolean;
        };
        BackupDatabaseDto: {
            connectionName?: string | null;
            databaseName?: string | null;
            selected?: boolean;
            server?: string | null;
        };
        BackupHistoryDto: {
            /** Format: uuid */
            batchId?: string;
            compressed?: boolean;
            connectionName?: string | null;
            databaseName?: string | null;
            /** Format: int64 */
            durationMs?: number | null;
            filePath?: string | null;
            /** Format: date-time */
            finishedAt?: string | null;
            /** Format: int64 */
            id?: number;
            message?: string | null;
            /** Format: int64 */
            sizeBytes?: number | null;
            /** Format: date-time */
            startedAt?: string;
            status?: string | null;
            trigger?: string | null;
            triggeredBy?: string | null;
        };
        BackupHistoryDtoPagedResult: {
            items?: components["schemas"]["BackupHistoryDto"][] | null;
            /** Format: int32 */
            totalCount?: number;
        };
        BackupRunResultDto: {
            /** Format: uuid */
            batchId?: string;
            databases?: string[] | null;
        };
        BackupStatusDto: {
            /** Format: uuid */
            currentBatchId?: string | null;
            /** Format: date-time */
            lastFailureAt?: string | null;
            /** Format: date-time */
            lastSuccessAt?: string | null;
            /** Format: date-time */
            nextRunAt?: string | null;
            running?: boolean;
            scheduleEnabled?: boolean;
        };
        BaseObject: {
            id?: string | null;
            name?: string | null;
        };
        CGChannelDto: {
            format?: string | null;
            /** Format: double */
            fps?: number | null;
            /** Format: int32 */
            id?: number;
            layer?: unknown;
            name?: string | null;
            state?: string | null;
        };
        CGJsonContentDto: {
            Background?: string | null;
            FolderPath?: string | null;
            PreviewPath?: string | null;
            SceneName?: string | null;
            ScenePath?: string | null;
            Variables?: {
                [key: string]: components["schemas"]["CGJsonVariable"];
            } | null;
        };
        CGJsonVariable: {
            /** Format: int32 */
            assetId?: number | null;
            Color?: string | null;
            DisplayName?: string | null;
            /** Format: int32 */
            H?: number | null;
            IsRequiredAsset?: boolean;
            Value?: string | null;
            /** Format: int32 */
            W?: number | null;
            /** Format: int32 */
            X?: number | null;
            /** Format: int32 */
            Y?: number | null;
        };
        CGSceneDto: {
            backgrounds?: {
                [key: string]: string;
            }[] | null;
            code?: string | null;
            fields?: components["schemas"]["CGSceneFieldDto"][] | null;
            /** Format: int32 */
            id?: number;
            message?: string | null;
            scenes?: components["schemas"]["CGSceneTemplateDto"][] | null;
            success?: boolean;
            workflowItem?: components["schemas"]["WorkflowItemResponseDto"];
        };
        CGSceneFieldDto: {
            dataType?: components["schemas"]["DataTypeDto"];
            displayName?: string | null;
            fieldName?: string | null;
            value?: string | null;
        };
        CGSceneTemplateDto: {
            background?: string | null;
            folderPath?: string | null;
            previewPath?: string | null;
            sceneName?: string | null;
            scenePath?: string | null;
            variables?: {
                [key: string]: components["schemas"]["CreateCGSceneVariableDto"];
            } | null;
        };
        CGServerAdminDto: {
            /** Format: int32 */
            activeChannels?: number | null;
            /** Format: int32 */
            channelCount?: number | null;
            channels?: components["schemas"]["CGChannelDto"][] | null;
            /** Format: double */
            cpuPercent?: number | null;
            /** Format: date-time */
            createdAt?: string;
            /** Format: int32 */
            id?: number;
            ipAddress?: string | null;
            isBackupServer?: boolean;
            /** Format: date-time */
            lastChecked?: string | null;
            /** Format: int32 */
            latencyMs?: number | null;
            location?: string | null;
            /** Format: double */
            memoryMb?: number | null;
            /** Format: date-time */
            metricsUpdatedAt?: string | null;
            /** Format: date-time */
            modifiedAt?: string;
            /** Format: int32 */
            port?: number | null;
            serverName?: string | null;
            /** Format: int32 */
            statusId?: number;
            statusName?: string | null;
            /** Format: double */
            uptimeSeconds?: number | null;
            version?: string | null;
        };
        CGServerCheckResultDto: {
            /** Format: int64 */
            elapsedMs?: number;
            /** Format: int32 */
            latencyMs?: number | null;
            message?: string | null;
            metricsAvailable?: boolean;
            /** Format: int32 */
            previousStatusId?: number | null;
            reachable?: boolean;
            server?: components["schemas"]["CGServerAdminDto"];
        };
        CGServerHeartbeatDto: {
            channels?: components["schemas"]["CGChannelDto"][] | null;
            /** Format: double */
            cpuPercent?: number | null;
            ipAddress?: string | null;
            /** Format: double */
            memoryMb?: number | null;
            /** Format: int32 */
            serverId?: number | null;
            /** Format: double */
            uptimeSeconds?: number | null;
            version?: string | null;
        };
        CGServerHeartbeatResultDto: {
            /** Format: date-time */
            lastChecked?: string | null;
            /** Format: int32 */
            serverId?: number;
            /** Format: int32 */
            statusId?: number;
        };
        CGServerLogDto: {
            /** Format: date-time */
            createdAt?: string;
            /** Format: int32 */
            id?: number;
            message?: string | null;
            /** Format: int32 */
            serverId?: number;
        };
        CGServerLogDtoPagedLogResult: {
            items?: components["schemas"]["CGServerLogDto"][] | null;
            /** Format: int32 */
            totalCount?: number;
        };
        CGServerMetricPointDto: {
            /** Format: int32 */
            activeChannels?: number | null;
            /** Format: double */
            avgFps?: number | null;
            /** Format: double */
            cpuPercent?: number | null;
            /** Format: int32 */
            latencyMs?: number | null;
            /** Format: double */
            memoryMb?: number | null;
            /** Format: date-time */
            recordedAt?: string;
            source?: string | null;
        };
        CGServerStatsDto: {
            /** Format: int32 */
            maintenance?: number;
            /** Format: int32 */
            offline?: number;
            /** Format: int32 */
            online?: number;
            /** Format: int32 */
            total?: number;
        };
        CGServerStatusDto: {
            /** Format: int32 */
            id?: number;
            name?: string | null;
        };
        CGTemplateDto: {
            /** Format: int32 */
            id?: number;
            jsonContent?: components["schemas"]["CGJsonContentDto"];
            name?: string | null;
        };
        ConnectionTestResult: {
            /** Format: int64 */
            elapsedMs?: number;
            message?: string | null;
            success?: boolean;
        };
        CreateACEDto: {
            permissionIds: string;
            targetId: string;
            targetType: components["schemas"]["TargetEnum"];
        };
        CreateCategoryDto: {
            code: string;
            description?: string | null;
            /** Format: int32 */
            groupId: number;
            name: string;
        };
        CreateCategoryGroupDto: {
            description?: string | null;
            name: string;
        };
        CreateCGSceneDto: {
            /** Format: int32 */
            cgTemplateId: number;
            jsonContent: components["schemas"]["CreateCGSceneTemplateDto"];
        };
        CreateCGSceneTemplateDto: {
            background?: string | null;
            folderPath?: string | null;
            previewPath?: string | null;
            sceneName?: string | null;
            scenePath?: string | null;
            variables?: {
                [key: string]: components["schemas"]["CreateCGSceneVariableDto"];
            } | null;
        };
        CreateCGSceneVariableDto: {
            /** Format: int32 */
            assetId?: number | null;
            color?: string | null;
            displayName?: string | null;
            /** Format: int32 */
            h?: number | null;
            isRequiredAsset?: boolean;
            value?: string | null;
            /** Format: int32 */
            w?: number | null;
            /** Format: int32 */
            x?: number | null;
            /** Format: int32 */
            y?: number | null;
        };
        CreateDepartmentDto: {
            description?: string | null;
            name: string;
        };
        CreateFieldDto: {
            /** Format: int32 */
            dataTypeId: number;
            defaultValue?: string | null;
            displayName: string;
            editable?: boolean;
            fieldName: string;
            isRequired?: boolean;
        };
        CreateFolderDto: {
            categoryCode?: string | null;
            /** Format: int32 */
            categoryGroupId?: number | null;
            description?: string | null;
            filters?: components["schemas"]["CreateFolderFilterDto"][] | null;
            /** Format: int32 */
            index?: number;
            name: string;
            /** Format: int32 */
            parentId?: number | null;
        };
        CreateFolderFilterDto: {
            /** Format: int32 */
            fieldId: number;
            logicalGroup: components["schemas"]["LogicalGroupEnum"];
            operator: components["schemas"]["OperatorEnum"];
            /** Format: int32 */
            sortOrder: number;
            value: string;
        };
        CreateFolderPermissionDto: {
            /** Format: int32 */
            folderId: number;
            permissions?: components["schemas"]["CreateACEDto"][] | null;
        };
        CreateNotificationTypeDto: {
            description?: string | null;
            emailSubject?: string | null;
            emailTemplate?: string | null;
            inAppTemplate?: string | null;
            name: string;
            smsTemplate?: string | null;
        };
        CreatePanelDto: {
            description?: string | null;
            fieldIds?: string | null;
            /** Format: int32 */
            index?: number | null;
            panelName: string;
            visibilityRules?: string | null;
        };
        CreatePositionDto: {
            description?: string | null;
            name: string;
        };
        CreateProductGroupDto: {
            description?: string | null;
            name: string;
            userIds?: string | null;
        };
        CreateUserDto: {
            address?: string | null;
            /** Format: date-time */
            dateOfBirth?: string | null;
            /** Format: int32 */
            departmentId?: number | null;
            distinguishedName?: string | null;
            /** Format: email */
            email: string;
            fullName: string;
            gender?: boolean | null;
            imageUrl?: string | null;
            isActive?: boolean;
            password: string;
            phoneNumber?: string | null;
            /** Format: int32 */
            positionId?: number | null;
            sid?: string | null;
            username: string;
        };
        DashboardDto: {
            cgServers?: components["schemas"]["CGServerStatsDto"];
            /** Format: date-time */
            generatedAt?: string;
            media?: components["schemas"]["MediaStatsDto"];
            recentActivities?: components["schemas"]["RecentActivityDto"][] | null;
            server?: components["schemas"]["ServerInfoDto"];
            services?: components["schemas"]["ServiceHealthDto"][] | null;
            storage?: components["schemas"]["StorageStatDto"][] | null;
            users?: components["schemas"]["UserStatsDto"];
        };
        DatabaseDto: {
            connectionString?: string | null;
            /** Format: date-time */
            createdAt?: string;
            description?: string | null;
            /** Format: int32 */
            id?: number;
            isActive?: boolean;
            /** Format: date-time */
            modifiedAt?: string;
            name?: string | null;
            type?: string | null;
        };
        DatabaseDtoPagedResult: {
            items?: components["schemas"]["DatabaseDto"][] | null;
            /** Format: int32 */
            totalCount?: number;
        };
        DataTypeDto: {
            datasource?: string | null;
            /** Format: int32 */
            id?: number;
            name?: string | null;
        };
        DepartmentDto: {
            description?: string | null;
            /** Format: int32 */
            id?: number;
            name?: string | null;
        };
        EmailLogDto: {
            ccAddresses?: string | null;
            /** Format: date-time */
            createdAt?: string;
            error?: string | null;
            eventCode?: string | null;
            /** Format: int64 */
            id?: number;
            status?: string | null;
            subject?: string | null;
            templateCode?: string | null;
            toAddresses?: string | null;
        };
        EmailLogDtoPagedResult: {
            items?: components["schemas"]["EmailLogDto"][] | null;
            /** Format: int32 */
            totalCount?: number;
        };
        EmailPreviewDto: {
            body?: string | null;
            code?: string | null;
            isHtml?: boolean;
            subject?: string | null;
            variables?: {
                [key: string]: string;
            } | null;
        };
        EmailPreviewResult: {
            body?: string | null;
            isHtml?: boolean;
            missingVariables?: string[] | null;
            subject?: string | null;
        };
        EmailTemplateDto: {
            body?: string | null;
            code?: string | null;
            /** Format: date-time */
            createdAt?: string;
            description?: string | null;
            eventName?: string | null;
            /** Format: int32 */
            id?: number;
            isActive?: boolean;
            isHtml?: boolean;
            isSystem?: boolean;
            /** Format: date-time */
            modifiedAt?: string;
            name?: string | null;
            subject?: string | null;
            variables?: string[] | null;
        };
        EmailTemplateDtoPagedResult: {
            items?: components["schemas"]["EmailTemplateDto"][] | null;
            /** Format: int32 */
            totalCount?: number;
        };
        EmailTemplateTestDto: {
            to?: string | null;
            variables?: {
                [key: string]: string;
            } | null;
        };
        EmailTemplateUpsertDto: {
            body?: string | null;
            code?: string | null;
            description?: string | null;
            isActive?: boolean;
            isHtml?: boolean;
            name?: string | null;
            subject?: string | null;
        };
        EventVariablesDto: {
            category?: string | null;
            code?: string | null;
            defaultSeverity?: string | null;
            name?: string | null;
            recipientGroup?: string | null;
            variables?: {
                [key: string]: string;
            } | null;
        };
        FieldGroupDetailDto: {
            /** Format: date-time */
            createdAt?: string;
            description?: string | null;
            /** Format: int32 */
            displayOrder?: number;
            fields?: components["schemas"]["FieldGroupFieldDto"][] | null;
            /** Format: int32 */
            id?: number;
            isActive?: boolean;
            /** Format: date-time */
            modifiedAt?: string;
            name?: string | null;
        };
        FieldGroupFieldDto: {
            /** Format: int32 */
            dataTypeId?: number;
            dataTypeName?: string | null;
            displayName?: string | null;
            /** Format: int32 */
            displayOrder?: number;
            fieldName?: string | null;
            /** Format: int32 */
            id?: number;
            isRequired?: boolean;
            isSystemField?: boolean;
        };
        FieldGroupFieldsDto: {
            fieldIds?: number[] | null;
        };
        FieldGroupListItemDto: {
            /** Format: date-time */
            createdAt?: string;
            description?: string | null;
            /** Format: int32 */
            displayOrder?: number;
            /** Format: int32 */
            fieldCount?: number;
            /** Format: int32 */
            id?: number;
            isActive?: boolean;
            /** Format: date-time */
            modifiedAt?: string;
            name?: string | null;
        };
        FieldGroupPagedResult: {
            items?: components["schemas"]["FieldGroupListItemDto"][] | null;
            /** Format: int32 */
            totalCount?: number;
        };
        FieldGroupUpsertDto: {
            description?: string | null;
            /** Format: int32 */
            displayOrder?: number;
            fieldIds?: number[] | null;
            isActive?: boolean;
            name?: string | null;
        };
        FolderACEDto: {
            /** Format: int32 */
            objectId?: number | null;
            permissionIds?: string | null;
            targetId?: string | null;
            targetType?: components["schemas"]["TargetEnum"];
        };
        FolderDto: {
            /** Format: date-time */
            createdAt?: string;
            description?: string | null;
            filters?: components["schemas"]["FolderFilterDto"][] | null;
            /** Format: int32 */
            folderStyle?: number | null;
            /** Format: int32 */
            id?: number;
            /** Format: int32 */
            index?: number;
            /** Format: int32 */
            level?: number;
            message?: string | null;
            /** Format: date-time */
            modifiedAt?: string;
            name?: string | null;
            /** Format: int32 */
            parentId?: number | null;
            parentName?: string | null;
            pathCode?: string | null;
            success?: boolean;
        };
        FolderFilterDto: {
            field?: components["schemas"]["ViewListFieldDto"];
            logicalGroup?: components["schemas"]["LogicalGroupEnum"];
            operator?: components["schemas"]["OperatorEnum"];
            /** Format: int32 */
            sortOrder?: number;
            value?: string | null;
        };
        GetCategoriesPagedResponseDto: {
            categories?: components["schemas"]["ViewListCategoryDto"][] | null;
            /** Format: int32 */
            totalCount?: number;
        };
        GetCategoryGroupsPagedResponseDto: {
            categoryGroups?: components["schemas"]["ViewListCategoryGroupDto"][] | null;
            /** Format: int32 */
            totalCount?: number;
        };
        GetDepartmentsPagedResponseDto: {
            departments?: components["schemas"]["DepartmentDto"][] | null;
            /** Format: int32 */
            totalCount?: number;
        };
        GetDetailCategoryResponseDto: {
            category?: components["schemas"]["ViewDetailCategoryDto"];
            categoryGroups?: components["schemas"]["ViewListCategoryGroupDto"][] | null;
        };
        GetFieldsPagedResponseDto: {
            fields?: components["schemas"]["ViewListFieldDto"][] | null;
            /** Format: int32 */
            totalCount?: number;
        };
        GetFolderByIdResponseDto: {
            categoryGroups?: components["schemas"]["ViewListCategoryGroupDto"][] | null;
            fields?: components["schemas"]["ViewFilterFieldDto"][] | null;
            folder?: components["schemas"]["FolderDto"];
            folderStyles?: components["schemas"]["BaseObject"][] | null;
            operators?: string[] | null;
            parentFolders?: components["schemas"]["ViewListFolderDto"][] | null;
        };
        GetFolderPermissionsResponseDto: {
            folderPermission?: components["schemas"]["FolderACEDto"][] | null;
            groups?: components["schemas"]["ProductGroupDto"][] | null;
            permissionTree?: components["schemas"]["PermissionDto"][] | null;
            users?: components["schemas"]["UserDto"][] | null;
        };
        GetGroupsPagedResponseDto: {
            groups?: components["schemas"]["ProductGroupDto"][] | null;
            /** Format: int32 */
            totalCount?: number;
        };
        GetNotificationTypesPagedResponseDto: {
            notificationTypes?: components["schemas"]["ViewListNotificationTypeDto"][] | null;
            /** Format: int32 */
            totalCount?: number;
        };
        GetPanelsPagedResponseDto: {
            panels?: components["schemas"]["ViewListPanelDto"][] | null;
            /** Format: int32 */
            totalCount?: number;
        };
        GetPermissionResponseDto: {
            permission?: components["schemas"]["UserGroupACEDto"];
            permissionTree?: components["schemas"]["PermissionDto"][] | null;
        };
        GetPositionsPagedResponseDto: {
            positions?: components["schemas"]["PositionDto"][] | null;
            /** Format: int32 */
            totalCount?: number;
        };
        GetUsersPagedResponseDto: {
            /** Format: int32 */
            totalCount?: number;
            users?: components["schemas"]["UserDto"][] | null;
        };
        InboxNotificationDto: {
            channel?: string | null;
            /** Format: date-time */
            createdAt?: string;
            fromUserId?: string | null;
            /** Format: int32 */
            id?: number;
            isRead?: boolean;
            message?: string | null;
            /** Format: int32 */
            notifyTypeId?: number;
            notifyTypeName?: string | null;
            /** Format: int32 */
            relatedEntityId?: number | null;
            relatedEntityType?: string | null;
            severity?: string | null;
            subject?: string | null;
            url?: string | null;
        };
        InboxPagedResult: {
            items?: components["schemas"]["InboxNotificationDto"][] | null;
            /** Format: int32 */
            totalCount?: number;
            /** Format: int32 */
            unreadCount?: number;
        };
        LdapConfigurationDto: {
            attrDepartment?: string | null;
            attrEmail?: string | null;
            attrFullName?: string | null;
            attrPhone?: string | null;
            attrTitle?: string | null;
            attrUsername?: string | null;
            baseDn?: string | null;
            bindDn?: string | null;
            bindPassword?: string | null;
            /** Format: date-time */
            createdAt?: string;
            deactivateMissingUsers?: boolean;
            filterGroups?: string | null;
            filterUsers?: string | null;
            /** Format: int32 */
            id?: number;
            isActive?: boolean;
            /** Format: date-time */
            lastSyncAt?: string | null;
            lastSyncStatus?: string | null;
            /** Format: date-time */
            modifiedAt?: string;
            serverUrl?: string | null;
            syncEnabled?: boolean;
            syncFilter?: string | null;
            /** Format: int32 */
            syncIntervalMinutes?: number;
            useSsl?: boolean;
        };
        LdapConfigurationDtoPagedResult: {
            items?: components["schemas"]["LdapConfigurationDto"][] | null;
            /** Format: int32 */
            totalCount?: number;
        };
        LdapSyncChangeDto: {
            action?: string | null;
            detail?: string | null;
            fullName?: string | null;
            username?: string | null;
        };
        LdapSyncLogDto: {
            /** Format: int32 */
            groupsSynced?: number | null;
            /** Format: int32 */
            id?: number;
            message?: string | null;
            status?: string | null;
            /** Format: date-time */
            syncTime?: string;
            /** Format: int32 */
            usersSynced?: number | null;
        };
        LdapSyncLogDtoPagedLogResult: {
            items?: components["schemas"]["LdapSyncLogDto"][] | null;
            /** Format: int32 */
            totalCount?: number;
        };
        LdapSyncResultDto: {
            changes?: components["schemas"]["LdapSyncChangeDto"][] | null;
            /** Format: int32 */
            configurationId?: number;
            /** Format: int32 */
            created?: number;
            /** Format: int32 */
            deactivated?: number;
            /** Format: int32 */
            departmentsCreated?: number;
            dryRun?: boolean;
            /** Format: int64 */
            elapsedMs?: number;
            /** Format: int32 */
            found?: number;
            message?: string | null;
            /** Format: int32 */
            positionsCreated?: number;
            /** Format: int32 */
            skipped?: number;
            success?: boolean;
            /** Format: int32 */
            unchanged?: number;
            /** Format: int32 */
            updated?: number;
        };
        LdapUserRecord: {
            department?: string | null;
            disabled?: boolean;
            distinguishedName?: string | null;
            email?: string | null;
            externalId?: string | null;
            fullName?: string | null;
            phone?: string | null;
            title?: string | null;
            username?: string | null;
        };
        /** @enum {string} */
        LogicalGroupEnum: "AND" | "OR";
        LogPurgeResultDto: {
            /** Format: int32 */
            deleted?: number;
        };
        MediaStatsDto: {
            /** Format: int32 */
            audio?: number;
            /** Format: int32 */
            fieldCount?: number;
            /** Format: int32 */
            image?: number;
            /** Format: int32 */
            other?: number;
            /** Format: int32 */
            totalAssets?: number;
            /** Format: int64 */
            totalSizeBytes?: number;
            /** Format: int32 */
            video?: number;
        };
        NotifyOutcome: {
            reason?: string | null;
            sent?: boolean;
        };
        /** @enum {string} */
        OperatorEnum: "EQUALS" | "NOT_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "GREATER_THAN" | "LESS_THAN" | "GREATER_THAN_OR_EQUAL" | "LESS_THAN_OR_EQUAL" | "STARTS_WITH" | "ENDS_WITH";
        PagedCGSceneDto: {
            cgScenes?: components["schemas"]["ViewListCGSceneDto"][] | null;
            /** Format: int32 */
            totalCount?: number;
        };
        PagedCGServersDto: {
            items?: components["schemas"]["CGServerAdminDto"][] | null;
            /** Format: int32 */
            totalCount?: number;
        };
        PageDetailAssetDto: {
            asset?: components["schemas"]["AssetDto"];
            panels?: components["schemas"]["ViewDetailPanelDto"][] | null;
        };
        PageListAssetDto: {
            assets?: components["schemas"]["ViewListAssetDto"][] | null;
            /** Format: int32 */
            totalCount?: number;
        };
        PermissionDto: {
            childrens?: components["schemas"]["PermissionDto"][] | null;
            /** Format: date-time */
            createdAt?: string;
            description?: string | null;
            /** Format: int32 */
            id?: number;
            /** Format: date-time */
            modifiedAt?: string;
            name?: string | null;
        };
        PositionDto: {
            description?: string | null;
            /** Format: int32 */
            id?: number;
            name?: string | null;
        };
        PreviewCGDto: {
            background?: string | null;
            code: string;
            folderPath: string;
            previewPath: string;
            previewType?: string | null;
            sceneName: string;
            scenePath: string;
            variables: {
                [key: string]: components["schemas"]["PreviewCGVariableDto"];
            };
        };
        PreviewCGResponseDto: {
            message?: string | null;
            previewPath?: string | null;
            success?: boolean;
        };
        PreviewCGVariableDto: {
            color?: string | null;
            /** Format: int32 */
            h?: number | null;
            value?: string | null;
            /** Format: int32 */
            w?: number | null;
            /** Format: int32 */
            x?: number | null;
            /** Format: int32 */
            y?: number | null;
        };
        ProductGroupDto: {
            description?: string | null;
            /** Format: int32 */
            id?: number;
            name?: string | null;
            users?: components["schemas"]["ViewSimplifyUserDto"][] | null;
        };
        RecentActivityDto: {
            action?: string | null;
            outcome?: string | null;
            /** Format: date-time */
            time?: string;
            userName?: string | null;
        };
        RunBackupDto: {
            databases?: string[] | null;
        };
        SaveCGServerDto: {
            ipAddress: string;
            isBackupServer?: boolean;
            location: string;
            /** Format: int32 */
            port?: number | null;
            serverName: string;
            /** Format: int32 */
            statusId?: number;
            version?: string | null;
        };
        SaveDatabaseDto: {
            connectionString: string;
            description?: string | null;
            isActive?: boolean;
            name: string;
            type: string;
        };
        SaveLdapConfigurationDto: {
            attrDepartment?: string | null;
            attrEmail?: string | null;
            attrFullName?: string | null;
            attrPhone?: string | null;
            attrTitle?: string | null;
            attrUsername?: string | null;
            baseDn?: string | null;
            bindDn?: string | null;
            bindPassword?: string | null;
            deactivateMissingUsers?: boolean;
            filterGroups?: string | null;
            filterUsers?: string | null;
            isActive?: boolean;
            serverUrl: string;
            syncEnabled?: boolean;
            syncFilter?: string | null;
            /** Format: int32 */
            syncIntervalMinutes?: number;
            useSsl?: boolean;
        };
        SaveServerDto: {
            credentials?: string | null;
            description?: string | null;
            host: string;
            isActive?: boolean;
            name: string;
            /** Format: int32 */
            port?: number | null;
            type: string;
        };
        SaveStoragePointDto: {
            accessKey?: string | null;
            description?: string | null;
            isActive?: boolean;
            name: string;
            path: string;
            secretKey?: string | null;
            type: string;
        };
        SceneInfo: {
            previewPath?: string | null;
            sceneName?: string | null;
            scenePath?: string | null;
            variables?: {
                [key: string]: string;
            } | null;
        };
        SendNotificationDto: {
            message?: string | null;
            /** Format: int32 */
            notifyTypeId?: number | null;
            severity?: string | null;
            subject?: string | null;
            toUserIds?: string[] | null;
            url?: string | null;
        };
        SendNotificationResult: {
            /** Format: int32 */
            sent?: number;
        };
        SendTestEmailDto: {
            /** Format: email */
            to: string;
        };
        SequenceDto: {
            /** Format: date-time */
            createdAt?: string;
            /** Format: int32 */
            createdBy?: number;
            description?: string | null;
            /** Format: int32 */
            id?: number;
            /** Format: date-time */
            modifiedAt?: string;
            timelineJson?: string | null;
            title?: string | null;
            /** Format: int32 */
            version?: number;
            /** Format: int32 */
            workflowItemId?: number | null;
        };
        ServerDto: {
            /** Format: date-time */
            createdAt?: string;
            credentials?: string | null;
            description?: string | null;
            host?: string | null;
            /** Format: int32 */
            id?: number;
            isActive?: boolean;
            /** Format: date-time */
            modifiedAt?: string;
            name?: string | null;
            /** Format: int32 */
            port?: number | null;
            type?: string | null;
        };
        ServerDtoPagedResult: {
            items?: components["schemas"]["ServerDto"][] | null;
            /** Format: int32 */
            totalCount?: number;
        };
        ServerInfoDto: {
            authMethod?: string | null;
            /** Format: double */
            cpuPercent?: number;
            environment?: string | null;
            framework?: string | null;
            /** Format: int64 */
            gcHeapBytes?: number;
            machineName?: string | null;
            osDescription?: string | null;
            /** Format: int64 */
            processMemoryBytes?: number;
            /** Format: int32 */
            processorCount?: number;
            /** Format: date-time */
            startedAt?: string;
            /** Format: int64 */
            totalAvailableMemoryBytes?: number;
            /** Format: int64 */
            uptimeSeconds?: number;
            version?: string | null;
        };
        ServiceHealthDto: {
            detail?: string | null;
            /** Format: int64 */
            elapsedMs?: number;
            name?: string | null;
            /** Format: int64 */
            sizeBytes?: number | null;
            status?: string | null;
        };
        SettingDto: {
            description?: string | null;
            isSecret?: boolean;
            key?: string | null;
            value?: string | null;
        };
        StoragePointDto: {
            accessKey?: string | null;
            /** Format: date-time */
            createdAt?: string;
            description?: string | null;
            /** Format: int32 */
            id?: number;
            isActive?: boolean;
            /** Format: date-time */
            modifiedAt?: string;
            name?: string | null;
            path?: string | null;
            secretKey?: string | null;
            type?: string | null;
        };
        StoragePointDtoPagedResult: {
            items?: components["schemas"]["StoragePointDto"][] | null;
            /** Format: int32 */
            totalCount?: number;
        };
        StorageStatDto: {
            available?: boolean;
            /** Format: int64 */
            freeBytes?: number | null;
            /** Format: int32 */
            id?: number;
            message?: string | null;
            name?: string | null;
            /** Format: int64 */
            totalBytes?: number | null;
            type?: string | null;
            /** Format: int64 */
            usedBytes?: number | null;
        };
        StorageUsageDto: {
            available?: boolean;
            /** Format: int64 */
            freeBytes?: number | null;
            message?: string | null;
            /** Format: int64 */
            totalBytes?: number | null;
            /** Format: int64 */
            usedBytes?: number | null;
        };
        SystemLogDto: {
            /** Format: date-time */
            createdAt?: string;
            /** Format: int32 */
            id?: number;
            logLevel?: string | null;
            message?: string | null;
            serviceName?: string | null;
            source?: string | null;
        };
        SystemLogDtoPagedLogResult: {
            items?: components["schemas"]["SystemLogDto"][] | null;
            /** Format: int32 */
            totalCount?: number;
        };
        /** @enum {string} */
        TargetEnum: "USER" | "GROUP";
        TestLdapDto: {
            password?: string | null;
            username?: string | null;
        };
        UpdateAssetFieldDto: {
            fieldName?: string | null;
            /** Format: int32 */
            id: number;
            value?: string | null;
        };
        UpdateCategoryDto: {
            code?: string | null;
            description?: string | null;
            /** Format: int32 */
            groupId?: number | null;
            name?: string | null;
        };
        UpdateCategoryGroupDto: {
            description?: string | null;
            name?: string | null;
        };
        UpdateDepartmentDto: {
            description?: string | null;
            name?: string | null;
        };
        UpdateFieldDto: {
            /** Format: int32 */
            dataTypeId?: number | null;
            defaultValue?: string | null;
            displayName?: string | null;
            editable?: boolean | null;
            fieldName?: string | null;
            isRequired?: boolean | null;
        };
        UpdateFolderDto: {
            description?: string | null;
            filters?: components["schemas"]["CreateFolderFilterDto"][] | null;
            /** Format: int32 */
            index?: number | null;
            name?: string | null;
            /** Format: int32 */
            parentId?: number | null;
        };
        UpdateNotificationTypeDto: {
            description?: string | null;
            emailSubject?: string | null;
            emailTemplate?: string | null;
            inAppTemplate?: string | null;
            name?: string | null;
            smsTemplate?: string | null;
        };
        UpdatePanelDto: {
            description?: string | null;
            fieldIds?: string | null;
            /** Format: int32 */
            index?: number | null;
            panelName?: string | null;
            visibilityRules?: string | null;
        };
        UpdatePositionDto: {
            description?: string | null;
            name?: string | null;
        };
        UpdateProductGroupDto: {
            description?: string | null;
            name?: string | null;
            userIds?: string | null;
        };
        UpdateUserDto: {
            address?: string | null;
            /** Format: date-time */
            dateOfBirth?: string | null;
            /** Format: int32 */
            departmentId?: number | null;
            distinguishedName?: string | null;
            email?: string | null;
            fullName?: string | null;
            gender?: boolean | null;
            imageUrl?: string | null;
            isActive?: boolean | null;
            password?: string | null;
            phoneNumber?: string | null;
            /** Format: int32 */
            positionId?: number | null;
            sid?: string | null;
        };
        UpsertSettingItemDto: {
            description?: string | null;
            key?: string | null;
            value?: string | null;
        };
        UserDto: {
            address?: string | null;
            /** Format: date-time */
            dateOfBirth?: string | null;
            department?: components["schemas"]["DepartmentDto"];
            email?: string | null;
            fullName?: string | null;
            gender?: boolean | null;
            id?: string | null;
            imageUrl?: string | null;
            isActive?: boolean;
            password?: string | null;
            phoneNumber?: string | null;
            position?: components["schemas"]["PositionDto"];
            username?: string | null;
        };
        UserGroupACEDto: {
            permissionIds?: string | null;
            targetId?: string | null;
            targetType?: components["schemas"]["TargetEnum"];
        };
        UserStatsDto: {
            /** Format: int32 */
            active?: number;
            /** Format: int32 */
            activeLast15Min?: number;
            /** Format: int32 */
            loggedInLast24h?: number;
            /** Format: int32 */
            total?: number;
        };
        ViewDetailCategoryDto: {
            code?: string | null;
            description?: string | null;
            group?: components["schemas"]["ViewDetailCategoryGroupDto"];
            /** Format: int32 */
            id?: number;
            name?: string | null;
        };
        ViewDetailCategoryGroupDto: {
            description?: string | null;
            /** Format: int32 */
            id?: number;
            name?: string | null;
        };
        ViewDetailFieldDto: {
            dataType?: components["schemas"]["DataTypeDto"];
            displayName?: string | null;
            editable?: boolean;
            fieldName?: string | null;
            /** Format: int32 */
            id?: number;
            isRequired?: boolean;
            value?: string | null;
        };
        ViewDetailNotificationTypeDto: {
            description?: string | null;
            emailSubject?: string | null;
            emailTemplate?: string | null;
            /** Format: int32 */
            id?: number;
            inAppTemplate?: string | null;
            name?: string | null;
            smsTemplate?: string | null;
        };
        ViewDetailPanelDto: {
            description?: string | null;
            fields?: components["schemas"]["ViewDetailFieldDto"][] | null;
            /** Format: int32 */
            id?: number;
            /** Format: int32 */
            index?: number;
            panelName?: string | null;
            visibilityRules?: string | null;
        };
        ViewFilterFieldDto: {
            dataType?: components["schemas"]["DataTypeDto"];
            displayName?: string | null;
            fieldName?: string | null;
            /** Format: int32 */
            id?: number;
        };
        ViewListAssetDto: {
            extension?: string | null;
            fields?: components["schemas"]["ViewListAssetFieldDto"][] | null;
            filePath?: string | null;
            /** Format: int32 */
            id?: number;
            isApproved?: boolean;
            name?: string | null;
            /** Format: int64 */
            size?: number;
            /** Format: int32 */
            workflowItemId?: number | null;
        };
        ViewListAssetFieldDto: {
            color?: string | null;
            dataType?: string | null;
            displayName?: string | null;
            fieldName?: string | null;
            /** Format: int32 */
            id?: number;
            value?: string | null;
        };
        ViewListCategoryDto: {
            /** Format: int32 */
            groupId?: number;
            /** Format: int32 */
            id?: number;
            name?: string | null;
        };
        ViewListCategoryGroupDto: {
            /** Format: int32 */
            id?: number;
            name?: string | null;
        };
        ViewListCGSceneDto: {
            fields?: components["schemas"]["ViewListCGSceneFieldDto"][] | null;
            /** Format: int32 */
            id?: number;
            /** Format: int32 */
            workflowItemId?: number;
        };
        ViewListCGSceneFieldDto: {
            color?: string | null;
            dataType?: string | null;
            displayName?: string | null;
            fieldName?: string | null;
            /** Format: int32 */
            id?: number;
            value?: string | null;
        };
        ViewListFieldDto: {
            /** Format: int32 */
            id?: number;
            name?: string | null;
        };
        ViewListFolderDto: {
            /** Format: int32 */
            id?: number;
            name?: string | null;
        };
        ViewListNotificationTypeDto: {
            description?: string | null;
            /** Format: int32 */
            id?: number;
            name?: string | null;
        };
        ViewListPanelDto: {
            /** Format: int32 */
            id?: number;
            panelName?: string | null;
        };
        ViewSimplifyUserDto: {
            email?: string | null;
            fullName?: string | null;
            id?: string | null;
            isActive?: boolean;
        };
        ViewTreeFolderDto: {
            childs?: components["schemas"]["ViewTreeFolderDto"][] | null;
            hasChilds?: boolean;
            /** Format: int32 */
            id?: number;
            /** Format: int32 */
            index?: number;
            name?: string | null;
        };
        WorkflowActionAdminDto: {
            color?: string | null;
            description?: string | null;
            /** Format: int32 */
            displayOrder?: number | null;
            icon?: string | null;
            /** Format: int32 */
            id?: number;
            name?: string | null;
        };
        WorkflowActionDto: {
            color?: string | null;
            description?: string | null;
            /** Format: int32 */
            displayOrder?: number | null;
            icon?: string | null;
            /** Format: int32 */
            id?: number;
            name?: string | null;
            requireUpload?: boolean;
        };
        WorkflowActionResponseDto: {
            color?: string | null;
            id?: string | null;
            name?: string | null;
            requireUpload?: boolean;
        };
        WorkflowActionUpsertDto: {
            color?: string | null;
            description?: string | null;
            /** Format: int32 */
            displayOrder?: number | null;
            icon?: string | null;
            name?: string | null;
        };
        WorkflowDetailDto: {
            /** Format: date-time */
            createdAt?: string;
            description?: string | null;
            /** Format: int32 */
            id?: number;
            isActive?: boolean;
            layoutJson?: string | null;
            /** Format: date-time */
            modifiedAt?: string;
            name?: string | null;
            statuses?: components["schemas"]["WorkflowStatusAdminDto"][] | null;
            transitions?: components["schemas"]["WorkflowTransitionAdminDto"][] | null;
        };
        WorkflowDto: {
            /** Format: date-time */
            createdAt?: string;
            description?: string | null;
            /** Format: int32 */
            id?: number;
            /** Format: date-time */
            modifiedAt?: string;
            transitions?: components["schemas"]["WorkflowStatusTransitionDto"][] | null;
            workflowName?: string | null;
        };
        WorkflowItemDto: {
            actions?: components["schemas"]["WorkflowActionDto"][] | null;
            approvedBy?: string | null;
            assignedTo?: string | null;
            attendees?: string | null;
            author?: string | null;
            content?: string | null;
            /** Format: date-time */
            createdAt?: string;
            description?: string | null;
            histories?: components["schemas"]["WorkflowItemHistoryDto"][] | null;
            /** Format: int32 */
            id?: number;
            /** Format: date-time */
            modifiedAt?: string;
            permission?: string | null;
            sequences?: components["schemas"]["SequenceDto"][] | null;
            status?: components["schemas"]["WorkflowStatusDto"];
            /** Format: int32 */
            statusId?: number;
            title?: string | null;
            transition?: components["schemas"]["WorkflowStatusTransitionDto"];
            /** Format: int32 */
            transitionId?: number;
            versions?: components["schemas"]["WorkflowItemVersionDto"][] | null;
            workflow?: components["schemas"]["WorkflowDto"];
            /** Format: int32 */
            workflowId?: number;
        };
        WorkflowItemHistoryDto: {
            action?: components["schemas"]["WorkflowActionDto"];
            /** Format: date-time */
            actionTime?: string | null;
            assignedBy?: string | null;
            assignedTo?: string | null;
            comment?: string | null;
            /** Format: date-time */
            createdAt?: string;
            /** Format: date-time */
            deadline?: string | null;
            /** Format: int32 */
            id?: number;
            /** Format: date-time */
            modifiedAt?: string;
            transition?: components["schemas"]["WorkflowStatusTransitionDto"];
            /** Format: int32 */
            workflowItemId?: number;
        };
        WorkflowItemHistoryResponseDto: {
            action?: string | null;
            actionTime?: string | null;
            assignedBy?: string | null;
            assignedTo?: string | null;
            color?: string | null;
            comment?: string | null;
            deadline?: string | null;
            /** Format: int32 */
            id?: number;
            status?: string | null;
        };
        WorkflowItemResponseDto: {
            actions?: components["schemas"]["WorkflowActionResponseDto"][] | null;
            histories?: components["schemas"]["WorkflowItemHistoryResponseDto"][] | null;
            /** Format: int32 */
            id?: number;
        };
        WorkflowItemVersionDto: {
            contentSnapshot?: string | null;
            /** Format: date-time */
            createdAt?: string;
            diff?: string | null;
            /** Format: int32 */
            id?: number;
            /** Format: date-time */
            modifiedAt?: string;
            /** Format: int32 */
            versionNumber?: number;
            /** Format: int32 */
            workflowItemId?: number;
        };
        WorkflowLayoutDto: {
            layoutJson?: string | null;
        };
        WorkflowListItemDto: {
            /** Format: int32 */
            activeItemCount?: number;
            /** Format: date-time */
            createdAt?: string;
            description?: string | null;
            /** Format: int32 */
            id?: number;
            isActive?: boolean;
            /** Format: date-time */
            modifiedAt?: string;
            name?: string | null;
            /** Format: int32 */
            statusCount?: number;
            /** Format: int32 */
            transitionCount?: number;
        };
        WorkflowPagedResult: {
            items?: components["schemas"]["WorkflowListItemDto"][] | null;
            /** Format: int32 */
            totalCount?: number;
        };
        WorkflowStatusAdminDto: {
            color?: string | null;
            description?: string | null;
            /** Format: int32 */
            displayOrder?: number | null;
            /** Format: int32 */
            id?: number;
            isFinal?: boolean;
            isInitial?: boolean;
            /** Format: int32 */
            itemCount?: number;
            name?: string | null;
            /** Format: int32 */
            workflowId?: number | null;
        };
        WorkflowStatusDto: {
            color?: string | null;
            description?: string | null;
            /** Format: int32 */
            displayOrder?: number | null;
            /** Format: int32 */
            id?: number;
            isFinal?: boolean;
            isInitial?: boolean;
            name?: string | null;
            /** Format: int32 */
            workflowId?: number | null;
        };
        WorkflowStatusTransitionDto: {
            action?: components["schemas"]["WorkflowActionDto"];
            assignedUserGroupId?: string | null;
            /** Format: int32 */
            deadlineHours?: number | null;
            fromStatus?: components["schemas"]["WorkflowStatusDto"];
            /** Format: int32 */
            id?: number;
            toStatus?: components["schemas"]["WorkflowStatusDto"];
            /** Format: int32 */
            workflowId?: number;
        };
        WorkflowStatusUpsertDto: {
            color?: string | null;
            description?: string | null;
            /** Format: int32 */
            displayOrder?: number | null;
            isFinal?: boolean;
            isInitial?: boolean;
            name?: string | null;
        };
        WorkflowTransitionAdminDto: {
            /** Format: int32 */
            actionId?: number | null;
            actionName?: string | null;
            assignedUserGroupId?: string | null;
            /** Format: int32 */
            deadlineHours?: number | null;
            /** Format: int32 */
            fromStatusId?: number | null;
            fromStatusName?: string | null;
            /** Format: int32 */
            id?: number;
            /** Format: int32 */
            notificationTypeId?: number | null;
            requireUpload?: boolean;
            /** Format: int32 */
            toStatusId?: number | null;
            toStatusName?: string | null;
            /** Format: int32 */
            workflowId?: number;
        };
        WorkflowTransitionUpsertDto: {
            /** Format: int32 */
            actionId?: number;
            assignedUserGroupId?: string | null;
            /** Format: int32 */
            deadlineHours?: number | null;
            /** Format: int32 */
            fromStatusId?: number | null;
            /** Format: int32 */
            notificationTypeId?: number | null;
            requireUpload?: boolean;
            /** Format: int32 */
            toStatusId?: number;
        };
        WorkflowUpsertDto: {
            description?: string | null;
            isActive?: boolean;
            name?: string | null;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export type operations = Record<string, never>;
