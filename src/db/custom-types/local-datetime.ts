/**
 * 本地时区 datetime 自定义类型
 *
 * @description 解决 Drizzle ORM 默认 datetime 的 UTC 转换问题
 *
 * 问题背景：
 * - Drizzle ORM v0.28.6+ 的 datetime({ mode: 'date' }) 会将 Date 对象转换为 UTC 字符串存储
 * - 这导致在非 UTC 时区环境下，存储的时间与预期不符
 *
 * 解决方案：
 * - 使用 customType 自定义序列化/反序列化逻辑
 * - 写入时：使用本地时区格式化 Date 对象（不做 UTC 转换）
 * - 读取时：将 MySQL datetime 字符串解析为本地时区 Date 对象
 *
 * @example
 * ```typescript
 * import { localDatetime } from '@/db/custom-types'
 *
 * const table = mysqlTable('example', {
 *   createdAt: localDatetime('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
 * })
 * ```
 */

import { customType } from 'drizzle-orm/mysql-core'

/**
 * 格式化 Date 对象为本地时间字符串
 * @param date - Date 对象
 * @returns MySQL datetime 格式字符串 (YYYY-MM-DD HH:mm:ss)
 */
function formatToLocalDatetimeString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

/**
 * 解析 MySQL datetime 字符串为 Date 对象
 *
 * @param value - MySQL datetime 字符串 (YYYY-MM-DD HH:mm:ss)
 * @returns Date 对象（本地时区）
 *
 * @remarks
 * 使用 replace(' ', 'T') 转换为 ISO 8601 格式，但不添加时区后缀
 * 这样 JavaScript 会按本地时区解析该字符串
 */
function parseFromMysqlDatetimeString(value: string): Date {
  // "2026-01-16 09:00:00" -> "2026-01-16T09:00:00"
  // 不添加 'Z' 后缀，让 JS 按本地时区解析
  return new Date(value.replace(' ', 'T'))
}

/**
 * 本地时区 datetime 类型
 *
 * @description
 * 替代 Drizzle 默认的 datetime() 类型，避免 UTC 转换问题
 *
 * 行为：
 * - 写入：Date 对象 → 本地时间字符串 → MySQL DATETIME
 * - 读取：MySQL DATETIME → 字符串 → 本地时区 Date 对象
 *
 * @param name - 数据库列名
 * @returns Drizzle 列定义
 */
export const localDatetime = customType<{
  data: Date
  driverData: string
}>({
  dataType() {
    return 'datetime'
  },

  toDriver(value: Date): string {
    return formatToLocalDatetimeString(value)
  },

  fromDriver(value: string): Date {
    return parseFromMysqlDatetimeString(value)
  },
})

