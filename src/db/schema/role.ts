import { sql } from "drizzle-orm";
/**
 * 角色表 Schema
 */
import {
  bigint,
  index,
  int,
  mysqlTable,
  tinyint,
  varchar,
} from "drizzle-orm/mysql-core";
import { localDatetime } from "../custom-types";

export const sysRole = mysqlTable(
  "sys_role",
  {
    id: bigint("id", { mode: "number", unsigned: true })
      .primaryKey()
      .autoincrement(),
    roleName: varchar("role_name", { length: 50 }).notNull(),
    sort: int("sort", { unsigned: true }).notNull().default(0),
    status: tinyint("status", { unsigned: true }).notNull().default(1), // 0-禁用 1-正常
    remark: varchar("remark", { length: 500 }),
    createdAt: localDatetime("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: localDatetime("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
  },
  (table) => ({
    statusIdx: index("idx_status").on(table.status),
    sortIdx: index("idx_sort").on(table.sort),
  })
);

export type SysRole = typeof sysRole.$inferSelect;
export type NewSysRole = typeof sysRole.$inferInsert;
