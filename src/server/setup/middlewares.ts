import type { Hono } from 'hono'
import { isPublicPath } from '@/server/config/public-paths'
import type { Env } from '@/server/context'
import { jwtAuth } from '@/server/middleware/jwt-auth'
import { loadPermissions } from '@/server/middleware/rbac'
import { requestContextMiddleware } from '@/server/middleware/request-context'
import { requestLoggerMiddleware } from '@/server/middleware/request-logger'
import { contextMiddleware } from '@/server/utils/response'

export function setupMiddlewares(app: Hono<Env>): void {
  app.use('*', requestContextMiddleware)
  app.use('*', contextMiddleware)
  app.use('*', requestLoggerMiddleware)

  app.use('/api/*', async (c, next) => {
    if (isPublicPath(c.req.path)) {
      c.set('admin', null)
      c.set('permissions', null)
      return next()
    }
    return jwtAuth(c, next)
  })

  app.use('/api/*', loadPermissions)
}
