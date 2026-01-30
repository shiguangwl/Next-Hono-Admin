/**
 * 菜单 - 输出模型
 */

import type { MenuType } from './dto'

/** 菜单 VO */
export interface MenuVo {
  id: number
  parentId: number
  menuType: MenuType
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
}

/** 菜单树节点 */
export interface MenuTreeNode extends MenuVo {
  children?: MenuTreeNode[]
}
