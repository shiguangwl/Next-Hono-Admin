/**
 * OpenAPI 配置模块
 * @description 配置 OpenAPI 文档和 Swagger UI
 */

import { swaggerUI } from '@hono/swagger-ui'
import type { OpenAPIHono } from '@hono/zod-openapi'
import type { Env } from '@/server/context'

/**
 * OpenAPI 文档配置
 */
const OPENAPI_CONFIG = {
  openapi: '3.0.0' as const,
  info: {
    title: 'Admin Scaffold RBAC API',
    version: '1.0.0',
    description: '后台管理系统 RBAC 权限管理 API 文档',
  },
  servers: [
    {
      url: '/api',
      description: 'API Server',
    },
  ],
  tags: [
    { name: '认证', description: '管理员认证相关接口' },
    { name: '用户管理', description: '管理员 CRUD 接口' },
    { name: '角色管理', description: '角色 CRUD 接口' },
    { name: '菜单管理', description: '菜单权限 CRUD 接口' },
    { name: '操作日志', description: '操作日志查询接口' },
  ],
}

/**
 * 配置 OpenAPI 文档和 Swagger UI
 * @param app - Hono 应用实例
 */
export function setupOpenAPI(app: OpenAPIHono<Env>): void {
  // OpenAPI JSON 文档
  app.doc('/api/doc', OPENAPI_CONFIG)

  // Swagger UI
  app.get('/api/swagger', swaggerUI({ url: '/api/doc' }))
}
