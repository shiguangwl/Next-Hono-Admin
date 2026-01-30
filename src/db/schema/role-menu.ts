import { sql } from "drizzle-orm";
/**
 * 角色菜单关联表 Schema
 */
import { bigint, index, mysqlTable, uniqueIndex } from "drizzle-orm/mysql-core";
import { localDatetime } from "../custom-types";

export const sysRoleMenu = mysqlTable(
  "sys_role_menu",
  {
    id: bigint("id", { mode: "number", unsigned: true })
      .primaryKey()
      .autoincrement(),
    roleId: bigint("role_id", { mode: "number", unsigned: true }).notNull(),
    menuId: bigint("menu_id", { mode: "number", unsigned: true }).notNull(),
    createdAt: localDatetime("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    roleMenuIdx: uniqueIndex("uk_role_menu").on(table.roleId, table.menuId),
    roleIdIdx: index("idx_role_id").on(table.roleId),
    menuIdIdx: index("idx_menu_id").on(table.menuId),
  })
);

export type SysRoleMenu = typeof sysRoleMenu.$inferSelect;
export type NewSysRoleMenu = typeof sysRoleMenu.$inferInsert;
