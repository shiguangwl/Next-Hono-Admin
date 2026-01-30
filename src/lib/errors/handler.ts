/**
 * 错误处理映射
 * @description 将 Service 层错误映射到 HTTP 状态码，集成日志和监控
 */

import { env } from '@/env'
import { logger } from '@/lib/logging'
import { getErrorMonitor } from './monitor'
import { AppError } from './types'

export interface ErrorResponse {
  status: number
  code: string
  message: string
  details?: unknown
  requestId?: string
}

/**
 * 增强的错误映射器
 * @description 集成日志、监控、环境保护
 * @param err - 错误对象
 * @param requestId - 请求追踪ID（可选）
 */
export function mapErrorToResponse(err: unknown, requestId?: string): ErrorResponse {
  const logMeta = { requestId, error: err }

  // ========== 处理自定义应用错误 ==========
  if (err instanceof AppError) {
    // 记录错误日志
    if (!err.isOperational) {
      // 编程错误（500）：记录完整堆栈，用于调试
      logger.error(err.message, {
        ...logMeta,
        code: err.code,
        httpStatus: err.httpStatus,
        stack: err.stack,
        cause: err.cause,
      })
    } else {
      // 操作性错误（4xx）：记录为警告
      logger.warn(err.message, {
        ...logMeta,
        code: err.code,
        httpStatus: err.httpStatus,
      })
    }

    // 发送到监控系统（仅非操作性错误）
    const monitor = getErrorMonitor()
    if (monitor && !err.isOperational) {
      monitor.captureError(err, {
        requestId,
        code: err.code,
        httpStatus: err.httpStatus,
      })
    }

    return {
      status: err.httpStatus,
      code: err.code,
      message: err.message,
      // 生产环境隐藏详情
      details: env.NODE_ENV === 'production' ? undefined : err.details,
      requestId,
    }
  }

  // ========== 处理未知错误 ==========
  logger.error('Unhandled error', {
    ...logMeta,
    stack: err instanceof Error ? err.stack : undefined,
  })

  // 发送到监控系统
  const monitor = getErrorMonitor()
  if (monitor && err instanceof Error) {
    monitor.captureError(err, { requestId })
  }

  // 生产环境隐藏错误详情
  const message =
    env.NODE_ENV === 'production'
      ? '服务器内部错误'
      : err instanceof Error
        ? err.message
        : 'Internal Server Error'

  return {
    status: 500,
    code: 'INTERNAL_ERROR',
    message,
    requestId,
  }
}
