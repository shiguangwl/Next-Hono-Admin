/**
 * Hono RPC Client
 * @description 统一的 API Client 入口，支持 SSR/CSR 区分和自动注入 Authorization
 *
 * 使用规范：
 * - 通用业务场景：使用 getApiClient()（零配置，自动获取 token）
 * - 特殊场景（SSR、登录前、自定义认证）：使用 createClient({ token })
 * - 禁止直接使用 hc<AppType>
 */

import { type ClientResponse, hc } from 'hono/client'
import { env } from '@/env'
import type { AppType } from '@/server/types'

/**
 * Hono Client 类型
 * 注意：由于 @hono/zod-openapi 的 OpenAPIHono 与 hono/client 的类型推导不兼容，
 * 此类型为 unknown。各资源文件需要手动定义具体的 Client 类型接口。
 */
export type HonoClient = ReturnType<typeof hc<AppType>>

/**
 * Client 配置选项
 */
export interface ClientOptions {
  /**
   * 认证 Token
   * - undefined: 自动从 localStorage 获取（默认行为）
   * - string: 使用指定的 token
   * - null: 不携带 token（用于公开 API 或 SSR 场景）
   */
  token?: string | null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export type ApiErrorResponse = {
  code: string
  message: string
  details?: unknown
}

export type ApiSuccessResponse<T> = {
  code: string
  message?: string
  data: T
}

/**
 * 解包 API 响应数据
 * @param response API 响应对象
 * @param fallbackMessage 失败时的默认错误消息
 * @throws Error 当响应失败或数据格式不正确时
 */
export async function unwrapApiData<T>(
  response: Pick<ClientResponse<unknown>, 'ok' | 'json'>,
  fallbackMessage: string
): Promise<T> {
  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    if (isRecord(payload) && typeof payload.message === 'string' && payload.message.trim()) {
      throw new Error(payload.message)
    }
    throw new Error(fallbackMessage)
  }

  if (!isRecord(payload) || !('data' in payload)) {
    throw new Error(fallbackMessage)
  }

  return (payload as ApiSuccessResponse<T>).data
}

/**
 * 获取 API 基础 URL
 * - SSR: 使用完整 URL（服务端需要完整地址）
 * - CSR: 使用相对路径（浏览器自动补全）
 */
function getBaseUrl(): string {
  // 客户端使用相对路径
  if (typeof window !== 'undefined') {
    return ''
  }

  // 服务端渲染时，尝试从平台环境变量获取
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  if (process.env.RAILWAY_PUBLIC_DOMAIN) {
    return `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
  }

  // Fallback：返回 localhost（开发环境）
  return 'http://localhost:3000'
}

/**
 * 获取存储的 Token
 * 从 localStorage 中读取 Zustand 持久化的认证状态
 */
function getStoredToken(): string | null {
  if (typeof window === 'undefined') {
    return null
  }
  try {
    const authStorage = localStorage.getItem('auth-storage')
    if (authStorage) {
      const parsed = JSON.parse(authStorage)
      return parsed?.state?.token || null
    }
  } catch {
    // 解析失败时返回 null
  }
  return null
}

/**
 * 创建请求头
 */
function createHeaders(token: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  return headers
}

/**
 * 解析 token 配置
 * @param tokenOption token 配置项
 * @returns 最终使用的 token 值
 */
function resolveToken(tokenOption: string | null | undefined): string | null {
  // undefined: 自动获取
  if (tokenOption === undefined) {
    return getStoredToken()
  }
  // null 或 string: 直接使用
  return tokenOption
}

/**
 * 创建 API Client（配置化入口）
 *
 * 适用场景：
 * - SSR 渲染（token: null）
 * - 登录前请求（token: null）
 * - 自定义认证（token: customToken）
 *
 * @example
 * // 自动获取 token（等同于 getApiClient）
 * const client = createClient();
 *
 * // 使用自定义 token
 * const client = createClient({ token: customToken });
 *
 * // 不携带 token
 * const client = createClient({ token: null });
 */
export function createClient(options?: ClientOptions): HonoClient {
  const baseUrl = getBaseUrl()
  const token = resolveToken(options?.token)

  return hc<AppType>(`${baseUrl}/api`, {
    headers: () => createHeaders(token),
  })
}

/**
 * 获取 API Client（便捷入口）
 *
 * 适用场景：
 * - 通用业务查询（90% 场景）
 * - 需要自动携带当前用户 token 的请求
 *
 * 每次调用都会重新获取 token，确保使用最新的认证状态
 *
 * @example
 * const client = getApiClient();
 * const response = await client.users.$get();
 */
export function getApiClient(): HonoClient {
  return createClient()
}

/**
 * 类型导出
 */
export type { ClientResponse }
