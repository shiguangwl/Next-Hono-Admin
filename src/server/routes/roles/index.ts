/**
 * 角色路由实现
 */

import { OpenAPIHono } from '@hono/zod-openapi'
import type { Env } from '@/server/context'
import { auditLog } from '@/server/middleware/audit-log'
import { requireAuth } from '@/server/middleware/jwt-auth'
import { requirePermission } from '@/server/middleware/rbac'
import {
  createRole,
  deleteRole,
  getAllRoles,
  getRoleById,
  getRoleList,
  updateRole,
  updateRoleMenus,
} from '@/server/services'
import type { PaginatedResult } from '@/server/utils/shared'
import { createCrudRouter } from '../shared'
import { getAllRolesRoute, roleRoutes, updateRoleMenusRoute } from './defs'
import type { CreateRoleInput, RoleQuery, UpdateRoleInput } from './dtos'

// 创建主路由
const roles = new OpenAPIHono<Env>()

// 全局认证
roles.use('/*', requireAuth)

// ========== 扩展路由（必须在 CRUD 路由之前注册，避免 /all 被 /:id 匹配） ==========

/** GET /api/roles/all - 获取所有角色（不分页） */
roles.openapi(getAllRolesRoute, async (c) => {
  const result = await getAllRoles()
  return c.json({ code: 'OK', message: '获取成功', data: result }, 200)
})

/** PUT /api/roles/:id/menus - 更新角色菜单权限 */
roles.use(
  updateRoleMenusRoute.path,
  requirePermission('system:role:assignMenu'),
  auditLog({ module: '角色管理', operation: '分配权限', description: '更新角色菜单权限' })
)
roles.openapi(updateRoleMenusRoute, async (c) => {
  const { id } = c.req.valid('param')
  const body = c.req.valid('json')
  await updateRoleMenus(id, body.menuIds)
  return c.json({ code: 'OK', message: '权限更新成功', data: null }, 200)
})

// ========== 角色 CRUD ==========

type RoleVo = Awaited<ReturnType<typeof getRoleById>>

const crudRouter = createCrudRouter<
  PaginatedResult<RoleVo>,
  RoleVo,
  CreateRoleInput,
  UpdateRoleInput,
  RoleQuery
>(
  {
    moduleName: '角色管理',
    permissionPrefix: 'system:role',
    routes: roleRoutes,
    requireAuth: false, // 已在上面统一处理
  },
  {
    list: async (query) => getRoleList(query),
    detail: async (id) => getRoleById(id),
    create: async (input) => createRole(input),
    update: async (id, input) => updateRole(id, input),
    delete: async (id) => deleteRole(id),
  }
)

// 挂载 CRUD 路由
roles.route('/', crudRouter)

export { roles }
