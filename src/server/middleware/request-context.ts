/**
 * 请求上下文中间件
 * @description 生成请求 ID 并设置 AsyncLocalStorage 上下文
 */

import { createMiddleware } from 'hono/factory'
import { createRequestContext, runWithRequestContext } from '@/lib/logging'
import type { Env } from '@/server/context'

/**
 * 请求上下文中间件
 * @description
 * 1. 从请求头获取或生成唯一的 requestId
 * 2. 设置到 Hono Context 和响应头
 * 3. 使用 AsyncLocalStorage 包装，确保 Service 层 logger 能获取 requestId
 */
export const requestContextMiddleware = createMiddleware<Env>(async (c, next) => {
  const requestId = c.req.header('x-request-id') ?? crypto.randomUUID()

  // 设置到 Hono Context
  c.set('requestId', requestId)
  // 设置到响应头
  c.header('x-request-id', requestId)

  // 使用 AsyncLocalStorage 包装
  const ctx = createRequestContext(requestId)
  return await runWithRequestContext(ctx, next)
})
