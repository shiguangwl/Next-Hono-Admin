/**
 * 菜单路由实现
 */

import { OpenAPIHono } from '@hono/zod-openapi'
import type { Env } from '@/server/context'
import { auditLog } from '@/server/middleware/audit-log'
import { requireAuth } from '@/server/middleware/jwt-auth'
import { requirePermission } from '@/server/middleware/rbac'
import {
  createMenu,
  deleteMenu,
  getMenuById,
  getMenuList,
  getMenuTree,
  updateMenu,
} from '@/server/services'
import {
  createMenuRoute,
  deleteMenuRoute,
  getMenuRoute,
  getMenuTreeRoute,
  listMenusRoute,
  updateMenuRoute,
} from './defs'

const menus = new OpenAPIHono<Env>()

// 所有路由需要认证
menus.use('/*', requireAuth)

// ========== LIST ==========

menus.use('/', requirePermission('system:menu:list'))
menus.openapi(listMenusRoute, async (c) => {
  const query = c.req.valid('query')
  const result = await getMenuList({
    menuType: query.menuType,
    status: query.status,
  })
  return c.json({ code: 'OK', data: result }, 200)
})

// ========== TREE ==========

menus.use('/tree', requirePermission('system:menu:list'))
menus.openapi(getMenuTreeRoute, async (c) => {
  const query = c.req.valid('query')
  const result = await getMenuTree({
    menuType: query.menuType,
    status: query.status,
  })
  return c.json({ code: 'OK', data: result }, 200)
})

// ========== CREATE ==========

menus.use(
  createMenuRoute.path,
  requirePermission('system:menu:create'),
  auditLog({ module: '菜单管理', operation: '创建', description: '创建菜单' })
)
menus.openapi(createMenuRoute, async (c) => {
  const body = c.req.valid('json')
  const menu = await createMenu(body)
  return c.json({ code: 'OK', data: menu }, 201)
})

// ========== DETAIL ==========

menus.use('/:id', requirePermission('system:menu:query'))
menus.openapi(getMenuRoute, async (c) => {
  const { id } = c.req.valid('param')
  const menu = await getMenuById(id)
  return c.json({ code: 'OK', data: menu }, 200)
})

// ========== UPDATE ==========

menus.use(
  updateMenuRoute.path,
  requirePermission('system:menu:update'),
  auditLog({ module: '菜单管理', operation: '更新', description: '更新菜单信息' })
)
menus.openapi(updateMenuRoute, async (c) => {
  const { id } = c.req.valid('param')
  const body = c.req.valid('json')
  const menu = await updateMenu(id, body)
  return c.json({ code: 'OK', data: menu }, 200)
})

// ========== DELETE ==========

menus.use(
  deleteMenuRoute.path,
  requirePermission('system:menu:delete'),
  auditLog({ module: '菜单管理', operation: '删除', description: '删除菜单' })
)
menus.openapi(deleteMenuRoute, async (c) => {
  const { id } = c.req.valid('param')
  await deleteMenu(id)
  return c.json({ code: 'OK', message: '删除成功', data: null }, 200)
})

export { menus }
