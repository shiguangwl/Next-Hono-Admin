/**
 * 管理员路由 DTO 定义
 * @description 管理员 CRUD 的请求/响应 Schema
 */

import { z } from '@hono/zod-openapi'
import { createPaginatedSchema, PaginationQuerySchema } from '../shared'

// ========== 基础 Schema ==========

/**
 * 角色简要信息 Schema
 */
export const RoleBriefSchema = z.object({
  id: z.number().openapi({ description: '角色 ID', example: 1 }),
  roleName: z.string().openapi({ description: '角色名称', example: '超级管理员' }),
})

/**
 * 管理员 Schema
 */
export const AdminSchema = z
  .object({
    id: z.number().openapi({ description: '管理员 ID', example: 1 }),
    username: z.string().openapi({ description: '用户名', example: 'admin' }),
    nickname: z.string().openapi({ description: '昵称', example: '系统管理员' }),
    status: z.number().openapi({ description: '状态：0-禁用 1-正常', example: 1 }),
    loginIp: z.string().nullable().openapi({ description: '最后登录 IP', example: '127.0.0.1' }),
    loginTime: z.string().nullable().openapi({
      description: '最后登录时间',
      example: '2024-01-01T00:00:00.000Z',
    }),
    remark: z.string().nullable().openapi({ description: '备注' }),
    createdAt: z.string().openapi({
      description: '创建时间',
      example: '2024-01-01T00:00:00.000Z',
    }),
    updatedAt: z.string().openapi({
      description: '更新时间',
      example: '2024-01-01T00:00:00.000Z',
    }),
    roles: z.array(RoleBriefSchema).optional().openapi({ description: '角色列表' }),
  })
  .openapi('Admin')

// ========== 查询参数 ==========

/**
 * 管理员列表查询参数 Schema
 */
export const AdminQuerySchema = PaginationQuerySchema.extend({
  keyword: z.string().optional().openapi({ description: '搜索关键词（用户名）', example: 'admin' }),
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
 * 创建管理员请求 Schema
 */
export const CreateAdminInputSchema = z
  .object({
    username: z
      .string()
      .min(2, '用户名至少2个字符')
      .max(50, '用户名最多50个字符')
      .regex(/^[a-zA-Z0-9_]+$/, '用户名只能包含字母、数字和下划线')
      .openapi({ description: '用户名', example: 'newadmin' }),
    password: z
      .string()
      .min(6, '密码至少6个字符')
      .max(100, '密码最多100个字符')
      .openapi({ description: '密码', example: 'password123' }),
    nickname: z
      .string()
      .max(50, '昵称最多50个字符')
      .optional()
      .openapi({ description: '昵称', example: '新管理员' }),
    status: z
      .number()
      .int()
      .min(0)
      .max(1)
      .default(1)
      .openapi({ description: '状态：0-禁用 1-正常', example: 1 }),
    remark: z.string().max(500, '备注最多500个字符').optional().openapi({ description: '备注' }),
    roleIds: z
      .array(z.number().int().positive())
      .optional()
      .openapi({ description: '角色 ID 列表', example: [2, 3] }),
  })
  .openapi('CreateAdminInput')

/**
 * 更新管理员请求 Schema
 */
export const UpdateAdminInputSchema = z
  .object({
    nickname: z
      .string()
      .max(50, '昵称最多50个字符')
      .optional()
      .openapi({ description: '昵称', example: '更新后的昵称' }),
    status: z
      .number()
      .int()
      .min(0)
      .max(1)
      .optional()
      .openapi({ description: '状态：0-禁用 1-正常', example: 1 }),
    remark: z.string().max(500, '备注最多500个字符').optional().openapi({ description: '备注' }),
  })
  .openapi('UpdateAdminInput')

/**
 * 重置密码请求 Schema
 */
export const ResetPasswordInputSchema = z
  .object({
    newPassword: z
      .string()
      .min(6, '密码至少6个字符')
      .max(100, '密码最多100个字符')
      .openapi({ description: '新密码', example: 'newpassword123' }),
  })
  .openapi('ResetPasswordInput')

/**
 * 更新管理员角色请求 Schema
 */
export const UpdateAdminRolesInputSchema = z
  .object({
    roleIds: z
      .array(z.number().int().positive())
      .openapi({ description: '角色 ID 列表', example: [1, 2] }),
  })
  .openapi('UpdateAdminRolesInput')

// ========== 分页响应 ==========

/**
 * 管理员分页响应 Schema
 */
export const PaginatedAdminSchema = createPaginatedSchema(AdminSchema, 'PaginatedAdmin')

// ========== 类型导出 ==========

export type Admin = z.infer<typeof AdminSchema>
export type PaginatedAdmin = z.infer<typeof PaginatedAdminSchema>
export type AdminQuery = z.infer<typeof AdminQuerySchema>
export type CreateAdminInput = z.infer<typeof CreateAdminInputSchema>
export type UpdateAdminInput = z.infer<typeof UpdateAdminInputSchema>
export type ResetPasswordInput = z.infer<typeof ResetPasswordInputSchema>
export type UpdateAdminRolesInput = z.infer<typeof UpdateAdminRolesInputSchema>
