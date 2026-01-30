/**
 * 错误监控接口
 * @description 支持 Sentry、DataDog 等第三方监控系统集成
 */

/**
 * 错误监控接口
 */
export interface ErrorMonitor {
  /**
   * 捕获错误
   * @param error - 错误对象
   * @param context - 上下文信息（如 requestId、userId 等）
   */
  captureError(error: Error, context?: Record<string, unknown>): void

  /**
   * 捕获消息
   * @param message - 消息内容
   * @param level - 消息级别
   */
  captureMessage(message: string, level: 'info' | 'warn' | 'error'): void
}

/**
 * 控制台监控实现（开发环境）
 */
export class ConsoleMonitor implements ErrorMonitor {
  captureError(error: Error, context?: Record<string, unknown>): void {
    console.error('[ErrorMonitor]', error, context)
  }

  captureMessage(message: string, level: 'info' | 'warn' | 'error'): void {
    console[level]('[ErrorMonitor]', message)
  }
}

/** 当前错误监控实例 */
let errorMonitor: ErrorMonitor | null = null

/**
 * 设置错误监控实例
 * @param monitor - 错误监控实例
 *
 * @example
 * ```ts
 * // 生产环境集成 Sentry
 * import * as Sentry from '@sentry/node'
 * import { setErrorMonitor } from '@/lib/errors'
 *
 * class SentryMonitor implements ErrorMonitor {
 *   captureError(error: Error, context?: Record<string, unknown>): void {
 *     Sentry.captureException(error, { extra: context })
 *   }
 *
 *   captureMessage(message: string, level: 'info' | 'warning' | 'error'): void {
 *     Sentry.captureMessage(message, level)
 *   }
 * }
 *
 * Sentry.init({ dsn: env.SENTRY_DSN })
 * setErrorMonitor(new SentryMonitor())
 * ```
 */
export function setErrorMonitor(monitor: ErrorMonitor): void {
  errorMonitor = monitor
}

/**
 * 获取错误监控实例
 */
export function getErrorMonitor(): ErrorMonitor | null {
  return errorMonitor
}
