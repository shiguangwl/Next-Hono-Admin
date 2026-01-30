import { sql } from "drizzle-orm";
/**
 * 操作日志表 Schema
 */
import {
  bigint,
  index,
  mysqlTable,
  text,
  tinyint,
  varchar,
} from "drizzle-orm/mysql-core";
import { localDatetime } from "../custom-types";

export const sysOperationLog = mysqlTable(
  "sys_operation_log",
  {
    id: bigint("id", { mode: "number", unsigned: true })
      .primaryKey()
      .autoincrement(),
    adminId: bigint("admin_id", { mode: "number", unsigned: true }),
    adminName: varchar("admin_name", { length: 50 }),
    module: varchar("module", { length: 50 }),
    operation: varchar("operation", { length: 50 }),
    description: varchar("description", { length: 500 }),
    method: varchar("method", { length: 200 }),
    requestMethod: varchar("request_method", { length: 10 }),
    requestUrl: varchar("request_url", { length: 500 }),
    requestParams: text("request_params"),
    responseResult: text("response_result"),
    ip: varchar("ip", { length: 50 }),
    ipLocation: varchar("ip_location", { length: 100 }),
    userAgent: varchar("user_agent", { length: 500 }),
    executionTime: bigint("execution_time", { mode: "number", unsigned: true }),
    status: tinyint("status", { unsigned: true }).notNull().default(1), // 0-失败 1-成功
    errorMsg: text("error_msg"),
    createdAt: localDatetime("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    adminIdIdx: index("idx_admin_id").on(table.adminId),
    moduleIdx: index("idx_module").on(table.module),
    operationIdx: index("idx_operation").on(table.operation),
    statusIdx: index("idx_status").on(table.status),
    createdAtIdx: index("idx_created_at").on(table.createdAt),
  })
);

export type SysOperationLog = typeof sysOperationLog.$inferSelect;
export type NewSysOperationLog = typeof sysOperationLog.$inferInsert;
