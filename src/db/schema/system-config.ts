import { sql } from "drizzle-orm";
import {
  bigint,
  index,
  mysqlTable,
  text,
  tinyint,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";
import { localDatetime } from "../custom-types";

export const sysConfig = mysqlTable(
  "sys_config",
  {
    id: bigint("id", { mode: "number", unsigned: true })
      .primaryKey()
      .autoincrement(),
    configKey: varchar("config_key", { length: 100 }).notNull(),
    configValue: text("config_value"),
    configType: varchar("config_type", { length: 20 })
      .notNull()
      .default("string"),
    configGroup: varchar("config_group", { length: 50 })
      .notNull()
      .default("general"),
    configName: varchar("config_name", { length: 100 }).notNull(),
    remark: varchar("remark", { length: 255 }),
    isSystem: tinyint("is_system", { unsigned: true }).notNull().default(0),
    status: tinyint("status", { unsigned: true }).notNull().default(1),
    createdAt: localDatetime("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: localDatetime("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
  },
  (table) => ({
    configKeyIdx: uniqueIndex("uk_config_key").on(table.configKey),
    groupIdx: index("idx_group").on(table.configGroup),
  })
);

export type SysConfig = typeof sysConfig.$inferSelect;
export type NewSysConfig = typeof sysConfig.$inferInsert;
