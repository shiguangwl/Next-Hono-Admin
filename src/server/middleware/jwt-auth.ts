/**
 * JWT 认证中间件
 * @description 解析和验证 JWT Token，设置管理员上下文
 */

import { createMiddleware } from 'hono/factory'
import { verifyToken } from '@/lib/auth'
import { UnauthorizedError } from '@/lib/errors'
import type { Env } from '@/server/context'

/**
 * JWT 认证中间件（可选认证）
 * @description 解析 Authorization Header 中的 Bearer Token
 * - 有效 Token：设置 admin 上下文
 * - 无效/无 Token：设置 admin 为 null，不阻断请求
 */
export const jwtAuth = createMiddleware<Env>(async (c, next) => {
  const authHeader = c.req.header('Authorization')

  // 无 Authorization Header
  if (!authHeader?.startsWith('Bearer ')) {
    c.set('admin', null)
    c.set('permissions', null)
    return next()
  }

  const token = authHeader.slice(7)

  // 验证 Token
  const payload = verifyToken(token)
  if (payload) {
    c.set('admin', payload)
  } else {
    c.set('admin', null)
    c.set('permissions', null)
  }

  return next()
})

/**
 * 强制认证中间件
 * @description 要求请求必须携带有效的 JWT Token
 * - 未登录或 Token 无效：抛出 UnauthorizedError (401)
 */
export const requireAuth = createMiddleware<Env>(async (c, next) => {
  const admin = c.get('admin')

  if (!admin) {
    throw new UnauthorizedError()
  }

  return next()
})
