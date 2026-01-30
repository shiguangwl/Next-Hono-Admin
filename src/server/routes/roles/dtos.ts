/**
 * 角色路由 DTO 定义
 * @description 角色 CRUD 的请求/响应 Schema
 */

import { z } from '@hono/zod-openapi'
import { createPaginatedSchema, PaginationQuerySchema } from '../shared'

// ========== 基础 Schema ==========

/**
 * 角色 Schema
 */
export const RoleSchema = z
  .object({
    id: z.number().openapi({ description: '角色 ID', example: 1 }),
    roleName: z.string().openapi({ description: '角色名称', example: '超级管理员' }),
    sort: z.number().openapi({ description: '排序', example: 0 }),
    status: z.number().openapi({ description: '状态：0-禁用 1-正常', example: 1 }),
    remark: z.string().nullable().openapi({ description: '备注' }),
    createdAt: z.string().openapi({
      description: '创建时间',
      example: '2024-01-01T00:00:00.000Z',
    }),
    updatedAt: z.string().openapi({
      description: '更新时间',
      example: '2024-01-01T00:00:00.000Z',
    }),
    menuIds: z.array(z.number()).optional().openapi({ description: '菜单 ID 列表' }),
  })
  .openapi('Role')

// ========== 查询参数 ==========

/**
 * 角色列表查询参数 Schema
 */
export const RoleQuerySchema = PaginationQuerySchema.extend({
  keyword: z
    .string()
    .optional()
    .openapi({ description: '搜索关键词（角色名）', example: '管理员' }),
  status: z.coerce
    .number()
    .int()
    .min(0)
    .max(1)
    .optional()
    .openapi({ description: '状态筛选', example: 1 }),
})

// ========== 创建/更新 ==========

/**
 * 创建角色请求 Schema
 */
export const CreateRoleInputSchema = z
  .object({
    roleName: z
      .string()
      .min(1, '角色名称不能为空')
      .max(50, '角色名称最多50个字符')
      .openapi({ description: '角色名称', example: '运营人员' }),
    sort: z.number().int().min(0).default(0).openapi({ description: '排序', example: 0 }),
    status: z
      .number()
      .int()
      .min(0)
      .max(1)
      .default(1)
      .openapi({ description: '状态：0-禁用 1-正常', example: 1 }),
    remark: z.string().max(500, '备注最多500个字符').optional().openapi({ description: '备注' }),
    menuIds: z
      .array(z.number().int().positive())
      .optional()
      .openapi({ description: '菜单 ID 列表', example: [1, 2, 3] }),
  })
  .openapi('CreateRoleInput')

/**
 * 更新角色请求 Schema
 */
export const UpdateRoleInputSchema = z
  .object({
    roleName: z
      .string()
      .min(1, '角色名称不能为空')
      .max(50, '角色名称最多50个字符')
      .optional()
      .openapi({ description: '角色名称', example: '运营人员' }),
    sort: z.number().int().min(0).optional().openapi({ description: '排序', example: 0 }),
    status: z
      .number()
      .int()
      .min(0)
      .max(1)
      .optional()
      .openapi({ description: '状态：0-禁用 1-正常', example: 1 }),
    remark: z.string().max(500, '备注最多500个字符').optional().openapi({ description: '备注' }),
  })
  .openapi('UpdateRoleInput')

/**
 * 更新角色菜单请求 Schema
 */
export const UpdateRoleMenusInputSchema = z
  .object({
    menuIds: z
      .array(z.number().int().positive())
      .openapi({ description: '菜单 ID 列表', example: [1, 2, 3, 4, 5] }),
  })
  .openapi('UpdateRoleMenusInput')

// ========== 分页响应 ==========

/**
 * 角色分页响应 Schema
 */
export const PaginatedRoleSchema = createPaginatedSchema(RoleSchema, 'PaginatedRole')

// ========== 类型导出 ==========

export type Role = z.infer<typeof RoleSchema>
export type PaginatedRole = z.infer<typeof PaginatedRoleSchema>
export type RoleQuery = z.infer<typeof RoleQuerySchema>
export type CreateRoleInput = z.infer<typeof CreateRoleInputSchema>
export type UpdateRoleInput = z.infer<typeof UpdateRoleInputSchema>
export type UpdateRoleMenusInput = z.infer<typeof UpdateRoleMenusInputSchema>
