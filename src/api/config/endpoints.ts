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
        delete: (id: number) => `${baseUrl}/Field/delete/${id}`,
        dataTypes: `${baseUrl}/Field/data-types`
    },
    fieldGroup: {
        list: `${baseUrl}/FieldGroup/paged`,
        details: (id: number) => `${baseUrl}/FieldGroup/${id}`,
        create: `${baseUrl}/FieldGroup/create`,
        update: (id: number) => `${baseUrl}/FieldGroup/update/${id}`,
        fields: (id: number) => `${baseUrl}/FieldGroup/fields/${id}`,
        delete: (id: number) => `${baseUrl}/FieldGroup/delete/${id}`
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
        create: `${baseUrl}/Permission/create`,
        me: `${baseUrl}/Permission/me`
    },
    setting: {
        list: `${baseUrl}/Setting`,
        save: `${baseUrl}/Setting`,
        testEmail: `${baseUrl}/Setting/test-email`
    },
    ldap: {
        list: `${baseUrl}/LdapConfiguration/paged`,
        details: (id: number) => `${baseUrl}/LdapConfiguration/${id}`,
        create: `${baseUrl}/LdapConfiguration/create`,
        update: (id: number) => `${baseUrl}/LdapConfiguration/update/${id}`,
        delete: (id: number) => `${baseUrl}/LdapConfiguration/delete/${id}`,
        test: (id: number) => `${baseUrl}/LdapConfiguration/test/${id}`,
        sync: (id: number) => `${baseUrl}/LdapConfiguration/sync/${id}`,
        users: (id: number) => `${baseUrl}/LdapConfiguration/users/${id}`
    },
    emailTemplate: {
        list: `${baseUrl}/EmailTemplate/paged`,
        details: (id: number) => `${baseUrl}/EmailTemplate/${id}`,
        events: `${baseUrl}/EmailTemplate/events`,
        create: `${baseUrl}/EmailTemplate/create`,
        update: (id: number) => `${baseUrl}/EmailTemplate/update/${id}`,
        delete: (id: number) => `${baseUrl}/EmailTemplate/delete/${id}`,
        reset: (id: number) => `${baseUrl}/EmailTemplate/reset/${id}`,
        preview: `${baseUrl}/EmailTemplate/preview`,
        sendTest: (id: number) => `${baseUrl}/EmailTemplate/send-test/${id}`,
        triggerEvent: (code: string) => `${baseUrl}/EmailTemplate/trigger-event/${code}`
    },
    emailLog: {
        list: `${baseUrl}/EmailLog/paged`,
        purge: `${baseUrl}/EmailLog`
    },
    backup: {
        config: `${baseUrl}/Backup/config`,
        databases: `${baseUrl}/Backup/databases`,
        status: `${baseUrl}/Backup/status`,
        history: `${baseUrl}/Backup/history`,
        run: `${baseUrl}/Backup/run`,
        delete: (id: number) => `${baseUrl}/Backup/history/${id}`
    },
    database: {
        list: `${baseUrl}/Database/paged`,
        details: (id: number) => `${baseUrl}/Database/${id}`,
        create: `${baseUrl}/Database/create`,
        update: (id: number) => `${baseUrl}/Database/update/${id}`,
        delete: (id: number) => `${baseUrl}/Database/delete/${id}`,
        test: (id: number) => `${baseUrl}/Database/test/${id}`
    },
    storagePoint: {
        list: `${baseUrl}/StoragePoint/paged`,
        details: (id: number) => `${baseUrl}/StoragePoint/${id}`,
        create: `${baseUrl}/StoragePoint/create`,
        update: (id: number) => `${baseUrl}/StoragePoint/update/${id}`,
        delete: (id: number) => `${baseUrl}/StoragePoint/delete/${id}`,
        usage: (id: number) => `${baseUrl}/StoragePoint/usage/${id}`
    },
    server: {
        list: `${baseUrl}/Server/paged`,
        details: (id: number) => `${baseUrl}/Server/${id}`,
        create: `${baseUrl}/Server/create`,
        update: (id: number) => `${baseUrl}/Server/update/${id}`,
        delete: (id: number) => `${baseUrl}/Server/delete/${id}`
    },
    cgServer: {
        list: `${baseUrl}/CGServer/paged`,
        statuses: `${baseUrl}/CGServer/statuses`,
        details: (id: number) => `${baseUrl}/CGServer/${id}`,
        create: `${baseUrl}/CGServer/create`,
        update: (id: number) => `${baseUrl}/CGServer/update/${id}`,
        delete: (id: number) => `${baseUrl}/CGServer/delete/${id}`,
        check: (id: number) => `${baseUrl}/CGServer/check/${id}`,
        metrics: (id: number) => `${baseUrl}/CGServer/metrics/${id}`
    },
    log: {
        activities: `${baseUrl}/Log/activities`,
        actionTypes: `${baseUrl}/Log/action-types`,
        system: `${baseUrl}/Log/system`,
        cgServer: `${baseUrl}/Log/cg-server`,
        ldapSync: `${baseUrl}/Log/ldap-sync`,
        purge: (kind: string) => `${baseUrl}/Log/${kind}`,
        deleteOne: (kind: string, id: number) => `${baseUrl}/Log/${kind}/${id}`
    },
    notification: {
        mine: `${baseUrl}/Notification/me`,
        unreadCount: `${baseUrl}/Notification/me/unread-count`,
        markRead: (id: number) => `${baseUrl}/Notification/me/read/${id}`,
        markAllRead: `${baseUrl}/Notification/me/read-all`,
        delete: (id: number) => `${baseUrl}/Notification/me/${id}`,
        deleteRead: `${baseUrl}/Notification/me/read`,
        send: `${baseUrl}/Notification/send`
    },
    workflow: {
        list: `${baseUrl}/WorkflowDefinition/paged`,
        details: (id: number) => `${baseUrl}/WorkflowDefinition/${id}`,
        create: `${baseUrl}/WorkflowDefinition/create`,
        update: (id: number) => `${baseUrl}/WorkflowDefinition/update/${id}`,
        delete: (id: number) => `${baseUrl}/WorkflowDefinition/delete/${id}`,
        clone: (id: number) => `${baseUrl}/WorkflowDefinition/clone/${id}`,
        layout: (id: number) => `${baseUrl}/WorkflowDefinition/layout/${id}`,
        addStatus: (workflowId: number) => `${baseUrl}/WorkflowDefinition/${workflowId}/statuses`,
        status: (statusId: number) => `${baseUrl}/WorkflowDefinition/statuses/${statusId}`,
        addTransition: (workflowId: number) => `${baseUrl}/WorkflowDefinition/${workflowId}/transitions`,
        transition: (transitionId: number) => `${baseUrl}/WorkflowDefinition/transitions/${transitionId}`,
        actions: `${baseUrl}/WorkflowDefinition/actions`,
        action: (id: number) => `${baseUrl}/WorkflowDefinition/actions/${id}`
    },
    // Nhóm C: công việc của tôi, lịch sử/phiên bản nội dung, loại thông báo, hub realtime
    workflowTask: {
        myTasks: `${baseUrl}/Workflow/my-tasks`,
        summary: `${baseUrl}/Workflow/my-tasks/summary`,
        history: (itemId: number) => `${baseUrl}/Workflow/item/${itemId}/history`,
        versions: (itemId: number) => `${baseUrl}/Workflow/item/${itemId}/versions`,
        version: (itemId: number, version: number) => `${baseUrl}/Workflow/item/${itemId}/versions/${version}`
    },
    notificationType: {
        list: `${baseUrl}/NotificationType/paged`,
        create: `${baseUrl}/NotificationType`,
        details: (id: number) => `${baseUrl}/NotificationType/${id}`
    },
    realtime: {
        notificationsHub: '/hubs/notifications'
    },
    systemStatus: {
        dashboard: `${baseUrl}/SystemStatus/dashboard`,
        server: `${baseUrl}/SystemStatus/server`,
        services: `${baseUrl}/SystemStatus/services`
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