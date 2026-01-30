/**
 * 管理员路由定义
 */

import {
  createCrudRoutes,
  createRoute,
  IdParamSchema,
  mutationResponses,
  SuccessSchema,
} from '../shared'
import {
  AdminQuerySchema,
  AdminSchema,
  CreateAdminInputSchema,
  PaginatedAdminSchema,
  ResetPasswordInputSchema,
  UpdateAdminInputSchema,
  UpdateAdminRolesInputSchema,
} from './dtos'

const security = [{ bearerAuth: [] }]

// ========== 管理员 CRUD 路由（使用工厂） ==========

export const adminRoutes = createCrudRoutes({
  resourceName: '管理员',
  tag: '用户管理',
  schemas: {
    entity: AdminSchema,
    create: CreateAdminInputSchema,
    update: UpdateAdminInputSchema,
    query: AdminQuerySchema,
    paginated: PaginatedAdminSchema,
  },
  conflictMessage: '用户名已存在',
})

// 解构导出
export const {
  listRoute: listAdminsRoute,
  detailRoute: getAdminRoute,
  createRoute: createAdminRoute,
  updateRoute: updateAdminRoute,
  deleteRoute: deleteAdminRoute,
} = adminRoutes

// ========== 扩展路由 ==========

/** 重置密码 */
export const resetPasswordRoute = createRoute({
  method: 'put',
  path: '/{id}/reset-password',
  tags: ['用户管理'],
  summary: '重置密码',
  description: '重置管理员密码',
  security,
  request: {
    params: IdParamSchema,
    body: {
      content: { 'application/json': { schema: ResetPasswordInputSchema } },
      required: true,
    },
  },
  responses: {
    200: {
      description: '重置成功',
      content: { 'application/json': { schema: SuccessSchema } },
    },
    ...mutationResponses('管理员'),
  },
})

/** 更新管理员角色 */
export const updateAdminRolesRoute = createRoute({
  method: 'put',
  path: '/{id}/roles',
  tags: ['用户管理'],
  summary: '更新管理员角色',
  description: '批量更新管理员的角色分配',
  security,
  request: {
    params: IdParamSchema,
    body: {
      content: { 'application/json': { schema: UpdateAdminRolesInputSchema } },
      required: true,
    },
  },
  responses: {
    200: {
      description: '更新成功',
      content: { 'application/json': { schema: SuccessSchema } },
    },
    ...mutationResponses('管理员'),
  },
})
