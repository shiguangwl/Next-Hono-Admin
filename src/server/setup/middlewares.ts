/**
 * 中间件注册模块
 * @description 统一注册所有中间件，保持正确的执行顺序
 */

import type { OpenAPIHono } from '@hono/zod-openapi'
import { isPublicPath } from '@/server/config/public-paths'
import type { Env } from '@/server/context'
import { corsMiddleware } from '@/server/middleware/cors'
import { jwtAuth } from '@/server/middleware/jwt-auth'
import { apiRateLimit } from '@/server/middleware/rate-limit'
import { loadPermissions } from '@/server/middleware/rbac'
import { requestContextMiddleware } from '@/server/middleware/request-context'
import { requestLoggerMiddleware } from '@/server/middleware/request-logger'
import { contextMiddleware } from '@/server/utils/response'

/**
 * 注册所有中间件
 * @param app - Hono 应用实例
 * @description
 * 中间件执行顺序：
 * 1. CORS - 快速响应 OPTIONS 预检请求
 * 2. 请求上下文 - 生成 requestId，设置 AsyncLocalStorage
 * 3. Context 中间件 - 存储 Hono Context 到 AsyncLocalStorage（用于 R 工具类）
 * 4. 请求日志 - 记录请求信息
 * 5. 速率限制 - 防止滥用
 * 6. JWT 认证 - 验证身份
 * 7. 权限加载 - 加载用户权限
 */
export function setupMiddlewares(app: OpenAPIHono<Env>): void {
  // 1. CORS 中间件（最先处理）
  // app.use('*', corsMiddleware)

  // 2. 请求上下文中间件
  app.use('*', requestContextMiddleware)

  // 3. Context 中间件（用于 R 工具类）
  app.use('*', contextMiddleware)

  // 4. 请求日志中间件
  app.use('*', requestLoggerMiddleware)

  // 5. 速率限制中间件(可选)
  // app.use('/api/*', apiRateLimit)

  // 6. JWT 认证中间件（排除公开路径）
  app.use('/api/*', async (c, next) => {
    if (isPublicPath(c.req.path)) {
      c.set('admin', null)
      c.set('permissions', null)
      return next()
    }
    return jwtAuth(c, next)
  })

  // 7. 权限加载中间件
  app.use('/api/*', loadPermissions)
}
