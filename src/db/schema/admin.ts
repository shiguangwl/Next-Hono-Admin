import { sql } from "drizzle-orm";
/**
 * 管理员表 Schema
 */
import {
  bigint,
  index,
  mysqlTable,
  tinyint,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";
import { localDatetime } from "../custom-types";

export const sysAdmin = mysqlTable(
  "sys_admin",
  {
    id: bigint("id", { mode: "number", unsigned: true })
      .primaryKey()
      .autoincrement(),
    username: varchar("username", { length: 50 }).notNull(),
    password: varchar("password", { length: 255 }).notNull(),
    nickname: varchar("nickname", { length: 50 }).notNull().default(""),
    status: tinyint("status", { unsigned: true }).notNull().default(1), // 0-禁用 1-正常
    loginIp: varchar("login_ip", { length: 50 }),
    loginTime: localDatetime("login_time"),
    remark: varchar("remark", { length: 500 }),
    createdAt: localDatetime("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: localDatetime("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
  },
  (table) => ({
    usernameIdx: uniqueIndex("uk_username").on(table.username),
    statusIdx: index("idx_status").on(table.status),
  })
);

export type SysAdmin = typeof sysAdmin.$inferSelect;
export type NewSysAdmin = typeof sysAdmin.$inferInsert;
