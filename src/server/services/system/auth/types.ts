import type { AdminVo } from '../admin/types'
import type { MenuTreeNode } from '../menu/types'

/** 登录输入 */
export interface LoginInput {
  username: string
  password: string
  ip?: string
  userAgent?: string | null
}

/** 登录结果 */
export interface LoginResultVo {
  sessionToken: string
  admin: AdminVo
  permissions: string[]
  menus: MenuTreeNode[]
}
