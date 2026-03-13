import { z } from 'zod'
import { MenuTreeNodeSchema, RoleBriefSchema } from '../shared'

export const AdminInfoSchema = z.object({
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

export const LoginInputSchema = z.object({
  username: z.string().min(1, '用户名不能为空').max(50, '用户名最多50个字符'),
  password: z.string().min(1, '密码不能为空').max(100, '密码最多100个字符'),
})

export const LoginResultSchema = z.object({
  sessionToken: z.string(),
  admin: AdminInfoSchema,
  permissions: z.array(z.string()),
  menus: z.array(MenuTreeNodeSchema),
})

export const AuthInfoResultSchema = z.object({
  admin: AdminInfoSchema,
  permissions: z.array(z.string()),
  menus: z.array(MenuTreeNodeSchema),
})

export type LoginInput = z.infer<typeof LoginInputSchema>
export type LoginResult = z.infer<typeof LoginResultSchema>
export type AuthInfoResult = z.infer<typeof AuthInfoResultSchema>
export type AdminInfo = z.infer<typeof AdminInfoSchema>
