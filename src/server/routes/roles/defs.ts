/**
 * 角色路由定义
 */

import { z } from '@hono/zod-openapi'
import {
  authResponses,
  createCrudRoutes,
  createDataResponseSchema,
  createRoute,
  IdParamSchema,
  mutationResponses,
  SuccessSchema,
} from '../shared'
import {
  CreateRoleInputSchema,
  PaginatedRoleSchema,
  RoleQuerySchema,
  RoleSchema,
  UpdateRoleInputSchema,
  UpdateRoleMenusInputSchema,
} from './dtos'

const security = [{ bearerAuth: [] }]

// ========== 角色 CRUD 路由（使用工厂） ==========

export const roleRoutes = createCrudRoutes({
  resourceName: '角色',
  tag: '角色管理',
  schemas: {
    entity: RoleSchema,
    create: CreateRoleInputSchema,
    update: UpdateRoleInputSchema,
    query: RoleQuerySchema,
    paginated: PaginatedRoleSchema,
  },
  conflictMessage: '角色名已存在',
})

// 解构导出
export const {
  listRoute: listRolesRoute,
  detailRoute: getRoleRoute,
  createRoute: createRoleRoute,
  updateRoute: updateRoleRoute,
  deleteRoute: deleteRoleRoute,
} = roleRoutes

// ========== 扩展路由 ==========

/** 获取所有角色（不分页，用于下拉选择） */
export const getAllRolesRoute = createRoute({
  method: 'get',
  path: '/all',
  tags: ['角色管理'],
  summary: '获取所有角色',
  description: '获取所有启用的角色（用于下拉选择）',
  security,
  responses: {
    200: {
      description: '获取成功',
      content: {
        'application/json': {
          schema: createDataResponseSchema(z.array(RoleSchema), 'RoleListResponse'),
        },
      },
    },
    ...authResponses,
  },
})

/** 更新角色菜单权限 */
export const updateRoleMenusRoute = createRoute({
  method: 'put',
  path: '/{id}/menus',
  tags: ['角色管理'],
  summary: '更新角色菜单权限',
  description: '批量更新角色的菜单权限',
  security,
  request: {
    params: IdParamSchema,
    body: {
      content: { 'application/json': { schema: UpdateRoleMenusInputSchema } },
      required: true,
    },
  },
  responses: {
    200: {
      description: '更新成功',
      content: { 'application/json': { schema: SuccessSchema } },
    },
    ...mutationResponses('角色'),
  },
})
