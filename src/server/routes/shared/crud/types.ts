import type { Context, MiddlewareHandler } from 'hono'
import type { Env } from '@/server/context'

export interface CrudHandlers<TList, TDetail, TCreate, TUpdate, TQuery> {
  list: (query: TQuery, ctx: Context<Env>) => Promise<TList>
  detail: (id: number, ctx: Context<Env>) => Promise<TDetail>
  create: (input: TCreate, ctx: Context<Env>) => Promise<TDetail>
  update: (id: number, input: TUpdate, ctx: Context<Env>) => Promise<TDetail>
  delete: (id: number, ctx: Context<Env>) => Promise<void>
}

export interface AuditConfig {
  create?: boolean | string
  update?: boolean | string
  delete?: boolean | string
}

export interface CrudMiddlewareConfig {
  moduleName: string
  permissionPrefix: string
  audit?: AuditConfig
}

export interface CrudMiddlewares {
  list: MiddlewareHandler<Env>[]
  detail: MiddlewareHandler<Env>[]
  create: MiddlewareHandler<Env>[]
  update: MiddlewareHandler<Env>[]
  delete: MiddlewareHandler<Env>[]
}
