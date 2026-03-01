import { z } from 'zod'
import { createPaginatedSchema, PaginationQuerySchema } from '../shared'

export const RoleSchema = z.object({
  id: z.number(),
  roleName: z.string(),
  sort: z.number(),
  status: z.number(),
  remark: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  menuIds: z.array(z.number()).optional(),
})

export const RoleQuerySchema = PaginationQuerySchema.extend({
  keyword: z.string().optional(),
  status: z.coerce.number().int().min(0).max(1).optional(),
})

export const CreateRoleInputSchema = z.object({
  roleName: z.string().min(1, '角色名称不能为空').max(50, '角色名称最多50个字符'),
  sort: z.number().int().min(0).default(0),
  status: z.number().int().min(0).max(1).default(1),
  remark: z.string().max(500, '备注最多500个字符').optional(),
  menuIds: z.array(z.number().int().positive()).optional(),
})

export const UpdateRoleInputSchema = z.object({
  roleName: z.string().min(1, '角色名称不能为空').max(50, '角色名称最多50个字符').optional(),
  sort: z.number().int().min(0).optional(),
  status: z.number().int().min(0).max(1).optional(),
  remark: z.string().max(500, '备注最多500个字符').optional(),
})

export const UpdateRoleMenusInputSchema = z.object({
  menuIds: z.array(z.number().int().positive()),
})

export const PaginatedRoleSchema = createPaginatedSchema(RoleSchema)

export type Role = z.infer<typeof RoleSchema>
export type PaginatedRole = z.infer<typeof PaginatedRoleSchema>
export type RoleQuery = z.infer<typeof RoleQuerySchema>
export type CreateRoleInput = z.infer<typeof CreateRoleInputSchema>
export type UpdateRoleInput = z.infer<typeof UpdateRoleInputSchema>
export type UpdateRoleMenusInput = z.infer<typeof UpdateRoleMenusInputSchema>
