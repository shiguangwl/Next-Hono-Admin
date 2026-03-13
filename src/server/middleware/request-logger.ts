/**
 * 请求日志中间件
 * @description 记录 HTTP 请求的结构化日志
 */

import { createMiddleware } from 'hono/factory'
import { logger } from '@/lib/logging'
import type { Env } from '@/server/context'

/**
 * 请求日志中间件
 * @description
 * 记录请求的关键信息：
 * - 请求方法、路径、查询参数
 * - 响应状态码、耗时
 * - 管理员信息（如已登录）
 * - 客户端 IP（仅错误时记录，用于安全审计）
 */
export const requestLoggerMiddleware = createMiddleware<Env>(async (c, next) => {
  const start = Date.now()

  await next()

  const duration = Date.now() - start
  const status = c.res.status
  const admin = c.get('admin')
  const url = new URL(c.req.url)

  const logData: Record<string, unknown> = {}

  if (c.req.method === 'GET' || c.req.method === 'DELETE') {
    const params = Object.fromEntries(url.searchParams)
    if (Object.keys(params).length > 0) {
      logData.params = params
    }
  }

  if (status >= 400) {
    const ip =
      c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
      c.req.header('x-real-ip') ||
      'unknown'
    logData.client = { ip }
  }

  const adminInfo = admin ? ` [${admin.username}#${admin.adminId}]` : ''
  const message = `${c.req.method} ${c.req.path}${url.search}${adminInfo} → ${status} ${duration}ms`

  if (status >= 500) {
    logger.error(message, logData)
  } else if (status >= 400) {
    logger.warn(message, logData)
  } else {
    logger.info(message, logData)
  }
})
