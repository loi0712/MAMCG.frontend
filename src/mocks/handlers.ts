import { accountHandlers } from './handlers/account'
import { appHandlers } from './handlers/app'
import { authHandlers } from './handlers/auth'
import { backupHandlers } from './handlers/backup'
import { cgServerHandlers } from './handlers/cg-servers'
import { configurationHandlers } from './handlers/configuration'
import { emailTemplateHandlers } from './handlers/email-templates'
import { fieldGroupHandlers } from './handlers/field-groups'
import { fieldHandlers } from './handlers/fields'
import { folderPermissionHandlers } from './handlers/folder-permissions'
import { groupHandlers } from './handlers/groups'
import { logHandlers } from './handlers/logs'
import { notificationHandlers } from './handlers/notifications'
import { notificationTypeHandlers } from './handlers/notification-types'
import { panelHandlers } from './handlers/panels'
import { permissionHandlers } from './handlers/permissions'
import { settingHandlers } from './handlers/settings'
import { systemHandlers } from './handlers/system'
import { taskHandlers } from './handlers/tasks'
import { userHandlers } from './handlers/users'
import { workflowHandlers } from './handlers/workflows'

export const handlers = [
  ...authHandlers,
  // [Nhóm B] hồ sơ/phiên đăng nhập, phân quyền thư mục (kèm cây thư mục mẫu, đứng trước appHandlers)
  ...accountHandlers,
  ...folderPermissionHandlers,
  ...userHandlers,
  ...groupHandlers,
  ...permissionHandlers,
  ...fieldHandlers,
  ...fieldGroupHandlers,
  ...panelHandlers,
  ...settingHandlers,
  ...emailTemplateHandlers,
  ...backupHandlers,
  ...configurationHandlers,
  ...cgServerHandlers,
  ...logHandlers,
  ...notificationHandlers,
  ...workflowHandlers,
  // Nhóm C: công việc của tôi, lịch sử/phiên bản, loại thông báo
  ...taskHandlers,
  ...notificationTypeHandlers,
  ...systemHandlers,
  ...appHandlers,
]
