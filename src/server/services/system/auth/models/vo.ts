/**
 * 认证 - 输出模型
 */

import type { AdminVo } from '@/server/services/system/admin'
import type { MenuTreeNode } from '@/server/services/system/menu'

/** 登录结果 */
export interface LoginResultVo {
  token: string
  admin: AdminVo
  permissions: string[]
  menus: MenuTreeNode[]
}
