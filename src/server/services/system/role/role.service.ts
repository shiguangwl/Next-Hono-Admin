/**
 * 角色服务
 */

import { and, asc, count, eq, ne } from 'drizzle-orm'
import { db } from '@/db'
import { sysAdminRole, sysRole, sysRoleMenu } from '@/db/schema'
import { BusinessError, ConflictError, ErrorCode, NotFoundError } from '@/lib/errors'
import { invalidateAllPermissionCache } from '@/server/utils/permission-cache'
import type { PaginatedResult, PaginationQuery } from '../../../utils/shared'
import type { CreateRoleInput, RoleVo, UpdateRoleInput } from './models'
import { toRoleVo } from './role.utils'

/** 获取角色列表（分页） */
export async function getRoleList(options: PaginationQuery = {}): Promise<PaginatedResult<RoleVo>> {
  const { page = 1, pageSize = 20, keyword, status } = options
  const offset = (page - 1) * pageSize

  const conditions = []
  if (keyword) {
    conditions.push(eq(sysRole.roleName, keyword))
  }
  if (status !== undefined) {
    conditions.push(eq(sysRole.status, status))
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined

  const [{ total }] = await db.select({ total: count() }).from(sysRole).where(whereClause)

  const roles = await db
    .select()
    .from(sysRole)
    .where(whereClause)
    .orderBy(asc(sysRole.sort))
    .limit(pageSize)
    .offset(offset)

  return {
    items: roles.map(toRoleVo),
    total,
    page,
    pageSize,
    totalPages: total === 0 ? 0 : Math.ceil(total / pageSize),
  }
}

/** 获取所有角色（不分页） */
export async function getAllRoles(): Promise<RoleVo[]> {
  const roles = await db
    .select()
    .from(sysRole)
    .where(eq(sysRole.status, 1))
    .orderBy(asc(sysRole.sort))

  return roles.map(toRoleVo)
}

/** 获取角色详情 */
export async function getRoleById(id: number): Promise<RoleVo> {
  const role = await db
    .select()
    .from(sysRole)
    .where(eq(sysRole.id, id))
    .limit(1)
    .then((rows) => rows[0])

  if (!role) {
    throw new NotFoundError('Role', id)
  }

  const roleMenus = await db
    .select({ menuId: sysRoleMenu.menuId })
    .from(sysRoleMenu)
    .where(eq(sysRoleMenu.roleId, id))

  return {
    ...toRoleVo(role),
    menuIds: roleMenus.map((rm) => rm.menuId),
  }
}

/** 创建角色 */
export async function createRole(input: CreateRoleInput): Promise<RoleVo> {
  const existing = await db
    .select({ id: sysRole.id })
    .from(sysRole)
    .where(eq(sysRole.roleName, input.roleName))
    .limit(1)
    .then((rows) => rows[0])

  if (existing) {
    throw new ConflictError(`角色名 ${input.roleName} 已存在`)
  }

  const result = await db.transaction(async (tx) => {
    const [insertResult] = await tx.insert(sysRole).values({
      roleName: input.roleName,
      sort: input.sort ?? 0,
      status: input.status ?? 1,
      remark: input.remark,
    })

    const roleId = Number(insertResult.insertId)

    if (input.menuIds?.length) {
      await tx.insert(sysRoleMenu).values(input.menuIds.map((menuId) => ({ roleId, menuId })))
    }

    return roleId
  })

  return getRoleById(result)
}

/** 更新角色 */
export async function updateRole(id: number, input: UpdateRoleInput): Promise<RoleVo> {
  const existing = await db
    .select({ id: sysRole.id })
    .from(sysRole)
    .where(eq(sysRole.id, id))
    .limit(1)
    .then((rows) => rows[0])

  if (!existing) {
    throw new NotFoundError('Role', id)
  }

  if (input.roleName) {
    const duplicate = await db
      .select({ id: sysRole.id })
      .from(sysRole)
      .where(and(eq(sysRole.roleName, input.roleName), ne(sysRole.id, id)))
      .limit(1)
      .then((rows) => rows[0])

    if (duplicate) {
      throw new ConflictError(`角色名 ${input.roleName} 已存在`)
    }
  }

  await db
    .update(sysRole)
    .set({
      roleName: input.roleName,
      sort: input.sort,
      status: input.status,
      remark: input.remark,
    })
    .where(eq(sysRole.id, id))

  return getRoleById(id)
}

/** 删除角色 */
export async function deleteRole(id: number): Promise<void> {
  const existing = await db
    .select({ id: sysRole.id })
    .from(sysRole)
    .where(eq(sysRole.id, id))
    .limit(1)
    .then((rows) => rows[0])

  if (!existing) {
    throw new NotFoundError('Role', id)
  }

  const adminCount = await db
    .select({ count: count() })
    .from(sysAdminRole)
    .where(eq(sysAdminRole.roleId, id))
    .then((rows) => rows[0]?.count ?? 0)

  if (adminCount > 0) {
    throw new BusinessError(
      `该角色已分配给 ${adminCount} 个管理员，请先解除关联`,
      ErrorCode.ROLE_IN_USE
    )
  }

  await db.transaction(async (tx) => {
    await tx.delete(sysRoleMenu).where(eq(sysRoleMenu.roleId, id))
    await tx.delete(sysRole).where(eq(sysRole.id, id))
  })
}

/** 更新角色菜单权限 */
export async function updateRoleMenus(id: number, menuIds: number[]): Promise<void> {
  const existing = await db
    .select({ id: sysRole.id })
    .from(sysRole)
    .where(eq(sysRole.id, id))
    .limit(1)
    .then((rows) => rows[0])

  if (!existing) {
    throw new NotFoundError('Role', id)
  }

  await db.transaction(async (tx) => {
    await tx.delete(sysRoleMenu).where(eq(sysRoleMenu.roleId, id))

    if (menuIds.length > 0) {
      await tx.insert(sysRoleMenu).values(menuIds.map((menuId) => ({ roleId: id, menuId })))
    }
  })

  invalidateAllPermissionCache()
}

/** 获取角色的菜单 ID 列表 */
export async function getRoleMenuIds(roleId: number): Promise<number[]> {
  const roleMenus = await db
    .select({ menuId: sysRoleMenu.menuId })
    .from(sysRoleMenu)
    .where(eq(sysRoleMenu.roleId, roleId))

  return roleMenus.map((rm) => rm.menuId)
}
