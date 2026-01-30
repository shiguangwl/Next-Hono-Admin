/**
 * Hono Context 类型定义
 * @description 定义 Hono 应用的上下文类型，包括认证信息和权限数据
 */

import type { AdminPayload } from '@/lib/auth'

/**
 * Hono Bindings 类型
 * @description 外部注入的绑定（本项目不使用 Auth.js，无外部注入）
 */
export type Bindings = Record<string, never>

/**
 * Hono Variables 类型
 * @description 请求上下文中的变量
 */
export interface Variables {
  /** 请求唯一标识 */
  requestId: string
  /** 当前登录的管理员信息，未登录时为 null */
  admin: AdminPayload | null
  /** 当前管理员的权限标识列表，未登录时为 null，超级管理员为 ['*'] */
  permissions: string[] | null
}

/**
 * Hono Env 类型
 * @description Hono 应用的环境类型定义
 */
export interface Env {
  Bindings: Bindings
  Variables: Variables
}
