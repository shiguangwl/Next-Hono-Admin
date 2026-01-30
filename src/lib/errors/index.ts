/**
 * 错误处理模块
 * @description 统一导出所有错误处理相关功能
 */

// 错误码常量
export { ErrorCode, type ErrorCode as ErrorCodeType } from './codes'
// 数据库错误处理器
export { handleDatabaseError } from './database'

// 错误处理器
export { type ErrorResponse, mapErrorToResponse } from './handler'
// 错误监控
export {
  ConsoleMonitor,
  type ErrorMonitor,
  getErrorMonitor,
  setErrorMonitor,
} from './monitor'
// 错误类型
export {
  AppError,
  type AppErrorOptions,
  BusinessError,
  ConflictError,
  DatabaseError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  RateLimitError,
  UnauthorizedError,
  ValidationError,
} from './types'
