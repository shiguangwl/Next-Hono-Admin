/**
 * 认证服务
 */

import { and, eq, inArray, isNotNull } from 'drizzle-orm'
import { db } from '@/db'
import { sysAdmin, sysAdminRole, sysMenu, sysRoleMenu } from '@/db/schema'
import { type AdminPayload, signToken, verifyPassword } from '@/lib/auth'
import { BusinessError, ErrorCode, UnauthorizedError } from '@/lib/errors'
import { SUPER_ADMIN_ID } from '@/lib/utils'
import { toAdminVo } from '../admin/admin.utils'
import type { MenuTreeNode } from '../menu'
import { buildMenuTree, toMenuTreeNode } from '../menu/menu.utils'
import type { LoginInput, LoginResultVo } from './models'

/** 管理员登录 */
export async function login(input: LoginInput): Promise<LoginResultVo> {
  // 1. 查询管理员
  const admin = await db
    .select()
    .from(sysAdmin)
    .where(eq(sysAdmin.username, input.username))
    .limit(1)
    .then((rows) => rows[0])

  if (!admin) {
    throw new UnauthorizedError('用户名或密码错误')
  }

  // 2. 验证密码
  const isValid = await verifyPassword(input.password, admin.password)
  if (!isValid) {
    throw new UnauthorizedError('用户名或密码错误')
  }

  // 3. 检查账号状态
  if (admin.status === 0) {
    throw new BusinessError('账号已禁用', ErrorCode.ACCOUNT_DISABLED)
  }

  // 4. 更新登录信息
  await db
    .update(sysAdmin)
    .set({
      loginIp: input.ip || null,
      loginTime: new Date(),
    })
    .where(eq(sysAdmin.id, admin.id))

  // 5. 生成 JWT Token
  const payload: AdminPayload = {
    adminId: admin.id,
    username: admin.username,
  }
  const token = signToken(payload)

  // 6. 获取权限和菜单
  const permissions = await getAdminPermissions(admin.id)
  const menus = await getAdminMenuTree(admin.id)

  // 7. 获取更新后的管理员信息
  const updatedAdmin = await db
    .select()
    .from(sysAdmin)
    .where(eq(sysAdmin.id, admin.id))
    .limit(1)
    .then((rows) => rows[0])

  return {
    token,
    admin: toAdminVo(updatedAdmin!),
    permissions,
    menus,
  }
}

/** 获取管理员角色 ID 列表 */
export async function getAdminRoleIds(adminId: number): Promise<number[]> {
  const adminRoles = await db
    .select({ roleId: sysAdminRole.roleId })
    .from(sysAdminRole)
    .where(eq(sysAdminRole.adminId, adminId))

  return adminRoles.map((ar) => ar.roleId)
}

/** 获取管理员权限列表 */
export async function getAdminPermissions(adminId: number): Promise<string[]> {
  if (adminId === SUPER_ADMIN_ID) {
    const menus = await db
      .select({ permission: sysMenu.permission })
      .from(sysMenu)
      .where(and(isNotNull(sysMenu.permission), eq(sysMenu.status, 1)))

    const permissions = new Set<string>()
    for (const menu of menus) {
      if (menu.permission) {
        permissions.add(menu.permission)
      }
    }

    return ['*', ...Array.from(permissions)]
  }

  // 1. 获取管理员的角色 ID
  const roleIds = await getAdminRoleIds(adminId)

  if (roleIds.length === 0) {
    return []
  }

  // 2. 查询角色关联的菜单 ID
  const roleMenus = await db
    .select({ menuId: sysRoleMenu.menuId })
    .from(sysRoleMenu)
    .where(inArray(sysRoleMenu.roleId, roleIds))

  if (roleMenus.length === 0) {
    return []
  }

  const menuIds = roleMenus.map((rm) => rm.menuId)

  // 3. 查询菜单的权限标识
  const menus = await db
    .select({ permission: sysMenu.permission })
    .from(sysMenu)
    .where(and(inArray(sysMenu.id, menuIds), isNotNull(sysMenu.permission), eq(sysMenu.status, 1)))

  // 4. 去重返回
  const permissions = new Set<string>()
  for (const menu of menus) {
    if (menu.permission) {
      permissions.add(menu.permission)
    }
  }

  return Array.from(permissions)
}

/** 获取管理员菜单树 */
export async function getAdminMenuTree(adminId: number): Promise<MenuTreeNode[]> {
  if (adminId === SUPER_ADMIN_ID) {
    const menus = await db
      .select()
      .from(sysMenu)
      .where(
        and(inArray(sysMenu.menuType, ['D', 'M']), eq(sysMenu.status, 1), eq(sysMenu.visible, 1))
      )

    const menuNodes = menus.map(toMenuTreeNode)
    return buildMenuTree(menuNodes)
  }

  // 1. 获取管理员的角色 ID
  const roleIds = await getAdminRoleIds(adminId)

  if (roleIds.length === 0) {
    return []
  }

  // 2. 查询角色关联的菜单 ID
  const roleMenus = await db
    .select({ menuId: sysRoleMenu.menuId })
    .from(sysRoleMenu)
    .where(inArray(sysRoleMenu.roleId, roleIds))

  if (roleMenus.length === 0) {
    return []
  }

  const menuIds = [...new Set(roleMenus.map((rm) => rm.menuId))]

  // 3. 查询菜单详情（只取目录和菜单）
  const menus = await db
    .select()
    .from(sysMenu)
    .where(
      and(
        inArray(sysMenu.id, menuIds),
        inArray(sysMenu.menuType, ['D', 'M']),
        eq(sysMenu.status, 1),
        eq(sysMenu.visible, 1)
      )
    )

  // 4. 转换为树节点并构建树
  const menuNodes = menus.map(toMenuTreeNode)
  return buildMenuTree(menuNodes)
}
