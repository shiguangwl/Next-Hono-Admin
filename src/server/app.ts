import { Hono } from 'hono'
import type { Env } from './context'
import { setupAuditLogger } from './setup/audit'
import { setupErrorHandlers } from './setup/error-handlers'
import { setupMiddlewares } from './setup/middlewares'
import { setupRoutes } from './setup/routes'

const app = new Hono<Env>()

setupAuditLogger()
setupMiddlewares(app)
setupRoutes(app)
setupErrorHandlers(app)

export { app }
