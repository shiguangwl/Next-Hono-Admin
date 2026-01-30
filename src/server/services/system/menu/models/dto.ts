/**
 * 菜单 - 输入模型
 */

export type MenuType = 'D' | 'M' | 'B'

/** 创建菜单输入 */
export interface CreateMenuInput {
  parentId?: number
  menuType: MenuType
  menuName: string
  permission?: string
  path?: string
  component?: string
  icon?: string
  sort?: number
  visible?: number
  status?: number
  isExternal?: number
  isCache?: number
  remark?: string
}

/** 更新菜单输入 */
export interface UpdateMenuInput {
  parentId?: number
  menuType?: MenuType
  menuName?: string
  permission?: string
  path?: string
  component?: string
  icon?: string
  sort?: number
  visible?: number
  status?: number
  isExternal?: number
  isCache?: number
  remark?: string
}

/** 菜单查询条件 */
export interface MenuQuery {
  menuType?: MenuType
  status?: number
}
