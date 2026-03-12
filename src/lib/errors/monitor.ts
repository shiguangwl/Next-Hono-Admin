/**
 * 错误监控模块
 * @description 消费者模式：支持注册多个 monitor 并行处理（日志落地、远程上报等）
 */

import { logger } from '@/lib/logging'

/**
 * 错误监控接口
 */
export interface ErrorMonitor {
  captureError(error: Error, context?: Record<string, unknown>): void
}

/**
 * 默认日志监控实现
 * @description 使用结构化 logger 记录错误，保证错误始终有落地记录
 */
class LoggerMonitor implements ErrorMonitor {
  captureError(error: Error, context?: Record<string, unknown>): void {
    logger.error(error.message, { err: error, ...context })
  }
}

/**
 * 注册错误监控消费者
 * @param monitor - 错误监控实例
 *
 * @example
 * ```ts
 * // 生产环境集成 Sentry
 * import * as Sentry from '@sentry/node'
 * import { addErrorMonitor } from '@/lib/errors'
 *
 * class SentryMonitor implements ErrorMonitor {
 *   captureError(error: Error, context?: Record<string, unknown>): void {
 *     Sentry.captureException(error, { extra: context })
 *   }
 * }
 *
 * Sentry.init({ dsn: env.SENTRY_DSN })
 * addErrorMonitor(new SentryMonitor())
 * ```
 */

// 默认注册 LoggerMonitor，确保即使未配置任何外部监控，错误也有日志落地
const monitors: ErrorMonitor[] = [new LoggerMonitor()]

export function addErrorMonitor(monitor: ErrorMonitor): void {
  monitors.push(monitor)
}

/**
 * 通知所有监控消费者
 * @param error - 错误对象
 * @param context - 上下文信息（requestId、errorCode 等）
 */
export function reportError(error: Error, context?: Record<string, unknown>): void {
  for (const m of monitors) {
    try {
      m.captureError(error, context)
    } catch {
      // WHY: 防止 monitor 自身异常导致错误处理链中断
    }
  }
}
