/**
 * 操作日志路由定义
 * @description 使用 @hono/zod-openapi 定义操作日志查询路由
 */

import {
  createDataResponseSchema,
  createRoute,
  ErrorSchema,
  IdParamSchema,
  SuccessSchema,
} from '../shared'
import { LogQuerySchema, OperationLogSchema, PaginatedOperationLogSchema } from './dtos'

/**
 * 获取操作日志列表路由定义
 * GET /api/operation-logs
 */
export const listLogsRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['操作日志'],
  summary: '获取操作日志列表',
  description: '分页获取操作日志，支持多条件筛选',
  security: [{ bearerAuth: [] }],
  request: {
    query: LogQuerySchema,
  },
  responses: {
    200: {
      description: '获取成功',
      content: {
        'application/json': {
          schema: createDataResponseSchema(
            PaginatedOperationLogSchema,
            'PaginatedOperationLogResponse'
          ),
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
    403: {
      description: '无权限访问',
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
    },
  },
})

/**
 * 获取操作日志详情路由定义
 * GET /api/operation-logs/:id
 */
export const getLogRoute = createRoute({
  method: 'get',
  path: '/{id}',
  tags: ['操作日志'],
  summary: '获取操作日志详情',
  description: '根据 ID 获取操作日志详细信息',
  security: [{ bearerAuth: [] }],
  request: {
    params: IdParamSchema,
  },
  responses: {
    200: {
      description: '获取成功',
      content: {
        'application/json': {
          schema: createDataResponseSchema(OperationLogSchema, 'OperationLogResponse'),
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
    403: {
      description: '无权限访问',
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
    },
    404: {
      description: '日志不存在',
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
    },
  },
})

/**
 * 删除操作日志路由定义
 * DELETE /api/operation-logs/:id
 */
export const deleteLogRoute = createRoute({
  method: 'delete',
  path: '/{id}',
  tags: ['操作日志'],
  summary: '删除操作日志',
  description: '删除指定的操作日志',
  security: [{ bearerAuth: [] }],
  request: {
    params: IdParamSchema,
  },
  responses: {
    200: {
      description: '删除成功',
      content: {
        'application/json': {
          schema: SuccessSchema,
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
    403: {
      description: '无权限访问',
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
    },
    404: {
      description: '日志不存在',
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
    },
  },
})
