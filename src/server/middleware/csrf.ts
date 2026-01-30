/**
 * CSRF 中间件
 * @description 防止跨站请求伪造攻击
 */

import { createMiddleware } from 'hono/factory'
import { env } from '@/env'
import { ForbiddenError } from '@/lib/errors'
import type { Env } from '@/server/context'

/** 安全的 HTTP 方法（不需要 CSRF 验证） */
const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS']

/** CSRF Token Header 名称 */
const _CSRF_HEADER = 'X-CSRF-Token'

/**
 * 构建允许的 Origin 列表
 */
function getAllowedOrigins(): string[] {
  const origins: string[] = []

  // 开发环境允许 localhost
  if (env.NODE_ENV === 'development') {
    origins.push(
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:3002'
    )
  }

  // 生产环境从平台环境变量获取
  if (env.NODE_ENV === 'production') {
    if (process.env.VERCEL_URL) {
      origins.push(`https://${process.env.VERCEL_URL}`)
    }
    if (process.env.RAILWAY_PUBLIC_DOMAIN) {
      origins.push(`https://${process.env.RAILWAY_PUBLIC_DOMAIN}`)
    }
  }

  return origins
}

/**
 * CSRF 中间件
 * @description 验证非安全方法的请求是否来自可信来源
 *
 * 验证策略：
 * 1. 安全方法（GET/HEAD/OPTIONS）跳过验证
 * 2. 检查 Origin 是否在白名单中
 * 3. 若无 Origin，检查 Referer 是否在白名单中
 * 4. 若都没有，拒绝请求（防止 CSRF 攻击）
 */
export const csrfMiddleware = createMiddleware<Env>(async (c, next) => {
  const method = c.req.method.toUpperCase()

  // 安全方法跳过验证
  if (SAFE_METHODS.includes(method)) {
    return next()
  }

  // 获取请求来源
  const origin = c.req.header('Origin')
  const referer = c.req.header('Referer')
  const allowedOrigins = getAllowedOrigins()

  // 验证 Origin
  if (origin) {
    const isAllowed = allowedOrigins.some(
      (allowed) => origin === allowed || origin.startsWith(`${allowed}/`)
    )
    if (!isAllowed) {
      throw new ForbiddenError('CSRF validation failed: invalid origin')
    }
    return next()
  }

  // 验证 Referer（当 Origin 不存在时）
  if (referer) {
    const isAllowed = allowedOrigins.some((allowed) => referer.startsWith(allowed))
    if (!isAllowed) {
      throw new ForbiddenError('CSRF validation failed: invalid referer')
    }
    return next()
  }

  // 既没有 Origin 也没有 Referer，拒绝请求
  throw new ForbiddenError('CSRF validation failed: missing origin and referer')
})

/**
 * 生成 CSRF Token
 * @description 生成一个随机的 CSRF Token
 */
export function generateCsrfToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('')
}
