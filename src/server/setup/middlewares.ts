import type { Hono } from 'hono'
import type { Env } from '@/server/context'
import { corsMiddleware } from '@/server/middleware/cors'
import { csrfMiddleware } from '@/server/middleware/csrf'
import { loadPermissions } from '@/server/middleware/rbac'
import { requestContextMiddleware } from '@/server/middleware/request-context'
import { requestLoggerMiddleware } from '@/server/middleware/request-logger'
import { sessionAuth } from '@/server/middleware/session-auth'

const PUBLIC_PATHS = new Set(['/api/auth/login', '/api/health'])

function isPublicPath(path: string): boolean {
  return PUBLIC_PATHS.has(path)
}

export function setupMiddlewares(app: Hono<Env>): void {
  app.use('*', requestContextMiddleware)
  app.use('*', requestLoggerMiddleware)

  // CORS 必须在认证之前，否则 preflight OPTIONS 请求会被拦截
  app.use('/api/*', corsMiddleware)
  // CSRF 校验：验证非安全方法的请求来源，在认证之前拦截非法来源请求
  app.use('/api/*', csrfMiddleware)

  app.use('/api/*', async (c, next) => {
    if (isPublicPath(c.req.path)) {
      c.set('admin', null)
      c.set('sessionId', null)
      c.set('permissions', null)
      return next()
    }
    return sessionAuth(c, next)
  })

  // WHY: 公开路径已在上方短路（admin=null），loadPermissions 内部会立即 next()；
  // 为防止未来在此处加副作用，显式豁免公开路径。
  app.use('/api/*', async (c, next) => {
    if (isPublicPath(c.req.path)) return next()
    return loadPermissions(c, next)
  })
}
