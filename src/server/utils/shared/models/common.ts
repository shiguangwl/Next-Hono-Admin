/**
 * 通用工具函数
 */

import { formatDateToLocal } from '@/lib/utils/date'

/** 日期转本地时间字符串 */
export function toLocalString(date: Date | null): string | null {
  return formatDateToLocal(date)
}

/**
 * @deprecated 使用 toLocalString 替代，toISOString 返回 UTC 时间会导致前端时区问题
 */
export function toISOString(date: Date | null): string | null {
  return date ? date.toISOString() : null
}
