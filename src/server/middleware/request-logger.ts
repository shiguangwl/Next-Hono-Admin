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

  // 构建结构化日志对象
  const logData: Record<string, unknown> = {}

  // GET/DELETE：记录查询参数
  if (c.req.method === 'GET' || c.req.method === 'DELETE') {
    const queryString = new URL(c.req.url).search
    if (queryString) {
      const params = Object.fromEntries(new URL(c.req.url).searchParams)
      if (Object.keys(params).length > 0) {
        logData.params = params
      }
    }
  }

  // 仅在错误时记录客户端信息（用于安全审计）
  if (status >= 400) {
    const ip =
      c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
      c.req.header('x-real-ip') ||
      'unknown'
    logData.client = { ip }
  }

  // 构建紧凑但信息丰富的消息
  const query = new URL(c.req.url).search
  const adminInfo = admin ? ` [${admin.username}#${admin.adminId}]` : ''
  const message = `${c.req.method} ${c.req.path}${query}${adminInfo} → ${status} ${duration}ms`

  // 根据状态码设置日志级别
  if (status >= 500) {
    logger.error(message, logData)
  } else if (status >= 400) {
    logger.warn(message, logData)
  } else {
    logger.info(message, logData)
  }
})
