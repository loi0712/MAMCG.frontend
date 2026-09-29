import { appHandlers } from './handlers/app'
import { authHandlers } from './handlers/auth'
import { cgServerHandlers } from './handlers/cg-servers'
import { configurationHandlers } from './handlers/configuration'
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
  ...configurationHandlers,
  ...cgServerHandlers,
  ...logHandlers,
  ...notificationHandlers,
  ...workflowHandlers,
  ...systemHandlers,
  ...appHandlers,
]
