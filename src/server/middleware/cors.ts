// WHY: 生产环境通过 CORS_ORIGINS 环境变量配置允许的来源；未配置时回退为反射模式（兼容开发环境）

import { cors } from 'hono/cors'
import { env } from '@/env'

function resolveOrigin(requestOrigin: string): string | null {
  if (env.CORS_ORIGINS.length === 0) return requestOrigin
  return env.CORS_ORIGINS.includes(requestOrigin) ? requestOrigin : null
}

export const corsMiddleware = cors({
  origin: (origin) => resolveOrigin(origin) ?? '',
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
  maxAge: 86400,
})
