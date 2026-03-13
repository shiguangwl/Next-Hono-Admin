import { z } from 'zod'

export const RoleBriefSchema = z.object({
  id: z.number(),
  roleName: z.string(),
})

export const MenuTypeEnum = z.enum(['D', 'M', 'B'])

export interface MenuTreeNode {
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

export const MenuTreeNodeSchema: z.ZodType<MenuTreeNode> = z.lazy(() =>
  z.object({
    id: z.number(),
    parentId: z.number(),
    menuType: MenuTypeEnum,
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

export type RoleBrief = z.infer<typeof RoleBriefSchema>
export type MenuTreeNodeDto = z.infer<typeof MenuTreeNodeSchema>
