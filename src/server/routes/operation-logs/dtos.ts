/**
 * 操作日志路由 DTO 定义
 * @description 操作日志查询的请求/响应 Schema
 */

import { z } from '@hono/zod-openapi'
import { createPaginatedSchema, PaginationQuerySchema } from '../shared'

// ========== 基础 Schema ==========

/**
 * 操作日志 Schema
 */
export const OperationLogSchema = z
  .object({
    id: z.number().openapi({ description: '日志 ID', example: 1 }),
    adminId: z.number().nullable().openapi({ description: '管理员 ID', example: 1 }),
    adminName: z.string().nullable().openapi({ description: '管理员名称', example: 'admin' }),
    module: z.string().nullable().openapi({ description: '模块名称', example: '用户管理' }),
    operation: z.string().nullable().openapi({ description: '操作类型', example: '创建' }),
    description: z.string().nullable().openapi({ description: '操作描述', example: '创建管理员' }),
    method: z
      .string()
      .nullable()
      .openapi({ description: '请求方法和路径', example: 'POST /api/admins' }),
    requestMethod: z.string().nullable().openapi({ description: 'HTTP 方法', example: 'POST' }),
    requestUrl: z.string().nullable().openapi({ description: '请求 URL', example: '/api/admins' }),
    requestParams: z.string().nullable().openapi({ description: '请求参数（JSON）' }),
    responseResult: z.string().nullable().openapi({ description: '响应结果（JSON）' }),
    ip: z.string().nullable().openapi({ description: 'IP 地址', example: '127.0.0.1' }),
    ipLocation: z.string().nullable().openapi({ description: 'IP 归属地', example: '本地' }),
    userAgent: z.string().nullable().openapi({ description: '用户代理' }),
    executionTime: z.number().nullable().openapi({ description: '执行时间（毫秒）', example: 100 }),
    status: z.number().openapi({ description: '状态：0-失败 1-成功', example: 1 }),
    errorMsg: z.string().nullable().openapi({ description: '错误信息' }),
    createdAt: z.string().openapi({
      description: '创建时间',
      example: '2024-01-01T00:00:00.000Z',
    }),
  })
  .openapi('OperationLog')

// ========== 查询参数 ==========

/**
 * 操作日志查询参数 Schema
 */
export const LogQuerySchema = PaginationQuerySchema.extend({
  adminId: z.coerce
    .number()
    .int()
    .positive()
    .optional()
    .openapi({ description: '管理员 ID 筛选', example: 1 }),
  adminName: z.string().optional().openapi({ description: '管理员名称筛选', example: 'admin' }),
  module: z.string().optional().openapi({ description: '模块筛选', example: '用户管理' }),
  operation: z.string().optional().openapi({ description: '操作类型筛选', example: '创建' }),
  status: z.coerce
    .number()
    .int()
    .min(0)
    .max(1)
    .optional()
    .openapi({ description: '状态筛选', example: 1 }),
  startTime: z
    .string()
    .optional()
    .openapi({ description: '开始时间', example: '2024-01-01T00:00:00.000Z' }),
  endTime: z
    .string()
    .optional()
    .openapi({ description: '结束时间', example: '2024-12-31T23:59:59.999Z' }),
})

// ========== 分页响应 ==========

/**
 * 操作日志分页响应 Schema
 */
export const PaginatedOperationLogSchema = createPaginatedSchema(
  OperationLogSchema,
  'PaginatedOperationLog'
)

// ========== 类型导出 ==========

export type OperationLog = z.infer<typeof OperationLogSchema>
export type LogQuery = z.infer<typeof LogQuerySchema>
