/**
 * Hono 应用实例
 * @description 应用入口文件，负责组装各模块
 */

import { OpenAPIHono } from '@hono/zod-openapi'
import type { Env } from './context'
import { setupAuditLogger } from './setup/audit'
import { setupErrorHandlers } from './setup/error-handlers'
import { setupMiddlewares } from './setup/middlewares'
import { setupOpenAPI } from './setup/openapi'
import { setupRoutes } from './setup/routes'

/**
 * 创建 Hono 应用实例
 */
const app = new OpenAPIHono<Env>()

// ========== 初始化配置 ==========
setupAuditLogger()

// ========== 注册中间件 ==========
setupMiddlewares(app)

// ========== 挂载路由 ==========
setupRoutes(app)

// ========== 配置 OpenAPI ==========
setupOpenAPI(app)

// ========== 错误处理 ==========
setupErrorHandlers(app)

export { app }
