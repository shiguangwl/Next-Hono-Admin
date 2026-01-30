/**
 * OpenAPI 响应预设
 * @description 标准化错误响应定义，消除重复代码
 */

import type { RouteConfig } from '@hono/zod-openapi'
import { createDataResponseSchema, ErrorSchema, SuccessSchema } from './schemas'

type ResponseConfig = NonNullable<RouteConfig['responses']>[number]

// ========== 基础错误响应 ==========

/**
 * 标准错误响应预设
 */
export const errorResponses = {
  /** 401 - 未授权 */
  unauthorized: {
    description: '未登录或登录已过期',
    content: { 'application/json': { schema: ErrorSchema } },
  } as ResponseConfig,

  /** 403 - 禁止访问 */
  forbidden: {
    description: '无权限访问',
    content: { 'application/json': { schema: ErrorSchema } },
  } as ResponseConfig,

  /** 404 - 资源不存在（通用） */
  notFound: {
    description: '资源不存在',
    content: { 'application/json': { schema: ErrorSchema } },
  } as ResponseConfig,

  /** 409 - 资源冲突（通用） */
  conflict: {
    description: '资源冲突',
    content: { 'application/json': { schema: ErrorSchema } },
  } as ResponseConfig,

  /** 500 - 服务器错误 */
  serverError: {
    description: '服务器内部错误',
    content: { 'application/json': { schema: ErrorSchema } },
  } as ResponseConfig,
}

// ========== 动态响应工厂 ==========

/**
 * 创建自定义 404 响应
 */
export function notFoundResponse(resourceName: string): ResponseConfig {
  return {
    description: `${resourceName}不存在`,
    content: { 'application/json': { schema: ErrorSchema } },
  }
}

/**
 * 创建自定义 409 响应
 */
export function conflictResponse(message: string): ResponseConfig {
  return {
    description: message,
    content: { 'application/json': { schema: ErrorSchema } },
  }
}

/**
 * 创建成功响应（带数据）
 */
export function successResponse<T extends import('zod').ZodTypeAny>(
  dataSchema: T,
  name: string,
  description = '请求成功'
): ResponseConfig {
  return {
    description,
    content: {
      'application/json': {
        schema: createDataResponseSchema(dataSchema, name),
      },
    },
  }
}

/**
 * 创建成功响应（无数据）
 */
export function emptySuccessResponse(description = '操作成功'): ResponseConfig {
  return {
    description,
    content: { 'application/json': { schema: SuccessSchema } },
  }
}

// ========== 响应组合预设 ==========

/**
 * 认证相关响应组合（401 + 403）
 */
export const authResponses = {
  401: errorResponses.unauthorized,
  403: errorResponses.forbidden,
} as const

/**
 * 标准查询响应组合（401 + 403 + 404）
 */
export function queryResponses(resourceName: string) {
  return {
    401: errorResponses.unauthorized,
    403: errorResponses.forbidden,
    404: notFoundResponse(resourceName),
  } as const
}

/**
 * 标准创建响应组合（401 + 403 + 409）
 */
export function createResponses(conflictMessage: string) {
  return {
    401: errorResponses.unauthorized,
    403: errorResponses.forbidden,
    409: conflictResponse(conflictMessage),
  } as const
}

/**
 * 标准更新/删除响应组合（401 + 403 + 404）
 */
export function mutationResponses(resourceName: string) {
  return {
    401: errorResponses.unauthorized,
    403: errorResponses.forbidden,
    404: notFoundResponse(resourceName),
  } as const
}

// ========== Builder 模式（复杂场景） ==========

/**
 * 响应集合构建器
 * @description 用于构建复杂的自定义路由响应
 */
export class ResponsesBuilder {
  private responses: Record<string, ResponseConfig> = {}

  /** 添加成功响应（200） */
  success<T extends import('zod').ZodTypeAny>(
    dataSchema: T,
    name: string,
    description = '请求成功'
  ): this {
    this.responses['200'] = successResponse(dataSchema, name, description)
    return this
  }

  /** 添加创建成功响应（201） */
  created<T extends import('zod').ZodTypeAny>(
    dataSchema: T,
    name: string,
    description = '创建成功'
  ): this {
    this.responses['201'] = successResponse(dataSchema, name, description)
    return this
  }

  /** 添加无数据成功响应（200） */
  emptySuccess(description = '操作成功'): this {
    this.responses['200'] = emptySuccessResponse(description)
    return this
  }

  /** 添加未授权响应（401） */
  unauthorized(description?: string): this {
    this.responses['401'] = description
      ? { ...errorResponses.unauthorized, description }
      : errorResponses.unauthorized
    return this
  }

  /** 添加禁止访问响应（403） */
  forbidden(description?: string): this {
    this.responses['403'] = description
      ? { ...errorResponses.forbidden, description }
      : errorResponses.forbidden
    return this
  }

  /** 添加资源不存在响应（404） */
  notFound(description?: string): this {
    this.responses['404'] = description
      ? { ...errorResponses.notFound, description }
      : errorResponses.notFound
    return this
  }

  /** 添加资源冲突响应（409） */
  conflict(description?: string): this {
    this.responses['409'] = description
      ? { ...errorResponses.conflict, description }
      : errorResponses.conflict
    return this
  }

  /** 添加自定义错误响应 */
  error(code: number, description: string): this {
    this.responses[String(code)] = {
      description,
      content: { 'application/json': { schema: ErrorSchema } },
    }
    return this
  }

  /** 批量添加常见认证错误（401, 403） */
  withAuth(): this {
    return this.unauthorized().forbidden()
  }

  /** 批量添加常见 CRUD 错误（401, 403, 404） */
  withCRUD(): this {
    return this.unauthorized().forbidden().notFound()
  }

  /** 构建最终的 responses 对象 */
  build(): Record<string, ResponseConfig> {
    return this.responses
  }
}

/**
 * 创建响应构建器
 */
export function responses(): ResponsesBuilder {
  return new ResponsesBuilder()
}
