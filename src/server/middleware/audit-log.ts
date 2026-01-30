/**
 * 操作日志中间件
 * @description 记录管理员操作行为到数据库
 */

import { createMiddleware } from 'hono/factory'
import { logger } from '@/lib/logging'
import type { Env } from '@/server/context'

/**
 * 操作日志选项
 */
export interface AuditOptions {
  /** 模块名称 */
  module: string
  /** 操作类型 */
  operation: string
  /** 操作描述（可选） */
  description?: string
}

/**
 * 操作日志数据
 */
export interface OperationLogData {
  adminId: number | null
  adminName: string | null
  module: string
  operation: string
  description: string | null
  method: string
  requestMethod: string
  requestUrl: string
  requestParams: string | null
  ip: string | null
  userAgent: string | null
  executionTime: number
  status: number
  errorMsg: string | null
}

/**
 * 日志记录函数类型
 */
export type LogRecorder = (data: OperationLogData) => Promise<void>

/**
 * 默认日志记录函数（开发环境调试用，生产环境应替换为数据库写入）
 */
const defaultLogRecorder: LogRecorder = async (data) => {
  logger.debug('Audit log recorded', { auditData: data })
}

/** 当前使用的日志记录函数 */
let currentLogRecorder: LogRecorder = defaultLogRecorder

/**
 * 设置日志记录函数
 * @param recorder - 日志记录函数
 */
export function setLogRecorder(recorder: LogRecorder): void {
  currentLogRecorder = recorder
}

/**
 * 获取客户端 IP 地址
 */
function getClientIp(c: { req: { header: (name: string) => string | undefined } }): string | null {
  return c.req.header('x-forwarded-for')?.split(',')[0]?.trim() || c.req.header('x-real-ip') || null
}

/**
 * 安全地获取请求参数
 */
async function getRequestParams(c: {
  req: {
    method: string
    query: () => Record<string, string>
    json: () => Promise<unknown>
  }
}): Promise<string | null> {
  try {
    const method = c.req.method.toUpperCase()

    if (method === 'GET' || method === 'DELETE') {
      const query = c.req.query()
      return Object.keys(query).length > 0 ? JSON.stringify(query) : null
    }

    // POST/PUT/PATCH 请求尝试获取 body
    const body = await c.req.json().catch(() => null)
    if (body) {
      // 过滤敏感字段
      const sanitized = sanitizeBody(body as Record<string, unknown>)
      return JSON.stringify(sanitized)
    }

    return null
  } catch {
    return null
  }
}

/**
 * 过滤敏感字段
 */
function sanitizeBody(body: Record<string, unknown>): Record<string, unknown> {
  const sensitiveFields = ['password', 'newPassword', 'oldPassword', 'token', 'secret']
  const result: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(body)) {
    if (sensitiveFields.includes(key.toLowerCase())) {
      result[key] = '******'
    } else if (typeof value === 'object' && value !== null) {
      result[key] = sanitizeBody(value as Record<string, unknown>)
    } else {
      result[key] = value
    }
  }

  return result
}

/**
 * 操作日志中间件工厂
 * @param options - 日志选项
 * @description 记录操作日志，支持异步记录不阻塞主业务流程
 */
export function auditLog(options: AuditOptions) {
  return createMiddleware<Env>(async (c, next) => {
    const startTime = Date.now()
    const admin = c.get('admin')

    // 预先获取请求参数（在 next() 之前，因为 body 只能读取一次）
    const requestParams = await getRequestParams(c)

    let responseStatus = 1
    let errorMsg: string | null = null

    try {
      await next()
      responseStatus = c.res.status >= 400 ? 0 : 1
    } catch (error) {
      responseStatus = 0
      errorMsg = error instanceof Error ? error.message : String(error)
      throw error
    } finally {
      const executionTime = Date.now() - startTime

      const logData: OperationLogData = {
        adminId: admin?.adminId ?? null,
        adminName: admin?.username ?? null,
        module: options.module,
        operation: options.operation,
        description: options.description ?? null,
        method: `${c.req.method} ${c.req.path}`,
        requestMethod: c.req.method,
        requestUrl: c.req.url,
        requestParams,
        ip: getClientIp(c),
        userAgent: c.req.header('user-agent') ?? null,
        executionTime,
        status: responseStatus,
        errorMsg,
      }

      // 异步记录日志，不阻塞响应
      setImmediate(() => {
        currentLogRecorder(logData).catch((err) => {
          logger.error('Failed to record audit log', { err })
        })
      })
    }
  })
}

/**
 * 创建带自定义记录器的操作日志中间件
 * @param options - 日志选项
 * @param recorder - 自定义日志记录函数
 */
export function createAuditLog(options: AuditOptions, recorder: LogRecorder) {
  return createMiddleware<Env>(async (c, next) => {
    const startTime = Date.now()
    const admin = c.get('admin')

    const requestParams = await getRequestParams(c)

    let responseStatus = 1
    let errorMsg: string | null = null

    try {
      await next()
      responseStatus = c.res.status >= 400 ? 0 : 1
    } catch (error) {
      responseStatus = 0
      errorMsg = error instanceof Error ? error.message : String(error)
      throw error
    } finally {
      const executionTime = Date.now() - startTime

      const logData: OperationLogData = {
        adminId: admin?.adminId ?? null,
        adminName: admin?.username ?? null,
        module: options.module,
        operation: options.operation,
        description: options.description ?? null,
        method: `${c.req.method} ${c.req.path}`,
        requestMethod: c.req.method,
        requestUrl: c.req.url,
        requestParams,
        ip: getClientIp(c),
        userAgent: c.req.header('user-agent') ?? null,
        executionTime,
        status: responseStatus,
        errorMsg,
      }

      setImmediate(() => {
        recorder(logData).catch((err) => {
          logger.error('Failed to record audit log', { err })
        })
      })
    }
  })
}
