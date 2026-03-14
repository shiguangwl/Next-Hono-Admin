import { z } from 'zod'
import { createPaginatedSchema, RoleBriefSchema, SortablePaginationQuerySchema } from '../shared'

export const AdminSchema = z.object({
  id: z.number(),
  username: z.string(),
  nickname: z.string(),
  status: z.number(),
  loginIp: z.string().nullable(),
  loginTime: z.string().nullable(),
  remark: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  roles: z.array(RoleBriefSchema).optional(),
})

export const AdminQuerySchema = SortablePaginationQuerySchema.extend({
  keyword: z.string().optional(),
  status: z.coerce.number().int().min(0).max(1).optional(),
})

export const CreateAdminInputSchema = z.object({
  username: z
    .string()
    .min(2, '用户名至少2个字符')
    .max(50, '用户名最多50个字符')
    .regex(/^[a-zA-Z0-9_]+$/, '用户名只能包含字母、数字和下划线'),
  password: z.string().min(6, '密码至少6个字符').max(100, '密码最多100个字符'),
  nickname: z.string().max(50, '昵称最多50个字符').optional(),
  status: z.number().int().min(0).max(1).default(1),
  remark: z.string().max(500, '备注最多500个字符').optional(),
  roleIds: z.array(z.number().int().positive()).optional(),
})

export const UpdateAdminInputSchema = z.object({
  nickname: z.string().max(50, '昵称最多50个字符').optional(),
  status: z.number().int().min(0).max(1).optional(),
  remark: z.string().max(500, '备注最多500个字符').optional(),
})

export const ResetPasswordInputSchema = z.object({
  newPassword: z.string().min(6, '密码至少6个字符').max(100, '密码最多100个字符'),
})

export const UpdateAdminRolesInputSchema = z.object({
  roleIds: z.array(z.number().int().positive()),
})

export const PaginatedAdminSchema = createPaginatedSchema(AdminSchema)

export type Admin = z.infer<typeof AdminSchema>
export type PaginatedAdmin = z.infer<typeof PaginatedAdminSchema>
export type AdminQuery = z.infer<typeof AdminQuerySchema>
export type CreateAdminInput = z.infer<typeof CreateAdminInputSchema>
export type UpdateAdminInput = z.infer<typeof UpdateAdminInputSchema>
export type ResetPasswordInput = z.infer<typeof ResetPasswordInputSchema>
export type UpdateAdminRolesInput = z.infer<typeof UpdateAdminRolesInputSchema>
