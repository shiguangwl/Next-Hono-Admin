/**
 * 速率限制中间件
 * @description 防止 API 滥用，限制请求频率
 */

import { createMiddleware } from 'hono/factory'
import { RateLimitError } from '@/lib/errors'
import type { Env } from '@/server/context'

/**
 * 速率限制配置
 */
export interface RateLimitOptions {
  /** 时间窗口（毫秒） */
  windowMs: number
  /** 时间窗口内最大请求数 */
  max: number
  /** 自定义错误消息 */
  message?: string
  /** 自定义 key 生成函数 */
  keyGenerator?: (c: { req: { header: (name: string) => string | undefined } }) => string
}

/**
 * 速率限制记录
 */
interface RateLimitRecord {
  count: number
  resetAt: number
}

/** 速率限制存储（简单内存存储，生产环境建议使用 Redis） */
const rateLimitStore = new Map<string, RateLimitRecord>()

/** 清理过期记录的间隔（1 分钟） */
const CLEANUP_INTERVAL = 60 * 1000

/** 定期清理过期记录 */
let cleanupTimer: ReturnType<typeof setInterval> | null = null

function startCleanup() {
  if (cleanupTimer) return

  cleanupTimer = setInterval(() => {
    const now = Date.now()
    for (const [key, record] of rateLimitStore.entries()) {
      if (record.resetAt <= now) {
        rateLimitStore.delete(key)
      }
    }
  }, CLEANUP_INTERVAL)

  // 允许进程正常退出
  if (typeof cleanupTimer.unref === 'function') {
    cleanupTimer.unref()
  }
}

/**
 * 默认 key 生成函数（基于 IP 地址）
 */
function defaultKeyGenerator(c: { req: { header: (name: string) => string | undefined } }): string {
  return (
    c.req.header('x-forwarded-for')?.split(',')[0]?.trim() || c.req.header('x-real-ip') || 'unknown'
  )
}

/**
 * 创建速率限制中间件
 * @param options - 速率限制配置
 */
export function rateLimit(options: RateLimitOptions) {
  const {
    windowMs,
    max,
    message = '请求过于频繁，请稍后再试',
    keyGenerator = defaultKeyGenerator,
  } = options

  // 启动清理定时器
  startCleanup()

  return createMiddleware<Env>(async (c, next) => {
    const key = keyGenerator(c)
    const now = Date.now()

    let record = rateLimitStore.get(key)

    // 如果记录不存在或已过期，创建新记录
    if (!record || record.resetAt <= now) {
      record = {
        count: 1,
        resetAt: now + windowMs,
      }
      rateLimitStore.set(key, record)
    } else {
      // 增加计数
      record.count++
    }

    // 设置响应头
    const remaining = Math.max(0, max - record.count)
    const resetTime = Math.ceil(record.resetAt / 1000)

    c.header('X-RateLimit-Limit', String(max))
    c.header('X-RateLimit-Remaining', String(remaining))
    c.header('X-RateLimit-Reset', String(resetTime))

    // 检查是否超过限制
    if (record.count > max) {
      c.header('Retry-After', String(Math.ceil((record.resetAt - now) / 1000)))
      throw new RateLimitError(message)
    }

    return next()
  })
}

/**
 * 预设：通用 API 速率限制
 * @description 每分钟 100 次请求
 */
export const apiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 分钟
  max: 10000,
  message: '请求过于频繁，请稍后再试',
})

/**
 * 预设：登录接口速率限制
 * @description 每分钟 5 次请求（防止暴力破解）
 */
export const loginRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 分钟
  max: 5,
  message: '登录尝试过于频繁，请稍后再试',
})

/**
 * 预设：严格速率限制
 * @description 每分钟 10 次请求（用于敏感操作）
 */
export const strictRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 分钟
  max: 10,
  message: '操作过于频繁，请稍后再试',
})

/**
 * 清除速率限制存储（用于测试）
 */
export function clearRateLimitStore(): void {
  rateLimitStore.clear()
}

/**
 * 获取速率限制存储大小（用于测试）
 */
export function getRateLimitStoreSize(): number {
  return rateLimitStore.size
}
