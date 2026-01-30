/**
 * 角色 - 工具函数
 */

import type { sysRole } from '@/db/schema'
import { formatDateToLocal } from '@/lib/utils/date'
import type { RoleVo } from './models'

/** 转换为角色 VO */
export function toRoleVo(role: typeof sysRole.$inferSelect): RoleVo {
  return {
    id: role.id,
    roleName: role.roleName,
    sort: role.sort,
    status: role.status,
    remark: role.remark,
    createdAt: formatDateToLocal(role.createdAt) ?? '',
    updatedAt: formatDateToLocal(role.updatedAt) ?? '',
  }
}
