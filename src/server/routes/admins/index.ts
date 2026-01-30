/**
 * 管理员路由实现
 */

import { auditLog } from '@/server/middleware/audit-log'
import { requirePermission } from '@/server/middleware/rbac'
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
import type { PaginatedResult } from '@/server/utils/shared'
import { createCrudRouter } from '../shared'
import { adminRoutes, resetPasswordRoute, updateAdminRolesRoute } from './defs'
import type { AdminQuery, CreateAdminInput, UpdateAdminInput } from './dtos'

// ========== 管理员 CRUD（使用工厂） ==========

type AdminVo = Awaited<ReturnType<typeof getAdminById>>

const admins = createCrudRouter<
  PaginatedResult<AdminVo>,
  AdminVo,
  CreateAdminInput,
  UpdateAdminInput,
  AdminQuery
>(
  {
    moduleName: '用户管理',
    permissionPrefix: 'system:admin',
    routes: adminRoutes,
    audit: {
      create: '创建管理员',
      update: '更新管理员信息',
      delete: '删除管理员',
    },
  },
  {
    list: async (query) => getAdminList(query),
    detail: async (id) => getAdminById(id),
    create: async (input) => createAdmin(input),
    update: async (id, input) => updateAdmin(id, input),
    delete: async (id, ctx) => {
      const currentAdmin = ctx.get('admin')!
      await deleteAdmin(id, currentAdmin.adminId)
    },
  }
)

// ========== 扩展路由 ==========

/** PUT /api/admins/:id/reset-password - 重置密码 */
admins.use(
  resetPasswordRoute.path,
  requirePermission('system:admin:resetPwd'),
  auditLog({ module: '用户管理', operation: '重置密码', description: '重置管理员密码' })
)
admins.openapi(resetPasswordRoute, async (c) => {
  const { id } = c.req.valid('param')
  const body = c.req.valid('json')
  await resetPassword(id, body.newPassword)
  return R.success('密码重置成功')
})

/** PUT /api/admins/:id/roles - 更新管理员角色 */
admins.use(
  updateAdminRolesRoute.path,
  requirePermission('system:admin:assignRole'),
  auditLog({ module: '用户管理', operation: '分配角色', description: '更新管理员角色' })
)
admins.openapi(updateAdminRolesRoute, async (c) => {
  const { id } = c.req.valid('param')
  const body = c.req.valid('json')
  await updateAdminRoles(id, body.roleIds)
  return R.success('角色更新成功')
})

export { admins }
