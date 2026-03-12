import { sql } from 'drizzle-orm'
import { bigint, index, mysqlTable, uniqueIndex, varchar } from 'drizzle-orm/mysql-core'
import { localDatetime } from '../custom-types'

export const sysAdminSession = mysqlTable(
  'sys_admin_session',
  {
    id: bigint('id', { mode: 'number', unsigned: true }).primaryKey().autoincrement(),
    adminId: bigint('admin_id', { mode: 'number', unsigned: true }).notNull(),
    tokenHash: varchar('token_hash', { length: 64 }).notNull(),
    userAgent: varchar('user_agent', { length: 255 }),
    loginIp: varchar('login_ip', { length: 50 }),
    expiresAt: localDatetime('expires_at').notNull(),
    revokedAt: localDatetime('revoked_at'),
    createdAt: localDatetime('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: localDatetime('updated_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
  },
  (table) => ({
    adminIdIdx: index('idx_admin_session_admin_id').on(table.adminId),
    expiresAtIdx: index('idx_admin_session_expires_at').on(table.expiresAt),
    revokedAtIdx: index('idx_admin_session_revoked_at').on(table.revokedAt),
    tokenHashIdx: uniqueIndex('uk_admin_session_token_hash').on(table.tokenHash),
  })
)

export type SysAdminSession = typeof sysAdminSession.$inferSelect
export type NewSysAdminSession = typeof sysAdminSession.$inferInsert
