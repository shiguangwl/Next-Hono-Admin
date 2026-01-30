import { sql } from "drizzle-orm";
/**
 * 管理员角色关联表 Schema
 */
import { bigint, index, mysqlTable, uniqueIndex } from "drizzle-orm/mysql-core";
import { localDatetime } from "../custom-types";

export const sysAdminRole = mysqlTable(
  "sys_admin_role",
  {
    id: bigint("id", { mode: "number", unsigned: true })
      .primaryKey()
      .autoincrement(),
    adminId: bigint("admin_id", { mode: "number", unsigned: true }).notNull(),
    roleId: bigint("role_id", { mode: "number", unsigned: true }).notNull(),
    createdAt: localDatetime("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    adminRoleIdx: uniqueIndex("uk_admin_role").on(table.adminId, table.roleId),
    adminIdIdx: index("idx_admin_id").on(table.adminId),
    roleIdIdx: index("idx_role_id").on(table.roleId),
  })
);

export type SysAdminRole = typeof sysAdminRole.$inferSelect;
export type NewSysAdminRole = typeof sysAdminRole.$inferInsert;
