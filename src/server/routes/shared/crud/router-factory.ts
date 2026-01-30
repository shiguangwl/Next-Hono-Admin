/**
 * CRUD 路由实现工厂
 * @description 生成标准 CRUD 路由实现，消除重复的中间件和处理器代码
 */

import { OpenAPIHono } from '@hono/zod-openapi'
import type { MiddlewareHandler } from 'hono'
import type { Env } from '@/server/context'
import { auditLog } from '@/server/middleware/audit-log'
import { requireAuth } from '@/server/middleware/jwt-auth'
import { requirePermission } from '@/server/middleware/rbac'
import { R } from '@/server/utils/response'
import type { CrudHandlers, CrudRouterConfig } from './types'

/**
 * 创建标准 CRUD 路由实现
 *
 * @example
 * ```typescript
 * const admins = createCrudRouter(
 *   {
 *     moduleName: '用户管理',
 *     permissionPrefix: 'system:admin',
 *     routes: adminRoutes,
 *     audit: {
 *       create: '创建管理员',
 *       update: '更新管理员信息',
 *       delete: '删除管理员',
 *     },
 *   },
 *   {
 *     list: (query) => getAdminList(query),
 *     detail: (id) => getAdminById(id),
 *     create: (input) => createAdmin(input),
 *     update: (id, input) => updateAdmin(id, input),
 *     delete: (id) => deleteAdmin(id),
 *   }
 * )
 * ```
 */
export function createCrudRouter<TList, TDetail, TCreate, TUpdate, TQuery>(
  config: CrudRouterConfig,
  handlers: CrudHandlers<TList, TDetail, TCreate, TUpdate, TQuery>
): OpenAPIHono<Env> {
  const {
    moduleName,
    permissionPrefix,
    routes,
    requireAuth: needAuth = true,
    audit = { create: true, update: true, delete: true },
  } = config

  const router = new OpenAPIHono<Env>()

  // 全局认证中间件
  if (needAuth) {
    router.use('/*', requireAuth)
  }

  // ========== LIST ==========
  router.use('/', requirePermission(`${permissionPrefix}:list`))
  router.openapi(routes.listRoute as any, async (c: any) => {
    const query = c.req.valid('query') as TQuery
    const result = await handlers.list(query, c)
    return R.ok(result)
  })

  // ========== DETAIL ==========
  router.use('/:id', requirePermission(`${permissionPrefix}:query`))
  router.openapi(routes.detailRoute as any, async (c: any) => {
    const { id } = c.req.valid('param')
    const result = await handlers.detail(id, c)
    return R.ok(result)
  })

  // ========== CREATE ==========
  const createMiddlewares: MiddlewareHandler<Env>[] = [
    requirePermission(`${permissionPrefix}:create`),
  ]
  if (audit.create !== false) {
    createMiddlewares.push(
      auditLog({
        module: moduleName,
        operation: '创建',
        description: typeof audit.create === 'string' ? audit.create : `创建${moduleName}`,
      })
    )
  }
  router.use(routes.createRoute.path, ...createMiddlewares)
  router.openapi(routes.createRoute as any, async (c: any) => {
    const body = c.req.valid('json') as TCreate
    const result = await handlers.create(body, c)
    return R.created(result)
  })

  // ========== UPDATE ==========
  const updateMiddlewares: MiddlewareHandler<Env>[] = [
    requirePermission(`${permissionPrefix}:update`),
  ]
  if (audit.update !== false) {
    updateMiddlewares.push(
      auditLog({
        module: moduleName,
        operation: '更新',
        description: typeof audit.update === 'string' ? audit.update : `更新${moduleName}`,
      })
    )
  }
  router.use(routes.updateRoute.path, ...updateMiddlewares)
  router.openapi(routes.updateRoute as any, async (c: any) => {
    const { id } = c.req.valid('param')
    const body = c.req.valid('json') as TUpdate
    const result = await handlers.update(id, body, c)
    return R.ok(result)
  })

  // ========== DELETE ==========
  const deleteMiddlewares: MiddlewareHandler<Env>[] = [
    requirePermission(`${permissionPrefix}:delete`),
  ]
  if (audit.delete !== false) {
    deleteMiddlewares.push(
      auditLog({
        module: moduleName,
        operation: '删除',
        description: typeof audit.delete === 'string' ? audit.delete : `删除${moduleName}`,
      })
    )
  }
  router.use(routes.deleteRoute.path, ...deleteMiddlewares)
  router.openapi(routes.deleteRoute as any, async (c: any) => {
    const { id } = c.req.valid('param')
    await handlers.delete(id, c)
    return R.success('删除成功')
  })

  return router
}
