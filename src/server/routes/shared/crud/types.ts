/**
 * CRUD 路由工厂类型定义
 */

import type { RouteConfig, z } from '@hono/zod-openapi'
import type { Context } from 'hono'
import type { Env } from '@/server/context'

/**
 * CRUD 操作处理器接口
 */
export interface CrudHandlers<TList, TDetail, TCreate, TUpdate, TQuery> {
  /** 列表查询 */
  list: (query: TQuery, ctx: Context<Env>) => Promise<TList>
  /** 详情查询 */
  detail: (id: number, ctx: Context<Env>) => Promise<TDetail>
  /** 创建 */
  create: (input: TCreate, ctx: Context<Env>) => Promise<TDetail>
  /** 更新 */
  update: (id: number, input: TUpdate, ctx: Context<Env>) => Promise<TDetail>
  /** 删除 */
  delete: (id: number, ctx: Context<Env>) => Promise<void>
}

/**
 * 审计日志配置
 */
export interface AuditConfig {
  /** 创建操作审计（false 禁用，string 自定义描述） */
  create?: boolean | string
  /** 更新操作审计 */
  update?: boolean | string
  /** 删除操作审计 */
  delete?: boolean | string
}

/**
 * CRUD 路由定义集合
 */
export interface CrudRoutes {
  listRoute: RouteConfig
  detailRoute: RouteConfig
  createRoute: RouteConfig
  updateRoute: RouteConfig
  deleteRoute: RouteConfig
}

/**
 * CRUD 路由配置
 */
export interface CrudRoutesConfig<
  TEntity extends z.ZodTypeAny,
  TCreate extends z.ZodTypeAny,
  TUpdate extends z.ZodTypeAny,
  TQuery extends z.ZodTypeAny,
  TPaginated extends z.ZodTypeAny,
> {
  /** 资源名称（中文，用于描述） */
  resourceName: string
  /** OpenAPI tag */
  tag: string
  /** Schema 定义 */
  schemas: {
    entity: TEntity
    create: TCreate
    update: TUpdate
    query: TQuery
    paginated: TPaginated
  }
  /** 自定义描述 */
  descriptions?: {
    list?: string
    detail?: string
    create?: string
    update?: string
    delete?: string
  }
  /** 冲突错误描述（默认："{resourceName}已存在"） */
  conflictMessage?: string
}

/**
 * CRUD 路由实现配置
 */
export interface CrudRouterConfig {
  /** 模块名称（用于审计日志） */
  moduleName: string
  /** 权限前缀，如 'system:admin' */
  permissionPrefix: string
  /** 路由定义 */
  routes: CrudRoutes
  /** 是否需要认证（默认 true） */
  requireAuth?: boolean
  /** 审计日志配置 */
  audit?: AuditConfig
}
