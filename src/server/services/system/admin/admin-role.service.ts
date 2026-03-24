/**
 * 管理员-角色关联操作
 */

import { eq, inArray } from 'drizzle-orm'
import { db } from '@/db'
import { sysAdmin, sysAdminRole, sysRole } from '@/db/schema'
import { hashPassword } from '@/lib/auth'
import { SUPER_ADMIN_ID } from '@/lib/constants'
import { BusinessError, ErrorCode, handleDatabaseError, NotFoundError } from '@/lib/errors'
import { invalidatePermissionCache } from '@/server/utils/permission-cache'
import { revokeSessionsByAdminId } from '../auth/session.service'

/** 重置密码 */
export async function resetPassword(id: number, newPassword: string): Promise<void> {
  if (id === SUPER_ADMIN_ID) {
    throw new BusinessError('不能重置超级管理员密码', ErrorCode.CANNOT_MODIFY_SUPER_ADMIN)
  }

  const existing = await db
    .select({ id: sysAdmin.id })
    .from(sysAdmin)
    .where(eq(sysAdmin.id, id))
    .limit(1)
    .then((rows) => rows[0])

  if (!existing) {
    throw new NotFoundError('Admin', id)
  }

  const hashedPassword = await hashPassword(newPassword)

  await db.update(sysAdmin).set({ password: hashedPassword }).where(eq(sysAdmin.id, id))
  await revokeSessionsByAdminId(id)
}

/** 更新管理员角色 */
export async function updateAdminRoles(id: number, roleIds: number[]): Promise<void> {
  if (id === SUPER_ADMIN_ID) {
    throw new BusinessError('不能修改超级管理员的角色', ErrorCode.CANNOT_MODIFY_SUPER_ADMIN_ROLES)
  }

  const existing = await db
    .select({ id: sysAdmin.id })
    .from(sysAdmin)
    .where(eq(sysAdmin.id, id))
    .limit(1)
    .then((rows) => rows[0])

  if (!existing) {
    throw new NotFoundError('Admin', id)
  }

  const uniqueRoleIds = [...new Set(roleIds)]

  try {
    await db.transaction(async (tx) => {
      // WHY: 在事务内校验 roleId 存在性，防止 TOCTOU
      if (uniqueRoleIds.length > 0) {
        const existingRoles = await tx
          .select({ id: sysRole.id })
          .from(sysRole)
          .where(inArray(sysRole.id, uniqueRoleIds))

        if (existingRoles.length !== uniqueRoleIds.length) {
          const foundIds = new Set(existingRoles.map((r) => r.id))
          const missing = uniqueRoleIds.filter((rid) => !foundIds.has(rid))
          throw new NotFoundError('Role', missing[0])
        }
      }

      await tx.delete(sysAdminRole).where(eq(sysAdminRole.adminId, id))

      if (uniqueRoleIds.length > 0) {
        await tx
          .insert(sysAdminRole)
          .values(uniqueRoleIds.map((roleId) => ({ adminId: id, roleId })))
      }
    })
  } catch (err) {
    throw handleDatabaseError(err)
  }

  invalidatePermissionCache(id)
}
