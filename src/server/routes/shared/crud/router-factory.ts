import type { MiddlewareHandler } from 'hono'
import type { Env } from '@/server/context'
import { auditLog } from '@/server/middleware/audit-log'
import { requirePermission } from '@/server/middleware/rbac'
import type { AuditConfig, CrudMiddlewareConfig, CrudMiddlewares } from './types'

/**
 * 创建 CRUD 操作的中间件数组
 * WHY: 将权限 + 审计日志的中间件配置集中管理，各资源链式注册路由时直接展开使用
 */
export function createCrudMiddlewares(config: CrudMiddlewareConfig): CrudMiddlewares {
  const {
    moduleName,
    permissionPrefix,
    audit = { create: true, update: true, delete: true },
  } = config

  const buildMiddlewares = (
    operation: 'create' | 'update' | 'delete',
    perm: string,
    defaultDesc: string
  ): MiddlewareHandler<Env>[] => {
    const mws: MiddlewareHandler<Env>[] = [requirePermission(perm)]
    const auditVal = audit[operation]
    if (auditVal !== false) {
      mws.push(
        auditLog({
          module: moduleName,
          operation: operation === 'create' ? '创建' : operation === 'update' ? '更新' : '删除',
          description: typeof auditVal === 'string' ? auditVal : defaultDesc,
        })
      )
    }
    return mws
  }

  return {
    list: [requirePermission(`${permissionPrefix}:list`)],
    detail: [requirePermission(`${permissionPrefix}:query`)],
    create: buildMiddlewares('create', `${permissionPrefix}:create`, `创建${moduleName}`),
    update: buildMiddlewares('update', `${permissionPrefix}:update`, `更新${moduleName}`),
    delete: buildMiddlewares('delete', `${permissionPrefix}:delete`, `删除${moduleName}`),
  }
}
