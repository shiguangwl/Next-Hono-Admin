import { Hono } from 'hono'
import { UnauthorizedError } from '@/lib/errors'
import type { Env } from '@/server/context'
import { auditLog } from '@/server/middleware/audit-log'
import { requirePermission } from '@/server/middleware/rbac'
import { requireAuth } from '@/server/middleware/session-auth'
import {
  createAdmin,
  deleteAdmin,
  getAdminById,
  getAdminList,
  resetPassword,
  updateAdmin,
  updateAdminRoles,
} from '@/server/services'
import { R } from '@/server/utils/response'
import { zValidator } from '@/server/utils/validator'
import { IdParamSchema } from '../shared'
import {
  AdminQuerySchema,
  CreateAdminInputSchema,
  ResetPasswordInputSchema,
  UpdateAdminInputSchema,
  UpdateAdminRolesInputSchema,
} from './dtos'

const admins = new Hono<Env>()
  .use('/*', requireAuth)
  .get(
    '/',
    requirePermission('system:admin:list'),
    zValidator('query', AdminQuerySchema),
    async (c) => {
      const query = c.req.valid('query')
      const result = await getAdminList(query)
      return R.ok(c, result)
    }
  )
  .get(
    '/:id',
    requirePermission('system:admin:query'),
    zValidator('param', IdParamSchema),
    async (c) => {
      const { id } = c.req.valid('param')
      const result = await getAdminById(id)
      return R.ok(c, result)
    }
  )
  .post(
    '/',
    requirePermission('system:admin:create'),
    auditLog({
      module: '用户管理',
      operation: '创建',
      description: '创建管理员',
    }),
    zValidator('json', CreateAdminInputSchema),
    async (c) => {
      const body = c.req.valid('json')
      const result = await createAdmin(body)
      return R.ok(c, result)
    }
  )
  .put(
    '/:id',
    requirePermission('system:admin:update'),
    auditLog({
      module: '用户管理',
      operation: '更新',
      description: '更新管理员信息',
    }),
    zValidator('param', IdParamSchema),
    zValidator('json', UpdateAdminInputSchema),
    async (c) => {
      const { id } = c.req.valid('param')
      const body = c.req.valid('json')
      const result = await updateAdmin(id, body)
      return R.ok(c, result)
    }
  )
  .delete(
    '/:id',
    requirePermission('system:admin:delete'),
    auditLog({
      module: '用户管理',
      operation: '删除',
      description: '删除管理员',
    }),
    zValidator('param', IdParamSchema),
    async (c) => {
      const { id } = c.req.valid('param')
      const currentAdmin = c.get('admin')
      if (!currentAdmin) {
        throw new UnauthorizedError('未获取到管理员信息')
      }
      await deleteAdmin(id, currentAdmin.adminId)
      return R.success(c, '删除成功')
    }
  )
  .put(
    '/:id/reset-password',
    requirePermission('system:admin:resetPwd'),
    auditLog({
      module: '用户管理',
      operation: '重置密码',
      description: '重置管理员密码',
    }),
    zValidator('param', IdParamSchema),
    zValidator('json', ResetPasswordInputSchema),
    async (c) => {
      const { id } = c.req.valid('param')
      const body = c.req.valid('json')
      await resetPassword(id, body.newPassword)
      return R.success(c, '密码重置成功')
    }
  )
  .put(
    '/:id/roles',
    requirePermission('system:admin:assignRole'),
    auditLog({
      module: '用户管理',
      operation: '分配角色',
      description: '更新管理员角色',
    }),
    zValidator('param', IdParamSchema),
    zValidator('json', UpdateAdminRolesInputSchema),
    async (c) => {
      const { id } = c.req.valid('param')
      const body = c.req.valid('json')
      await updateAdminRoles(id, body.roleIds)
      return R.success(c, '角色更新成功')
    }
  )

export { admins }
