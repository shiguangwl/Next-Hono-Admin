import { z } from 'zod'
import { MenuTreeNodeSchema, MenuTypeEnum } from '../shared'

export const MenuSchema = z.object({
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
})

export { MenuTreeNodeSchema }

export const MenuQuerySchema = z.object({
  menuType: MenuTypeEnum.optional(),
  status: z.coerce.number().int().min(0).max(1).optional(),
})

export const CreateMenuInputSchema = z
  .object({
    parentId: z.number().int().min(0).default(0),
    menuType: MenuTypeEnum,
    menuName: z.string().min(1, '菜单名称不能为空').max(50, '菜单名称最多50个字符'),
    permission: z.string().max(100, '权限标识最多100个字符').optional(),
    path: z.string().max(200, '路由路径最多200个字符').optional(),
    component: z.string().max(200, '组件路径最多200个字符').optional(),
    icon: z.string().max(100, '图标最多100个字符').optional(),
    sort: z.number().int().min(0).default(0),
    visible: z.number().int().min(0).max(1).default(1),
    status: z.number().int().min(0).max(1).default(1),
    isExternal: z.number().int().min(0).max(1).default(0),
    isCache: z.number().int().min(0).max(1).default(1),
    remark: z.string().max(500, '备注最多500个字符').optional(),
  })
  .refine((data) => !(data.menuType === 'D' && data.path), {
    message: '目录类型仅用于菜单分组，不能设置路由路径',
    path: ['path'],
  })

export const UpdateMenuInputSchema = z
  .object({
    parentId: z.number().int().min(0).optional(),
    menuType: MenuTypeEnum.optional(),
    menuName: z.string().min(1, '菜单名称不能为空').max(50, '菜单名称最多50个字符').optional(),
    permission: z.string().max(100, '权限标识最多100个字符').optional(),
    path: z.string().max(200, '路由路径最多200个字符').optional(),
    component: z.string().max(200, '组件路径最多200个字符').optional(),
    icon: z.string().max(100, '图标最多100个字符').optional(),
    sort: z.number().int().min(0).optional(),
    visible: z.number().int().min(0).max(1).optional(),
    status: z.number().int().min(0).max(1).optional(),
    isExternal: z.number().int().min(0).max(1).optional(),
    isCache: z.number().int().min(0).max(1).optional(),
    remark: z.string().max(500, '备注最多500个字符').optional(),
  })
  .refine((data) => !(data.menuType === 'D' && data.path), {
    message: '目录类型仅用于菜单分组，不能设置路由路径',
    path: ['path'],
  })

export type Menu = z.infer<typeof MenuSchema>
export type MenuTreeNodeDto = z.infer<typeof MenuTreeNodeSchema>
export type MenuQuery = z.infer<typeof MenuQuerySchema>
export type CreateMenuInput = z.infer<typeof CreateMenuInputSchema>
export type UpdateMenuInput = z.infer<typeof UpdateMenuInputSchema>
