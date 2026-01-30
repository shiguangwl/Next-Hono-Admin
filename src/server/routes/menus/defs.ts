/**
 * 菜单路由定义
 */

import { z } from '@hono/zod-openapi'
import {
  authResponses,
  createDataResponseSchema,
  createResponses,
  createRoute,
  IdParamSchema,
  mutationResponses,
  SuccessSchema,
} from '../shared'
import {
  CreateMenuInputSchema,
  MenuQuerySchema,
  MenuSchema,
  MenuTreeNodeSchema,
  UpdateMenuInputSchema,
} from './dtos'

const security = [{ bearerAuth: [] }]

// ========== 列表路由（菜单特殊：返回数组而非分页） ==========

export const listMenusRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['菜单管理'],
  summary: '获取菜单列表',
  description: '获取菜单扁平列表，支持按类型和状态筛选',
  security,
  request: { query: MenuQuerySchema },
  responses: {
    200: {
      description: '获取成功',
      content: {
        'application/json': {
          schema: createDataResponseSchema(z.array(MenuSchema), 'MenuListResponse'),
        },
      },
    },
    ...authResponses,
  },
})

export const getMenuTreeRoute = createRoute({
  method: 'get',
  path: '/tree',
  tags: ['菜单管理'],
  summary: '获取菜单树',
  description: '获取树形结构的菜单数据',
  security,
  request: { query: MenuQuerySchema },
  responses: {
    200: {
      description: '获取成功',
      content: {
        'application/json': {
          schema: createDataResponseSchema(z.array(MenuTreeNodeSchema), 'MenuTreeResponse'),
        },
      },
    },
    ...authResponses,
  },
})

// ========== 详情路由 ==========

export const getMenuRoute = createRoute({
  method: 'get',
  path: '/{id}',
  tags: ['菜单管理'],
  summary: '获取菜单详情',
  description: '根据 ID 获取菜单详细信息',
  security,
  request: { params: IdParamSchema },
  responses: {
    200: {
      description: '获取成功',
      content: {
        'application/json': {
          schema: createDataResponseSchema(MenuSchema, 'GetMenuResponse'),
        },
      },
    },
    ...mutationResponses('菜单'),
  },
})

// ========== 创建路由 ==========

export const createMenuRoute = createRoute({
  method: 'post',
  path: '/',
  tags: ['菜单管理'],
  summary: '创建菜单',
  description: '创建新的菜单/权限',
  security,
  request: {
    body: {
      content: { 'application/json': { schema: CreateMenuInputSchema } },
      required: true,
    },
  },
  responses: {
    201: {
      description: '创建成功',
      content: {
        'application/json': {
          schema: createDataResponseSchema(MenuSchema, 'CreateMenuResponse'),
        },
      },
    },
    ...createResponses('权限标识已存在'),
  },
})

// ========== 更新路由 ==========

export const updateMenuRoute = createRoute({
  method: 'put',
  path: '/{id}',
  tags: ['菜单管理'],
  summary: '更新菜单',
  description: '更新菜单信息',
  security,
  request: {
    params: IdParamSchema,
    body: {
      content: { 'application/json': { schema: UpdateMenuInputSchema } },
      required: true,
    },
  },
  responses: {
    200: {
      description: '更新成功',
      content: {
        'application/json': {
          schema: createDataResponseSchema(MenuSchema, 'UpdateMenuResponse'),
        },
      },
    },
    ...mutationResponses('菜单'),
  },
})

// ========== 删除路由 ==========

export const deleteMenuRoute = createRoute({
  method: 'delete',
  path: '/{id}',
  tags: ['菜单管理'],
  summary: '删除菜单',
  description: '删除菜单（有子菜单的不能删除）',
  security,
  request: { params: IdParamSchema },
  responses: {
    200: {
      description: '删除成功',
      content: { 'application/json': { schema: SuccessSchema } },
    },
    ...mutationResponses('菜单'),
  },
})
