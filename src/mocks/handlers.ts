import { appHandlers } from './handlers/app'
import { authHandlers } from './handlers/auth'
import { fieldHandlers } from './handlers/fields'
import { groupHandlers } from './handlers/groups'
import { panelHandlers } from './handlers/panels'
import { permissionHandlers } from './handlers/permissions'
import { userHandlers } from './handlers/users'

export const handlers = [
  ...authHandlers,
  ...userHandlers,
  ...groupHandlers,
  ...permissionHandlers,
  ...fieldHandlers,
  ...panelHandlers,
  ...appHandlers,
]
