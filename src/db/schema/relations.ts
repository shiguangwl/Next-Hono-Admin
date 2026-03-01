/**
 * Drizzle Relations 定义
 * 定义表之间的关联关系
 */
import { relations } from 'drizzle-orm'
import { sysAdmin } from './admin'
import { sysAdminRole } from './admin-role'
import { sysMenu } from './menu'
import { sysRole } from './role'
import { sysRoleMenu } from './role-menu'

// 管理员关联
export const sysAdminRelations = relations(sysAdmin, ({ many }) => ({
  adminRoles: many(sysAdminRole),
}))

// 角色关联
export const sysRoleRelations = relations(sysRole, ({ many }) => ({
  adminRoles: many(sysAdminRole),
  roleMenus: many(sysRoleMenu),
}))

// 菜单关联
export const sysMenuRelations = relations(sysMenu, ({ many }) => ({
  roleMenus: many(sysRoleMenu),
}))

// 管理员角色关联表关系
export const sysAdminRoleRelations = relations(sysAdminRole, ({ one }) => ({
  admin: one(sysAdmin, {
    fields: [sysAdminRole.adminId],
    references: [sysAdmin.id],
  }),
  role: one(sysRole, {
    fields: [sysAdminRole.roleId],
    references: [sysRole.id],
  }),
}))

// 角色菜单关联表关系
export const sysRoleMenuRelations = relations(sysRoleMenu, ({ one }) => ({
  role: one(sysRole, {
    fields: [sysRoleMenu.roleId],
    references: [sysRole.id],
  }),
  menu: one(sysMenu, {
    fields: [sysRoleMenu.menuId],
    references: [sysMenu.id],
  }),
}))
