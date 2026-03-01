import { Hono } from 'hono'
import type { Env } from './context'
import { admins } from './routes/admins'
import { auth } from './routes/auth'
import { configs } from './routes/configs'
import { menus } from './routes/menus'
import { operationLogs } from './routes/operation-logs'
import { roles } from './routes/roles'

export const routes = new Hono<Env>()
  .route('/auth', auth)
  .route('/admins', admins)
  .route('/roles', roles)
  .route('/menus', menus)
  .route('/operation-logs', operationLogs)
  .route('/configs', configs)

export type AppType = typeof routes
