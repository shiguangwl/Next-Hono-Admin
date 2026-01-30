import { sql } from "drizzle-orm";
/**
 * 菜单权限表 Schema
 */
import {
  bigint,
  index,
  int,
  mysqlEnum,
  mysqlTable,
  tinyint,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";
import { localDatetime } from "../custom-types";

export const sysMenu = mysqlTable(
  "sys_menu",
  {
    id: bigint("id", { mode: "number", unsigned: true })
      .primaryKey()
      .autoincrement(),
    parentId: bigint("parent_id", { mode: "number", unsigned: true })
      .notNull()
      .default(0),
    menuType: mysqlEnum("menu_type", ["D", "M", "B"]).notNull().default("M"), // D-目录 M-菜单 B-按钮
    menuName: varchar("menu_name", { length: 50 }).notNull(),
    permission: varchar("permission", { length: 100 }),
    path: varchar("path", { length: 200 }),
    component: varchar("component", { length: 200 }),
    icon: varchar("icon", { length: 100 }),
    sort: int("sort", { unsigned: true }).notNull().default(0),
    visible: tinyint("visible", { unsigned: true }).notNull().default(1), // 0-隐藏 1-显示
    status: tinyint("status", { unsigned: true }).notNull().default(1), // 0-禁用 1-正常
    isExternal: tinyint("is_external", { unsigned: true }).notNull().default(0), // 0-否 1-是
    isCache: tinyint("is_cache", { unsigned: true }).notNull().default(1), // 0-不缓存 1-缓存
    remark: varchar("remark", { length: 500 }),
    createdAt: localDatetime("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: localDatetime("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
  },
  (table) => ({
    permissionIdx: uniqueIndex("uk_permission").on(table.permission),
    parentIdIdx: index("idx_parent_id").on(table.parentId),
    sortIdx: index("idx_sort").on(table.sort),
    statusIdx: index("idx_status").on(table.status),
    menuTypeIdx: index("idx_menu_type").on(table.menuType),
  })
);

export type SysMenu = typeof sysMenu.$inferSelect;
export type NewSysMenu = typeof sysMenu.$inferInsert;
