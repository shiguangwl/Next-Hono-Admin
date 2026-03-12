/**
 * 认证服务
 */

import { and, eq, inArray } from 'drizzle-orm'
import { db } from '@/db'
import { sysAdmin, sysAdminRole, sysMenu, sysRole, sysRoleMenu } from '@/db/schema'
import { verifyPassword } from '@/lib/auth'
import { BusinessError, ErrorCode, InternalServerError, UnauthorizedError } from '@/lib/errors'
import { SUPER_ADMIN_ID } from '@/lib/utils'
import { toAdminVo } from '../admin/admin.utils'
import type { MenuTreeNode } from '../menu'
import { buildMenuTree, toMenuTreeNode } from '../menu/menu.utils'
import type { LoginInput, LoginResultVo } from './models'
import { createAdminSession } from './session.service'

async function findAdminByUsername(username: string) {
  return db
    .select()
    .from(sysAdmin)
    .where(eq(sysAdmin.username, username))
    .limit(1)
    .then((rows) => rows[0])
}

async function findAdminById(adminId: number) {
  return db
    .select()
    .from(sysAdmin)
    .where(eq(sysAdmin.id, adminId))
    .limit(1)
    .then((rows) => rows[0])
}

function assertAdminIsActive(admin: typeof sysAdmin.$inferSelect | undefined): asserts admin {
  if (!admin) {
    throw new UnauthorizedError('用户名或密码错误')
  }

  if (admin.status === 0) {
    throw new BusinessError('账号已禁用', ErrorCode.ACCOUNT_DISABLED)
  }
}

async function updateAdminLoginMetadata(adminId: number, ip?: string): Promise<void> {
  await db
    .update(sysAdmin)
    .set({
      loginIp: ip || null,
      loginTime: new Date(),
    })
    .where(eq(sysAdmin.id, adminId))
}

async function getAllActiveMenus() {
  return db.select().from(sysMenu).where(eq(sysMenu.status, 1))
}

async function getGrantedMenus(adminId: number) {
  if (adminId === SUPER_ADMIN_ID) {
    return getAllActiveMenus()
  }

  const roleIds = await getAdminRoleIds(adminId)
  if (roleIds.length === 0) {
    return []
  }

  const roleMenus = await db
    .select({ menuId: sysRoleMenu.menuId })
    .from(sysRoleMenu)
    .where(inArray(sysRoleMenu.roleId, roleIds))

  if (roleMenus.length === 0) {
    return []
  }

  return db
    .select()
    .from(sysMenu)
    .where(
      and(
        inArray(sysMenu.id, [...new Set(roleMenus.map((item) => item.menuId))]),
        eq(sysMenu.status, 1)
      )
    )
}

/** 管理员登录 */
export async function login(input: LoginInput): Promise<LoginResultVo> {
  const admin = await findAdminByUsername(input.username)
  assertAdminIsActive(admin)

  const isValid = await verifyPassword(input.password, admin.password)
  if (!isValid) {
    throw new UnauthorizedError('用户名或密码错误')
  }

  await updateAdminLoginMetadata(admin.id, input.ip)

  const sessionToken = await createAdminSession({
    adminId: admin.id,
    ip: input.ip,
    userAgent: input.userAgent,
  })

  const [permissions, menus, updatedAdmin] = await Promise.all([
    getAdminPermissions(admin.id),
    getAdminMenuTree(admin.id),
    findAdminById(admin.id),
  ])

  if (!updatedAdmin || updatedAdmin.status === 0) {
    throw new InternalServerError('管理员信息更新异常')
  }

  return {
    sessionToken,
    admin: toAdminVo(updatedAdmin),
    permissions,
    menus,
  }
}

/** 获取管理员角色 ID 列表 */
export async function getAdminRoleIds(adminId: number): Promise<number[]> {
  const roles = await db
    .select({ roleId: sysAdminRole.roleId })
    .from(sysAdminRole)
    .innerJoin(sysRole, eq(sysAdminRole.roleId, sysRole.id))
    .where(and(eq(sysAdminRole.adminId, adminId), eq(sysRole.status, 1)))

  return roles.map((role) => role.roleId)
}

/** 获取管理员权限列表 */
export async function getAdminPermissions(adminId: number): Promise<string[]> {
  if (adminId === SUPER_ADMIN_ID) {
    return ['*']
  }

  return [
    ...new Set(
      (await getGrantedMenus(adminId)).flatMap((menu) => (menu.permission ? [menu.permission] : []))
    ),
  ]
}

/** 获取管理员菜单树 */
export async function getAdminMenuTree(adminId: number): Promise<MenuTreeNode[]> {
  const menus = (await getGrantedMenus(adminId)).filter(
    (menu) => menu.visible === 1 && (menu.menuType === 'D' || menu.menuType === 'M')
  )

  return buildMenuTree(menus.map(toMenuTreeNode))
}
