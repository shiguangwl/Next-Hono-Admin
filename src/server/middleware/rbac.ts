import { createMiddleware } from 'hono/factory'
import { ForbiddenError, UnauthorizedError } from '@/lib/errors'
import { SUPER_ADMIN_ID } from '@/lib/utils'
import type { Env } from '@/server/context'
import { getAdminPermissions } from '@/server/services'
import {
  getCachedPermissions,
  getPermissionCacheSize,
  invalidateAllPermissionCache,
  invalidatePermissionCache,
} from '@/server/utils/permission-cache'

export { getPermissionCacheSize, invalidateAllPermissionCache, invalidatePermissionCache }

/**
 * 创建加载权限中间件
 * @param fetchPermissions - 获取权限的函数（依赖注入）
 * @description 加载当前管理员的权限列表到上下文
 */
export function createLoadPermissions(fetchPermissions: (adminId: number) => Promise<string[]>) {
  return createMiddleware<Env>(async (c, next) => {
    const admin = c.get('admin')

    if (!admin) {
      c.set('permissions', null)
      return next()
    }

    if (admin.adminId === SUPER_ADMIN_ID) {
      c.set('permissions', ['*'])
      return next()
    }

    // 使用缓存获取权限
    const permissions = await getCachedPermissions(admin.adminId, fetchPermissions)
    c.set('permissions', permissions)

    return next()
  })
}

/**
 * 加载权限中间件（默认实现）
 * @description 使用 auth.service 的权限获取函数
 */
export const loadPermissions = createLoadPermissions(
  async (adminId: number) => await getAdminPermissions(adminId)
)

/**
 * 权限验证中间件工厂
 * @param permission - 所需的权限标识
 * @description 验证当前管理员是否拥有指定权限
 */
export function requirePermission(permission: string) {
  return createMiddleware<Env>(async (c, next) => {
    const admin = c.get('admin')

    if (!admin) {
      throw new UnauthorizedError()
    }

    const permissions = c.get('permissions')

    // 超级管理员直接放行
    if (permissions?.includes('*')) {
      return next()
    }

    // 检查是否拥有所需权限
    if (!permissions?.includes(permission)) {
      throw new ForbiddenError()
    }

    return next()
  })
}

/**
 * 多权限验证中间件工厂（任一满足）
 * @param permissions - 所需的权限标识列表
 * @description 验证当前管理员是否拥有任一指定权限
 */
export function requireAnyPermission(permissions: string[]) {
  return createMiddleware<Env>(async (c, next) => {
    const admin = c.get('admin')

    if (!admin) {
      throw new UnauthorizedError()
    }

    const adminPermissions = c.get('permissions')

    // 超级管理员直接放行
    if (adminPermissions?.includes('*')) {
      return next()
    }

    // 检查是否拥有任一所需权限
    const hasPermission = permissions.some((p) => adminPermissions?.includes(p))

    if (!hasPermission) {
      throw new ForbiddenError()
    }

    return next()
  })
}

/**
 * 多权限验证中间件工厂（全部满足）
 * @param permissions - 所需的权限标识列表
 * @description 验证当前管理员是否拥有全部指定权限
 */
export function requireAllPermissions(permissions: string[]) {
  return createMiddleware<Env>(async (c, next) => {
    const admin = c.get('admin')

    if (!admin) {
      throw new UnauthorizedError()
    }

    const adminPermissions = c.get('permissions')

    // 超级管理员直接放行
    if (adminPermissions?.includes('*')) {
      return next()
    }

    // 检查是否拥有全部所需权限
    const hasAllPermissions = permissions.every((p) => adminPermissions?.includes(p))

    if (!hasAllPermissions) {
      throw new ForbiddenError()
    }

    return next()
  })
}
