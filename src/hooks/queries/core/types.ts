/**
 * React Query Hooks 共享类型定义
 */

import type { UseMutationOptions, UseQueryOptions } from '@tanstack/react-query'

/**
 * 分页响应结构
 */
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/**
 * 基础分页查询参数
 */
export interface BasePaginationQuery {
  page?: number
  pageSize?: number
}

/**
 * 资源配置
 */
export interface ResourceConfig<TQuery extends BasePaginationQuery = BasePaginationQuery> {
  /** 资源名称 */
  resourceName: string
  /** 默认分页大小 */
  defaultPageSize?: number
  /** 错误消息 */
  messages?: {
    list?: string
    detail?: string
    create?: string
    update?: string
    delete?: string
  }
  /** 默认 Query 配置 */
  defaultQueryOptions?: Partial<UseQueryOptions>
  /** 默认 Mutation 配置 */
  defaultMutationOptions?: Partial<UseMutationOptions>
}

/**
 * CRUD 操作类型
 */
export type CrudOperation = 'list' | 'detail' | 'create' | 'update' | 'delete'

/**
 * Query Key 结构
 */
export interface QueryKeys {
  all: readonly [string]
  lists: () => readonly [string, 'list']
  list: <P extends Record<string, unknown>>(params?: P) => readonly [string, 'list', P?]
  details: () => readonly [string, 'detail']
  detail: (id: number) => readonly [string, 'detail', number]
}
