/**
 * CRUD 路由定义工厂
 * @description 生成标准 CRUD 路由定义，消除重复的 OpenAPI 配置
 */

import { createRoute, type z } from '@hono/zod-openapi'
import type { ZodObject, ZodRawShape } from 'zod'
import { authResponses, createResponses, mutationResponses } from '../responses'
import { createDataResponseSchema, IdParamSchema, SuccessSchema } from '../schemas'
import type { CrudRoutes, CrudRoutesConfig } from './types'

/**
 * 创建标准 CRUD 路由定义
 *
 * @example
 * ```typescript
 * const adminRoutes = createCrudRoutes({
 *   resourceName: '管理员',
 *   tag: '用户管理',
 *   schemas: {
 *     entity: AdminSchema,
 *     create: CreateAdminInputSchema,
 *     update: UpdateAdminInputSchema,
 *     query: AdminQuerySchema,
 *     paginated: PaginatedAdminSchema,
 *   },
 *   conflictMessage: '用户名已存在',
 * })
 * ```
 */
export function createCrudRoutes<
  TEntity extends z.ZodTypeAny,
  TCreate extends z.ZodTypeAny,
  TUpdate extends z.ZodTypeAny,
  TQuery extends ZodObject<ZodRawShape>,
  TPaginated extends z.ZodTypeAny,
>(config: CrudRoutesConfig<TEntity, TCreate, TUpdate, TQuery, TPaginated>): CrudRoutes {
  const { resourceName, tag, schemas, descriptions = {}, conflictMessage } = config
  const security = [{ bearerAuth: [] }]

  // 列表路由
  const listRoute = createRoute({
    method: 'get',
    path: '/',
    tags: [tag],
    summary: `获取${resourceName}列表`,
    description: descriptions.list ?? `分页获取${resourceName}列表`,
    security,
    request: { query: schemas.query },
    responses: {
      200: {
        description: '获取成功',
        content: {
          'application/json': {
            schema: createDataResponseSchema(schemas.paginated, `${tag}ListResponse`),
          },
        },
      },
      ...authResponses,
    },
  })

  // 详情路由
  const detailRoute = createRoute({
    method: 'get',
    path: '/{id}',
    tags: [tag],
    summary: `获取${resourceName}详情`,
    description: descriptions.detail ?? `根据 ID 获取${resourceName}详情`,
    security,
    request: { params: IdParamSchema },
    responses: {
      200: {
        description: '获取成功',
        content: {
          'application/json': {
            schema: createDataResponseSchema(schemas.entity, `${tag}DetailResponse`),
          },
        },
      },
      ...mutationResponses(resourceName),
    },
  })

  // 创建路由
  const createRoute_ = createRoute({
    method: 'post',
    path: '/',
    tags: [tag],
    summary: `创建${resourceName}`,
    description: descriptions.create ?? `创建新的${resourceName}`,
    security,
    request: {
      body: {
        content: { 'application/json': { schema: schemas.create } },
        required: true,
      },
    },
    responses: {
      201: {
        description: '创建成功',
        content: {
          'application/json': {
            schema: createDataResponseSchema(schemas.entity, `${tag}CreateResponse`),
          },
        },
      },
      ...createResponses(conflictMessage ?? `${resourceName}已存在`),
    },
  })

  // 更新路由
  const updateRoute = createRoute({
    method: 'put',
    path: '/{id}',
    tags: [tag],
    summary: `更新${resourceName}`,
    description: descriptions.update ?? `更新${resourceName}信息`,
    security,
    request: {
      params: IdParamSchema,
      body: {
        content: { 'application/json': { schema: schemas.update } },
        required: true,
      },
    },
    responses: {
      200: {
        description: '更新成功',
        content: {
          'application/json': {
            schema: createDataResponseSchema(schemas.entity, `${tag}UpdateResponse`),
          },
        },
      },
      ...mutationResponses(resourceName),
    },
  })

  // 删除路由
  const deleteRoute = createRoute({
    method: 'delete',
    path: '/{id}',
    tags: [tag],
    summary: `删除${resourceName}`,
    description: descriptions.delete ?? `删除${resourceName}`,
    security,
    request: { params: IdParamSchema },
    responses: {
      200: {
        description: '删除成功',
        content: { 'application/json': { schema: SuccessSchema } },
      },
      ...mutationResponses(resourceName),
    },
  })

  return {
    listRoute,
    detailRoute,
    createRoute: createRoute_,
    updateRoute,
    deleteRoute,
  }
}
