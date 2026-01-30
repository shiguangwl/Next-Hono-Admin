/**
 * 统一 API 响应工具类
 * @description 提供类型安全的响应构造方法，类似 Java Spring Boot 的 R.ok() 模式
 */
/** biome-ignore-all lint/suspicious/noExplicitAny: <> */
/** biome-ignore-all lint/complexity/noStaticOnlyClass: <> */

import { AsyncLocalStorage } from 'node:async_hooks'
import type { Context } from 'hono'

// ========== Context 存储 ==========

/**
 * AsyncLocalStorage 用于存储当前请求的 Context
 * @description 使得在任何地方都能访问当前请求上下文，无需显式传递
 */
const contextStorage = new AsyncLocalStorage<Context>()

/**
 * Context 存储中间件
 * @description 必须在路由之前注册，用于将 Context 存入 AsyncLocalStorage
 * @example
 * ```typescript
 * app.use('*', contextMiddleware)
 * ```
 */
export const contextMiddleware = async (c: Context, next: () => Promise<void>) => {
  return contextStorage.run(c, next)
}

/**
 * 获取当前请求的 Context
 * @private
 */
const getContext = (): Context => {
  const c = contextStorage.getStore()
  if (!c) {
    throw new Error(
      '❌ Context not found! 请确保已注册 contextMiddleware:\n' + "app.use('*', contextMiddleware)"
    )
  }
  return c
}

// ========== 业务状态码常量 ==========

/**
 * 标准业务状态码
 * @description 用于 API 响应的业务层状态码，与 HTTP 状态码解耦
 */
export const BusinessCode = {
  /** 操作成功 */
  OK: 'OK',
  /** 未授权（未登录或 Token 无效） */
  UNAUTHORIZED: 'UNAUTHORIZED',
  /** 禁止访问（无权限） */
  FORBIDDEN: 'FORBIDDEN',
  /** 资源不存在 */
  NOT_FOUND: 'NOT_FOUND',
  /** 资源冲突（如唯一性约束） */
  CONFLICT: 'CONFLICT',
  /** 请求参数验证失败 */
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  /** 服务器内部错误 */
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  /** 业务逻辑错误（通用） */
  BUSINESS_ERROR: 'BUSINESS_ERROR',
} as const

export type BusinessCodeType = (typeof BusinessCode)[keyof typeof BusinessCode]

// ========== 响应类型定义 ==========

/**
 * 成功响应结构（带数据）
 */
export type SuccessResponse<T> = {
  code: 'OK'
  data: T
  message?: string
}

/**
 * 成功响应结构（无数据）
 */
export type EmptySuccessResponse = {
  code: 'OK'
  data: null
  message?: string
}

/**
 * 错误响应结构
 */
export type ErrorResponse = {
  code: string
  message: string
  details?: any
}

/**
 * HTTP 状态码类型
 */
export type StatusCode = 200 | 201 | 400 | 401 | 403 | 404 | 409 | 500

// ========== 响应构造工具类 ==========

/**
 * 统一响应构造器
 * @description 提供语义化的 API 响应构造方法，无需传递 Context
 * @example
 * ```typescript
 * // 成功响应
 * return R.ok(user)
 * return R.ok(users, '获取成功')
 * return R.created(admin, '创建成功')
 *
 * // 无数据成功
 * return R.success('操作成功')
 *
 * // 错误响应
 * return R.notFound('用户不存在')
 * return R.unauthorized()
 * return R.fail('CUSTOM_ERROR', '自定义错误')
 * ```
 */
export class R {
  // ========== 成功响应 ==========

  /**
   * 成功响应（200）
   * @param data - 响应数据
   * @param message - 可选的提示消息
   */
  static ok<T>(data: T, message?: string) {
    const c = getContext()
    return c.json(
      {
        code: BusinessCode.OK,
        data,
        ...(message && { message }),
      },
      200
    )
  }

  /**
   * 创建成功响应（201）
   * @param data - 创建的资源数据
   * @param message - 可选的提示消息，默认 "创建成功"
   */
  static created<T>(data: T, message = '创建成功') {
    const c = getContext()
    return c.json(
      {
        code: BusinessCode.OK,
        data,
        message,
      },
      201
    )
  }

  /**
   * 成功响应（无数据）
   * @param message - 可选的提示消息，默认 "操作成功"
   */
  static success(message = '操作成功') {
    const c = getContext()
    return c.json(
      {
        code: BusinessCode.OK,
        data: null,
        message,
      },
      200
    )
  }

  // ========== 错误响应 ==========

  /**
   * 业务失败响应（400）
   * @param code - 业务错误码
   * @param message - 错误消息
   * @param details - 可选的错误详情
   */
  static fail(code: string, message: string, details?: any) {
    const c = getContext()
    return c.json(
      {
        code,
        message,
        ...(details && { details }),
      },
      400
    )
  }

  /**
   * 未授权响应（401）
   * @param message - 错误消息，默认 "未登录或登录已过期"
   */
  static unauthorized(message = '未登录或登录已过期') {
    const c = getContext()
    return c.json(
      {
        code: BusinessCode.UNAUTHORIZED,
        message,
      },
      401
    )
  }

  /**
   * 禁止访问响应（403）
   * @param message - 错误消息，默认 "无权限访问"
   */
  static forbidden(message = '无权限访问') {
    const c = getContext()
    return c.json(
      {
        code: BusinessCode.FORBIDDEN,
        message,
      },
      403
    )
  }

  /**
   * 资源不存在响应（404）
   * @param message - 错误消息，默认 "资源不存在"
   */
  static notFound(message = '资源不存在') {
    const c = getContext()
    return c.json(
      {
        code: BusinessCode.NOT_FOUND,
        message,
      },
      404
    )
  }

  /**
   * 资源冲突响应（409）
   * @param message - 错误消息
   * @param details - 可选的冲突详情
   */
  static conflict(message: string, details?: any) {
    const c = getContext()
    return c.json(
      {
        code: BusinessCode.CONFLICT,
        message,
        ...(details && { details }),
      },
      409
    )
  }

  /**
   * 服务器错误响应（500）
   * @param message - 错误消息，默认 "服务器内部错误"
   * @param details - 可选的错误详情
   */
  static serverError(message = '服务器内部错误', details?: any) {
    const c = getContext()
    return c.json(
      {
        code: BusinessCode.INTERNAL_ERROR,
        message,
        ...(details && { details }),
      },
      500
    )
  }
}

// ========== 迁移指南（注释） ==========

/**
 * 迁移指南：从手动构造响应到使用 R 工具类
 *
 * ✅ 优势：
 * - 代码量减少 90%+
 * - 完全类型安全
 * - 统一响应格式
 * - 易于维护和重构
 * - 无需解构语法
 *
 * 📝 迁移示例：
 *
 * 【改造前】
 * return c.json({
 *   code: 'OK',
 *   message: '登录成功',
 *   data: result,
 * }, 200)
 *
 * 【改造后】
 * return R.ok(c, result, '登录成功')
 *
 * ──────────────────────────────
 *
 * 【改造前】
 * return c.json({
 *   code: 'OK',
 *   data: admin,
 * }, 200)
 *
 * 【改造后】
 * return R.ok(c, admin)
 *
 * ──────────────────────────────
 *
 * 【改造前】
 * return c.json({
 *   code: 'OK',
 *   message: '操作成功',
 *   data: null,
 * }, 200)
 *
 * 【改造后】
 * return R.success(c, '操作成功')
 *
 * ──────────────────────────────
 *
 * 【改造前】
 * return c.json({
 *   code: 'OK',
 *   data: newUser,
 * }, 201)
 *
 * 【改造后】
 * return R.created(c, newUser)
 *
 * ──────────────────────────────
 *
 * 【改造前】
 * throw new AppError('NOT_FOUND', '用户不存在', 404)
 *
 * 【改造后】
 * return R.notFound(c, '用户不存在')
 *
 * ──────────────────────────────
 *
 * 📋 完整 API 列表：
 *
 * ✅ 成功响应：
 * - R.ok(c, data, message?)        → { code: 'OK', data, message? }  → 200
 * - R.created(c, data, message?)   → { code: 'OK', data, message }   → 201
 * - R.success(c, message?)         → { code: 'OK', data: null, message } → 200
 *
 * ❌ 错误响应：
 * - R.fail(c, code, message, details?)   → { code, message, details? } → 400
 * - R.unauthorized(c, message?)          → { code: 'UNAUTHORIZED', message } → 401
 * - R.forbidden(c, message?)             → { code: 'FORBIDDEN', message } → 403
 * - R.notFound(c, message?)              → { code: 'NOT_FOUND', message } → 404
 * - R.conflict(c, message, details?)     → { code: 'CONFLICT', message, details? } → 409
 * - R.serverError(c, message?, details?) → { code: 'INTERNAL_ERROR', message, details? } → 500
 *
 * ──────────────────────────────
 *
 * 🔄 渐进式迁移策略：
 *
 * 1. 新功能优先使用 R 工具类
 * 2. 修改旧代码时顺便迁移
 * 3. 无需一次性全部迁移
 * 4. 两种方式可以共存
 *
 * ──────────────────────────────
 *
 * ⚠️ 注意事项：
 *
 * 1. 务必导入工具类：
 *    import { R } from '@/server/utils/response'
 *
 * 2. 第一个参数是 Context：
 *    return R.ok(c, data)        ✅
 *    return R.ok(data)           ❌
 *
 * 3. 直接返回，无需 c.json()：
 *    return R.ok(c, data)        ✅
 *    return c.json(R.ok(c, data)) ❌
 *
 * 4. 类型推导：
 *    TypeScript 会自动推导 data 的类型，无需手动标注
 *
 * 5. 错误处理：
 *    业务逻辑错误建议使用 R 工具类返回错误响应
 *    系统级错误可继续使用 AppError（会被全局错误处理器捕获）
 */
