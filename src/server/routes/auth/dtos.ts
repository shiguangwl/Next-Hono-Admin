import { z } from 'zod'

export const RoleBriefSchema = z.object({
  id: z.number(),
  roleName: z.string(),
})

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

export const MenuTreeNodeSchema: z.ZodType<MenuTreeNode> = z.lazy(() =>
  z.object({
    id: z.number(),
    parentId: z.number(),
    menuType: z.enum(['D', 'M', 'B']),
    menuName: z.string(),
    permission: z.string().nullable(),
    path: z.string().nullable(),
    component: z.string().nullable(),
    icon: z.string().nullable(),
    sort: z.number(),
    visible: z.number(),
    status: z.number(),
    isExternal: z.number(),
    isCache: z.number(),
    remark: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
    children: z.array(z.lazy(() => MenuTreeNodeSchema)).optional(),
  })
)

interface MenuTreeNode {
  id: number
  parentId: number
  menuType: 'D' | 'M' | 'B'
  menuName: string
  permission: string | null
  path: string | null
  component: string | null
  icon: string | null
  sort: number
  visible: number
  status: number
  isExternal: number
  isCache: number
  remark: string | null
  createdAt: string
  updatedAt: string
  children?: MenuTreeNode[]
}

export const LoginInputSchema = z.object({
  username: z.string().min(1, '用户名不能为空').max(50, '用户名最多50个字符'),
  password: z.string().min(1, '密码不能为空').max(100, '密码最多100个字符'),
})

export const LoginResultSchema = z.object({
  token: z.string(),
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
