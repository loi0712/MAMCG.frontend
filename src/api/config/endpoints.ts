const baseUrl = '/api'

export const apiUrls = {
    auth : {
        login: `${baseUrl}/Auth/login`
    },
    folder: {
        list: `${baseUrl}/Folder/folder-tree`,
        details: (folderId: string) => `${baseUrl}/Folder/${folderId}`,
        create: `${baseUrl}/Folder/create`,
        update: (folderId: string) => `${baseUrl}/Folder/update/${folderId}`,
        delete: (folderId: string) => `${baseUrl}/Folder/delete/${folderId}`
    },
    field: {
        list: `${baseUrl}/Field/paged`
    },
    asset: {
        list: `${baseUrl}/Asset/paged`,
        details: (assetId: string) => `${baseUrl}/Asset/${assetId}`,
        cg: (assetId: string) => `${baseUrl}/Asset/cg-info/${assetId}`,
        uploadInfo: `${baseUrl}/Asset/upload-info`,
        create: `${baseUrl}/Asset/upload`,
        update: (assetId: string) => `${baseUrl}/Asset/update/${assetId}`,
        delete: (assetId: string) => `${baseUrl}/Asset/delete/${assetId}`
    },
    category: {
        create: `${baseUrl}/Category/create`,
        list: `${baseUrl}/Category/paged`,
        details: (id: number) => `${baseUrl}/Category/${id}`
    },
    cg: {
        preview: `${baseUrl}/CGCommand/PreviewCGScene`
    }
}