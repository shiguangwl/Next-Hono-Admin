import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
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
import { R } from '@/server/utils/response'
import { IdParamSchema } from '../shared'
import {
  CreateRoleInputSchema,
  RoleQuerySchema,
  UpdateRoleInputSchema,
  UpdateRoleMenusInputSchema,
} from './dtos'

const roles = new Hono<Env>()
  .use('/*', requireAuth)
  .get('/all', async () => {
    const result = await getAllRoles()
    return R.ok(result, '获取成功')
  })
  .get(
    '/',
    requirePermission('system:role:list'),
    zValidator('query', RoleQuerySchema),
    async (c) => {
      const query = c.req.valid('query')
      const result = await getRoleList(query)
      return R.ok(result)
    }
  )
  .get(
    '/:id',
    requirePermission('system:role:query'),
    zValidator('param', IdParamSchema),
    async (c) => {
      const { id } = c.req.valid('param')
      const result = await getRoleById(id)
      return R.ok(result)
    }
  )
  .post(
    '/',
    requirePermission('system:role:create'),
    auditLog({ module: '角色管理', operation: '创建', description: '创建角色' }),
    zValidator('json', CreateRoleInputSchema),
    async (c) => {
      const body = c.req.valid('json')
      const result = await createRole(body)
      return R.created(result)
    }
  )
  .put(
    '/:id',
    requirePermission('system:role:update'),
    auditLog({ module: '角色管理', operation: '更新', description: '更新角色信息' }),
    zValidator('param', IdParamSchema),
    zValidator('json', UpdateRoleInputSchema),
    async (c) => {
      const { id } = c.req.valid('param')
      const body = c.req.valid('json')
      const result = await updateRole(id, body)
      return R.ok(result)
    }
  )
  .delete(
    '/:id',
    requirePermission('system:role:delete'),
    auditLog({ module: '角色管理', operation: '删除', description: '删除角色' }),
    zValidator('param', IdParamSchema),
    async (c) => {
      const { id } = c.req.valid('param')
      await deleteRole(id)
      return R.success('删除成功')
    }
  )
  .put(
    '/:id/menus',
    requirePermission('system:role:assignMenu'),
    auditLog({ module: '角色管理', operation: '分配权限', description: '更新角色菜单权限' }),
    zValidator('param', IdParamSchema),
    zValidator('json', UpdateRoleMenusInputSchema),
    async (c) => {
      const { id } = c.req.valid('param')
      const body = c.req.valid('json')
      await updateRoleMenus(id, body.menuIds)
      return R.success('权限更新成功')
    }
  )

export { roles }
