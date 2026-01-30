/**
 * CORS 中间件
 * @description 处理跨域资源共享
 */

import { cors } from 'hono/cors'
import { env } from '@/env'

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
 * CORS 中间件配置
 */
export const corsMiddleware = cors({
  origin: (origin) => {
    const allowedOrigins = getAllowedOrigins()

    // 允许白名单中的来源
    if (allowedOrigins.includes(origin)) {
      return origin
    }

    // 开发环境允许所有来源
    if (env.NODE_ENV === 'development') {
      return origin
    }

    return null
  },
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-CSRF-Token',
    'X-Request-Id',
  ],
  exposeHeaders: [
    'X-Request-Id',
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset',
  ],
  credentials: true,
  maxAge: 86400, // 24 小时
})
