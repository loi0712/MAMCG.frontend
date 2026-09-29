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
        list: `${baseUrl}/Field/paged`,
        details: (id: number) => `${baseUrl}/Field/${id}`,
        create: `${baseUrl}/Field/create`,
        update: (id: number) => `${baseUrl}/Field/update/${id}`,
        delete: (id: number) => `${baseUrl}/Field/delete/${id}`
    },
    panel: {
        list: `${baseUrl}/Panel/paged`,
        details: (id: number) => `${baseUrl}/Panel/${id}`,
        create: `${baseUrl}/Panel/create`,
        update: (id: number) => `${baseUrl}/Panel/update/${id}`,
        delete: (id: number) => `${baseUrl}/Panel/delete/${id}`
    },
    user: {
        list: `${baseUrl}/User/paged`,
        details: (id: string) => `${baseUrl}/User/${id}`,
        create: `${baseUrl}/User/create`,
        update: (id: string) => `${baseUrl}/User/update/${id}`,
        delete: (id: string) => `${baseUrl}/User/delete/${id}`
    },
    department: {
        list: `${baseUrl}/Department/paged`
    },
    position: {
        list: `${baseUrl}/Position/paged`
    },
    group: {
        list: `${baseUrl}/Group/paged`,
        details: (id: number) => `${baseUrl}/Group/${id}`,
        create: `${baseUrl}/Group/create`,
        update: (id: number) => `${baseUrl}/Group/update/${id}`,
        delete: (id: number) => `${baseUrl}/Group/delete/${id}`
    },
    permission: {
        tree: `${baseUrl}/Permission/get-list`,
        byTarget: `${baseUrl}/Permission/get-by-target`,
        create: `${baseUrl}/Permission/create`
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