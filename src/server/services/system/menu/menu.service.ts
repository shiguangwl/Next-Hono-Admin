/**
 * 菜单服务
 */

import { and, asc, count, eq } from 'drizzle-orm'
import { db } from '@/db'
import { sysMenu, sysRoleMenu } from '@/db/schema'
import { BusinessError, ConflictError, ErrorCode, NotFoundError } from '@/lib/errors'
import { buildMenuTree, toMenuVo } from './menu.utils'
import type { CreateMenuInput, MenuQuery, MenuTreeNode, MenuVo, UpdateMenuInput } from './models'

/** 获取菜单列表（扁平） */
export async function getMenuList(options: MenuQuery = {}): Promise<MenuVo[]> {
  const { menuType, status } = options

  const conditions = []
  if (menuType) {
    conditions.push(eq(sysMenu.menuType, menuType))
  }
  if (status !== undefined) {
    conditions.push(eq(sysMenu.status, status))
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined

  const menus = await db.select().from(sysMenu).where(whereClause).orderBy(asc(sysMenu.sort))

  return menus.map(toMenuVo)
}

/** 获取菜单树 */
export async function getMenuTree(options: MenuQuery = {}): Promise<MenuTreeNode[]> {
  const menus = await getMenuList(options)
  return buildMenuTree(menus as MenuTreeNode[])
}

/** 获取菜单详情 */
export async function getMenuById(id: number): Promise<MenuVo> {
  const menu = await db
    .select()
    .from(sysMenu)
    .where(eq(sysMenu.id, id))
    .limit(1)
    .then((rows) => rows[0])

  if (!menu) {
    throw new NotFoundError('Menu', id)
  }

  return toMenuVo(menu)
}

/** 创建菜单 */
export async function createMenu(input: CreateMenuInput): Promise<MenuVo> {
  // 如果有权限标识，检查是否已存在
  if (input.permission) {
    const existing = await db
      .select({ id: sysMenu.id })
      .from(sysMenu)
      .where(eq(sysMenu.permission, input.permission))
      .limit(1)
      .then((rows) => rows[0])

    if (existing) {
      throw new ConflictError(`权限标识 ${input.permission} 已存在`)
    }
  }

  // 如果有父级，检查父级是否存在
  if (input.parentId && input.parentId !== 0) {
    const parent = await db
      .select({ id: sysMenu.id })
      .from(sysMenu)
      .where(eq(sysMenu.id, input.parentId))
      .limit(1)
      .then((rows) => rows[0])

    if (!parent) {
      throw new NotFoundError('Parent Menu', input.parentId)
    }
  }

  const [insertResult] = await db.insert(sysMenu).values({
    parentId: input.parentId ?? 0,
    menuType: input.menuType,
    menuName: input.menuName,
    permission: input.permission,
    path: input.path,
    component: input.component,
    icon: input.icon,
    sort: input.sort ?? 0,
    visible: input.visible ?? 1,
    status: input.status ?? 1,
    isExternal: input.isExternal ?? 0,
    isCache: input.isCache ?? 1,
    remark: input.remark,
  })

  return getMenuById(Number(insertResult.insertId))
}

/** 更新菜单 */
export async function updateMenu(id: number, input: UpdateMenuInput): Promise<MenuVo> {
  const existing = await db
    .select({ id: sysMenu.id })
    .from(sysMenu)
    .where(eq(sysMenu.id, id))
    .limit(1)
    .then((rows) => rows[0])

  if (!existing) {
    throw new NotFoundError('Menu', id)
  }

  // 如果更新权限标识，检查是否重复
  if (input.permission) {
    const other = await db
      .select({ id: sysMenu.id })
      .from(sysMenu)
      .where(eq(sysMenu.permission, input.permission))
      .limit(1)
      .then((rows) => rows[0])

    if (other && other.id !== id) {
      throw new ConflictError(`权限标识 ${input.permission} 已存在`)
    }
  }

  // 如果更新父级，检查有效性
  if (input.parentId !== undefined && input.parentId !== 0) {
    if (input.parentId === id) {
      throw new BusinessError('不能将菜单设置为自己的子菜单', ErrorCode.INVALID_PARENT)
    }

    const parent = await db
      .select({ id: sysMenu.id })
      .from(sysMenu)
      .where(eq(sysMenu.id, input.parentId))
      .limit(1)
      .then((rows) => rows[0])

    if (!parent) {
      throw new NotFoundError('Parent Menu', input.parentId)
    }
  }

  await db
    .update(sysMenu)
    .set({
      parentId: input.parentId,
      menuType: input.menuType,
      menuName: input.menuName,
      permission: input.permission,
      path: input.path,
      component: input.component,
      icon: input.icon,
      sort: input.sort,
      visible: input.visible,
      status: input.status,
      isExternal: input.isExternal,
      isCache: input.isCache,
      remark: input.remark,
    })
    .where(eq(sysMenu.id, id))

  return getMenuById(id)
}

/** 删除菜单 */
export async function deleteMenu(id: number): Promise<void> {
  const existing = await db
    .select({ id: sysMenu.id })
    .from(sysMenu)
    .where(eq(sysMenu.id, id))
    .limit(1)
    .then((rows) => rows[0])

  if (!existing) {
    throw new NotFoundError('Menu', id)
  }

  const childCount = await db
    .select({ count: count() })
    .from(sysMenu)
    .where(eq(sysMenu.parentId, id))
    .then((rows) => rows[0]?.count ?? 0)

  if (childCount > 0) {
    throw new BusinessError(
      `该菜单下有 ${childCount} 个子菜单，请先删除子菜单`,
      ErrorCode.HAS_CHILDREN
    )
  }

  await db.transaction(async (tx) => {
    await tx.delete(sysRoleMenu).where(eq(sysRoleMenu.menuId, id))
    await tx.delete(sysMenu).where(eq(sysMenu.id, id))
  })
}
