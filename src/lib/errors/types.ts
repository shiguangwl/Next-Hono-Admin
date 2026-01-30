/**
 * 自定义错误类
 * @description 定义系统中使用的各类错误类型
 */

import { ErrorCode } from './codes'

/**
 * 应用错误基类选项
 */
export interface AppErrorOptions {
  /** HTTP 状态码 */
  httpStatus?: number
  /** 错误详情（可选，生产环境会被隐藏） */
  details?: unknown
  /** 错误原因（用于错误链追踪） */
  cause?: unknown
  /** 是否为可预期的操作性错误（true）还是编程错误（false） */
  isOperational?: boolean
}

/**
 * 应用错误基类
 */
export class AppError extends Error {
  /** HTTP 状态码 */
  public readonly httpStatus: number
  /** 是否为可预期的操作性错误 */
  public readonly isOperational: boolean
  /** 错误详情 */
  public readonly details?: unknown

  constructor(
    message: string,
    public readonly code: string,
    options: AppErrorOptions = {}
  ) {
    super(message, { cause: options.cause })
    this.name = this.constructor.name
    this.httpStatus = options.httpStatus ?? 400
    this.isOperational = options.isOperational ?? true
    this.details = options.details

    // 确保原型链正确
    Object.setPrototypeOf(this, new.target.prototype)

    // 捕获堆栈信息（提升调试体验）
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}

/**
 * 未授权错误 (401)
 * @description 用于未登录或 Token 无效的场景
 */
export class UnauthorizedError extends AppError {
  constructor(message = '未登录或登录已过期', details?: unknown) {
    super(message, ErrorCode.UNAUTHORIZED, {
      httpStatus: 401,
      details,
      isOperational: true,
    })
  }
}

/**
 * 禁止访问错误 (403)
 * @description 用于权限不足的场景
 */
export class ForbiddenError extends AppError {
  constructor(message = '无权限访问', details?: unknown) {
    super(message, ErrorCode.FORBIDDEN, {
      httpStatus: 403,
      details,
      isOperational: true,
    })
  }
}

/**
 * 资源未找到错误 (404)
 */
export class NotFoundError extends AppError {
  constructor(resource: string, id: string | number) {
    super(`${resource} with id ${id} not found`, ErrorCode.NOT_FOUND, {
      httpStatus: 404,
      isOperational: true,
    })
  }
}

/**
 * 资源冲突错误 (409)
 * @description 用于唯一性约束冲突等场景
 */
export class ConflictError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, ErrorCode.CONFLICT, {
      httpStatus: 409,
      details,
      isOperational: true,
    })
  }
}

/**
 * 验证错误 (400)
 * @description 用于请求参数验证失败的场景
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, ErrorCode.VALIDATION_ERROR, {
      httpStatus: 400,
      details,
      isOperational: true,
    })
  }
}

/**
 * 业务错误 (400)
 * @description 用于业务逻辑错误的场景
 */
export class BusinessError extends AppError {
  constructor(message: string, code: string = ErrorCode.BUSINESS_ERROR, details?: unknown) {
    super(message, code, {
      httpStatus: 400,
      details,
      isOperational: true,
    })
  }
}

/**
 * 请求频率超限错误 (429)
 * @description 用于速率限制场景
 */
export class RateLimitError extends AppError {
  constructor(message = '请求过于频繁，请稍后再试', details?: unknown) {
    super(message, ErrorCode.TOO_MANY_REQUESTS, {
      httpStatus: 429,
      details,
      isOperational: true,
    })
  }
}

/**
 * 服务器内部错误 (500)
 * @description 用于编程错误和未预期的异常
 */
export class InternalServerError extends AppError {
  constructor(message = '服务器内部错误', cause?: unknown) {
    super(message, ErrorCode.INTERNAL_ERROR, {
      httpStatus: 500,
      cause,
      isOperational: false, // 标记为编程错误
    })
  }
}

/**
 * 数据库错误 (500)
 * @description 用于数据库操作失败场景
 */
export class DatabaseError extends AppError {
  constructor(message = '数据库操作失败', cause?: unknown) {
    super(message, ErrorCode.DATABASE_ERROR, {
      httpStatus: 500,
      cause,
      isOperational: false,
    })
  }
}
