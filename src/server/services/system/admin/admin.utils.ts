/**
 * 管理员 - 工具函数
 */

import type { sysAdmin } from '@/db/schema'
import { formatDateToLocal } from '@/lib/utils/date'
import type { AdminVo } from './models'

/** 转换为管理员 VO */
export function toAdminVo(admin: typeof sysAdmin.$inferSelect): AdminVo {
  return {
    id: admin.id,
    username: admin.username,
    nickname: admin.nickname,
    status: admin.status,
    loginIp: admin.loginIp,
    loginTime: formatDateToLocal(admin.loginTime),
    remark: admin.remark,
    createdAt: formatDateToLocal(admin.createdAt) ?? '',
    updatedAt: formatDateToLocal(admin.updatedAt) ?? '',
  }
}
