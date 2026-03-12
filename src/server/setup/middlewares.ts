import type { Hono } from 'hono'
import { isPublicPath } from '@/server/config/public-paths'
import type { Env } from '@/server/context'
import { corsMiddleware } from '@/server/middleware/cors'
import { loadPermissions } from '@/server/middleware/rbac'
import { requestContextMiddleware } from '@/server/middleware/request-context'
import { requestLoggerMiddleware } from '@/server/middleware/request-logger'
import { sessionAuth } from '@/server/middleware/session-auth'
import { contextMiddleware } from '@/server/utils/response'

export function setupMiddlewares(app: Hono<Env>): void {
  app.use('*', requestContextMiddleware)
  app.use('*', contextMiddleware)
  app.use('*', requestLoggerMiddleware)

  // CORS 必须在认证之前，否则 preflight OPTIONS 请求会被拦截
  app.use('/api/*', corsMiddleware)

  app.use('/api/*', async (c, next) => {
    if (isPublicPath(c.req.path)) {
      c.set('admin', null)
      c.set('sessionId', null)
      c.set('permissions', null)
      return next()
    }
    return sessionAuth(c, next)
  })

  app.use('/api/*', loadPermissions)
}
