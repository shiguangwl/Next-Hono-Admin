/**
 * 管理员服务
 */

import { and, count, eq, inArray, like, sql } from 'drizzle-orm'
import { db } from '@/db'
import { sysAdmin, sysAdminRole, sysRole } from '@/db/schema'
import { hashPassword } from '@/lib/auth'
import {
  BusinessError,
  ConflictError,
  ErrorCode,
  handleDatabaseError,
  NotFoundError,
} from '@/lib/errors'
import { SUPER_ADMIN_ID } from '@/lib/utils'
import { invalidatePermissionCache } from '@/server/utils/permission-cache'
import type { PaginatedResult, PaginationQuery } from '../../../utils/shared'
import { toAdminVo } from './admin.utils'
import type { AdminVo, CreateAdminInput, UpdateAdminInput } from './models'

/** 获取管理员列表（分页） */
export async function getAdminList(
  options: PaginationQuery = {}
): Promise<PaginatedResult<AdminVo>> {
  const { page = 1, pageSize = 20, keyword, status } = options
  const offset = (page - 1) * pageSize

  const conditions = []
  if (keyword) {
    conditions.push(like(sysAdmin.username, `%${keyword}%`))
  }
  if (status !== undefined) {
    conditions.push(eq(sysAdmin.status, status))
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined

  const [{ total }] = await db.select({ total: count() }).from(sysAdmin).where(whereClause)

  const admins = await db
    .select()
    .from(sysAdmin)
    .where(whereClause)
    .orderBy(sql`${sysAdmin.id} DESC`)
    .limit(pageSize)
    .offset(offset)

  // 获取管理员角色
  const adminIds = admins.map((a) => a.id)
  const adminRoles =
    adminIds.length > 0
      ? await db
          .select({
            adminId: sysAdminRole.adminId,
            roleId: sysRole.id,
            roleName: sysRole.roleName,
          })
          .from(sysAdminRole)
          .innerJoin(sysRole, eq(sysAdminRole.roleId, sysRole.id))
          .where(inArray(sysAdminRole.adminId, adminIds))
      : []

  // 组装结果
  const roleMap = new Map<number, { id: number; roleName: string }[]>()
  for (const ar of adminRoles) {
    if (!roleMap.has(ar.adminId)) {
      roleMap.set(ar.adminId, [])
    }
    roleMap.get(ar.adminId)!.push({ id: ar.roleId, roleName: ar.roleName })
  }

  const items = admins.map((admin) => ({
    ...toAdminVo(admin),
    roles: roleMap.get(admin.id) || [],
  }))

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

/** 获取管理员详情 */
export async function getAdminById(id: number): Promise<AdminVo> {
  const admin = await db
    .select()
    .from(sysAdmin)
    .where(eq(sysAdmin.id, id))
    .limit(1)
    .then((rows) => rows[0])

  if (!admin) {
    throw new NotFoundError('Admin', id)
  }

  const roles = await db
    .select({
      id: sysRole.id,
      roleName: sysRole.roleName,
    })
    .from(sysAdminRole)
    .innerJoin(sysRole, eq(sysAdminRole.roleId, sysRole.id))
    .where(eq(sysAdminRole.adminId, id))

  return {
    ...toAdminVo(admin),
    roles,
  }
}

/** 创建管理员 */
export async function createAdmin(input: CreateAdminInput): Promise<AdminVo> {
  const existing = await db
    .select({ id: sysAdmin.id })
    .from(sysAdmin)
    .where(eq(sysAdmin.username, input.username))
    .limit(1)
    .then((rows) => rows[0])

  if (existing) {
    throw new ConflictError(`用户名 ${input.username} 已存在`)
  }

  const hashedPassword = await hashPassword(input.password)

  try {
    const result = await db.transaction(async (tx) => {
      const [insertResult] = await tx.insert(sysAdmin).values({
        username: input.username,
        password: hashedPassword,
        nickname: input.nickname || '',
        status: input.status ?? 1,
        remark: input.remark,
      })

      const adminId = insertResult.insertId

      if (input.roleIds?.length) {
        await tx.insert(sysAdminRole).values(
          input.roleIds.map((roleId) => ({
            adminId: Number(adminId),
            roleId,
          }))
        )
      }

      return Number(adminId)
    })

    return getAdminById(result)
  } catch (err) {
    throw handleDatabaseError(err)
  }
}

/** 更新管理员 */
export async function updateAdmin(id: number, input: UpdateAdminInput): Promise<AdminVo> {
  const existing = await db
    .select({ id: sysAdmin.id })
    .from(sysAdmin)
    .where(eq(sysAdmin.id, id))
    .limit(1)
    .then((rows) => rows[0])

  if (!existing) {
    throw new NotFoundError('Admin', id)
  }

  await db
    .update(sysAdmin)
    .set({
      nickname: input.nickname,
      status: input.status,
      remark: input.remark,
    })
    .where(eq(sysAdmin.id, id))

  return getAdminById(id)
}

/** 删除管理员 */
export async function deleteAdmin(id: number, currentAdminId: number): Promise<void> {
  if (id === SUPER_ADMIN_ID) {
    throw new BusinessError('不能删除超级管理员账号', ErrorCode.CANNOT_DELETE_SUPER_ADMIN)
  }

  if (id === currentAdminId) {
    throw new BusinessError('不能删除自己的账号', ErrorCode.CANNOT_DELETE_SELF)
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

  await db.transaction(async (tx) => {
    await tx.delete(sysAdminRole).where(eq(sysAdminRole.adminId, id))
    await tx.delete(sysAdmin).where(eq(sysAdmin.id, id))
  })

  invalidatePermissionCache(id)
}

/** 重置密码 */
export async function resetPassword(id: number, newPassword: string): Promise<void> {
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

  await db.transaction(async (tx) => {
    await tx.delete(sysAdminRole).where(eq(sysAdminRole.adminId, id))

    if (roleIds.length > 0) {
      await tx.insert(sysAdminRole).values(roleIds.map((roleId) => ({ adminId: id, roleId })))
    }
  })

  invalidatePermissionCache(id)
}
