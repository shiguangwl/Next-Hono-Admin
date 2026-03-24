import { sql } from 'drizzle-orm'
import { bigint, index, mysqlTable, tinyint, uniqueIndex, varchar } from 'drizzle-orm/mysql-core'
import { localDatetime } from '../custom-types'

export const storageFile = mysqlTable(
  'storage_file',
  {
    id: bigint('id', { mode: 'number', unsigned: true }).primaryKey().autoincrement(),
    fileKey: varchar('file_key', { length: 500 }).notNull(),
    fileName: varchar('file_name', { length: 255 }).notNull(),
    fileSize: bigint('file_size', { mode: 'number', unsigned: true }).notNull(),
    mimeType: varchar('mime_type', { length: 100 }).notNull().default('application/octet-stream'),
    isPublic: tinyint('is_public', { unsigned: true }).notNull().default(0),
    uploaderId: bigint('uploader_id', { mode: 'number', unsigned: true }),
    uploaderName: varchar('uploader_name', { length: 50 }),
    createdAt: localDatetime('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: localDatetime('updated_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
  },
  (table) => ({
    fileKeyIdx: uniqueIndex('uk_file_key').on(table.fileKey),
    uploaderIdIdx: index('idx_uploader_id').on(table.uploaderId),
    mimeTypeIdx: index('idx_mime_type').on(table.mimeType),
  })
)

export type StorageFile = typeof storageFile.$inferSelect
export type NewStorageFile = typeof storageFile.$inferInsert
