/**
 * 请求上下文
 * @description 使用 AsyncLocalStorage 实现请求上下文传递
 */

import { AsyncLocalStorage } from 'node:async_hooks'

/** 请求上下文数据 */
export interface RequestContext {
  /** 请求唯一标识 */
  requestId: string
  /** 管理员 ID */
  adminId?: number
  /** 管理员用户名 */
  adminName?: string
  /** 请求开始时间 */
  startTime: number
}

/** AsyncLocalStorage 实例 */
const asyncLocalStorage = new AsyncLocalStorage<RequestContext>()

/**
 * 获取当前请求上下文
 * @returns 当前请求上下文，如果不在请求上下文中则返回 undefined
 */
export function getRequestContext(): RequestContext | undefined {
  return asyncLocalStorage.getStore()
}

/**
 * 在请求上下文中运行函数
 * @param context - 请求上下文数据
 * @param fn - 要运行的函数
 * @returns 函数返回值
 */
export function runWithRequestContext<T>(context: RequestContext, fn: () => T): T {
  return asyncLocalStorage.run(context, fn)
}

/**
 * 生成请求 ID
 * @returns 唯一的请求 ID
 */
export function generateRequestId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`
}

/**
 * 创建请求上下文
 * @param requestId - 可选的请求 ID，不提供则自动生成
 * @returns 新的请求上下文
 */
export function createRequestContext(requestId?: string): RequestContext {
  return {
    requestId: requestId ?? generateRequestId(),
    startTime: Date.now(),
  }
}
