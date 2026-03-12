import { ErrorCode } from './codes'
import { reportError } from './monitor'
import { AppError } from './types'

export interface ErrorResponse {
  status: number
  code: string
  message: string
  details?: unknown
  requestId?: string
}

function getSafeMessage(status: number, message: string): string {
  return status >= 500 ? '服务器内部错误' : message
}

/**
 * 错误映射器
 * @description 将错误转换为标准化的 HTTP 响应结构
 * @param err - 错误对象
 * @param requestId - 请求追踪ID（可选）
 */
export function mapErrorToResponse(err: unknown, requestId?: string): ErrorResponse {
  // ========== 处理自定义应用错误 ==========
  if (err instanceof AppError) {
    if (!err.isOperational) {
      reportError(err, {
        requestId,
        code: err.code,
        httpStatus: err.httpStatus,
      })
    }

    return {
      status: err.httpStatus,
      code: err.code,
      message: getSafeMessage(err.httpStatus, err.message),
      details: err.httpStatus >= 500 ? undefined : err.details,
      requestId,
    }
  }

  // ========== 未知错误 → 500 ==========
  const wrappedError = err instanceof Error ? err : new Error(String(err))
  reportError(wrappedError, { requestId })

  return {
    status: 500,
    code: ErrorCode.INTERNAL_ERROR,
    message: '服务器内部错误',
    requestId,
  }
}
