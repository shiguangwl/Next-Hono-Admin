/**
 * 路由注册模块
 * @description 挂载 API 路由
 */

import type { OpenAPIHono } from '@hono/zod-openapi'
import type { Env } from '@/server/context'
import { routes } from '@/server/route-defs'

/**
 * 注册 API 路由
 * @param app - Hono 应用实例
 */
export function setupRoutes(app: OpenAPIHono<Env>): void {
  app.route('/api', routes)
}
