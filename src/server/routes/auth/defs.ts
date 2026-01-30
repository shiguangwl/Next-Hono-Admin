/**
 * 认证路由定义
 * @description 使用 @hono/zod-openapi 定义认证相关路由
 */

import { createDataResponseSchema, createRoute, ErrorSchema, SuccessSchema } from '../shared'
import { AuthInfoResultSchema, LoginInputSchema, LoginResultSchema } from './dtos'

/**
 * 登录路由定义
 * POST /api/auth/login
 */
export const loginRoute = createRoute({
  method: 'post',
  path: '/login',
  tags: ['认证'],
  summary: '管理员登录',
  description: '使用用户名密码登录，返回 JWT Token 和管理员信息',
  request: {
    body: {
      content: {
        'application/json': {
          schema: LoginInputSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      description: '登录成功',
      content: {
        'application/json': {
          schema: createDataResponseSchema(LoginResultSchema, 'LoginResultResponse'),
        },
      },
    },
    401: {
      description: '用户名或密码错误',
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
    },
    403: {
      description: '账号已禁用',
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
    },
  },
})

/**
 * 登出路由定义
 * POST /api/auth/logout
 */
export const logoutRoute = createRoute({
  method: 'post',
  path: '/logout',
  tags: ['认证'],
  summary: '管理员登出',
  description: '登出当前管理员（客户端清除 Token）',
  responses: {
    200: {
      description: '登出成功',
      content: {
        'application/json': {
          schema: SuccessSchema,
        },
      },
    },
  },
})

/**
 * 获取认证信息路由定义
 * GET /api/auth/info
 */
export const getAuthInfoRoute = createRoute({
  method: 'get',
  path: '/info',
  tags: ['认证'],
  summary: '获取当前管理员信息',
  description: '获取当前登录管理员的详细信息、权限列表和菜单树',
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: '获取成功',
      content: {
        'application/json': {
          schema: createDataResponseSchema(AuthInfoResultSchema, 'AuthInfoResultResponse'),
        },
      },
    },
    401: {
      description: '未登录或登录已过期',
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
    },
  },
})
