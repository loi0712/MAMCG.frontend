import { appHandlers } from './handlers/app'
import { assetHandlers } from './handlers/assets'
import { authHandlers } from './handlers/auth'
import { backupHandlers } from './handlers/backup'
import { cgServerHandlers } from './handlers/cg-servers'
import { configurationHandlers } from './handlers/configuration'
import { emailTemplateHandlers } from './handlers/email-templates'
import { fieldGroupHandlers } from './handlers/field-groups'
import { fieldHandlers } from './handlers/fields'
import { groupHandlers } from './handlers/groups'
import { logHandlers } from './handlers/logs'
import { notificationHandlers } from './handlers/notifications'
import { panelHandlers } from './handlers/panels'
import { permissionHandlers } from './handlers/permissions'
import { settingHandlers } from './handlers/settings'
import { systemHandlers } from './handlers/system'
import { userHandlers } from './handlers/users'
import { workflowHandlers } from './handlers/workflows'

export const handlers = [
  ...authHandlers,
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
  ...systemHandlers,
  // Tài sản mẫu: trước appHandlers (danh sách rỗng)
  ...assetHandlers,
  ...appHandlers,
]
