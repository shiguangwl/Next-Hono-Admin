'use client'

/**
 * 时间处理工具 - 客户端模块
 * @description 提供客户端专用的时间格式化工具
 */

import { parseDate } from './date'

/**
 * 格式化日期时间为 YYYY-MM-DD HH:mm
 * @param input - 日期输入（Date、ISO 字符串等）
 * @returns 格式化字符串或默认值
 */
export function formatDateTime(
  input: Date | string | null | undefined,
  defaultValue = '-'
): string {
  const date = parseDate(input)
  if (!date) return defaultValue

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}`
}

/**
 * 格式化日期为 YYYY-MM-DD
 * @param input - 日期输入
 * @returns 格式化字符串或默认值
 */
export function formatDate(input: Date | string | null | undefined, defaultValue = '-'): string {
  const date = parseDate(input)
  if (!date) return defaultValue

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

/**
 * 格式化时间为 HH:mm
 * @param input - 日期输入
 * @returns 格式化字符串或默认值
 */
export function formatTime(input: Date | string | null | undefined, defaultValue = '-'): string {
  const date = parseDate(input)
  if (!date) return defaultValue

  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${hours}:${minutes}`
}

/**
 * 格式化相对时间（如"3分钟前"、"2小时前"）
 * @param input - 日期输入
 * @returns 相对时间字符串
 */
export function formatRelative(input: Date | string | null | undefined): string {
  const date = parseDate(input)
  if (!date) return '-'

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)

  if (diffSeconds < 0) return '未来'
  if (diffSeconds < 60) return '刚刚'
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}分钟前`
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}小时前`
  if (diffSeconds < 604800) return `${Math.floor(diffSeconds / 86400)}天前`

  return formatDate(date)
}

/**
 * 格式化为完整日期时间（含秒）YYYY-MM-DD HH:mm:ss
 * @param input - 日期输入
 * @returns 格式化字符串或默认值
 */
export function formatDateTimeFull(
  input: Date | string | null | undefined,
  defaultValue = '-'
): string {
  const date = parseDate(input)
  if (!date) return defaultValue

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

/**
 * 检查日期是否为今天
 * @param input - 日期输入
 * @returns 是否为今天
 */
export function isToday(input: Date | string | null | undefined): boolean {
  const date = parseDate(input)
  if (!date) return false

  const today = new Date()
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  )
}

/**
 * 检查日期是否在指定天数内
 * @param input - 日期输入
 * @param days - 天数
 * @returns 是否在指定天数内
 */
export function isWithinDays(input: Date | string | null | undefined, days: number): boolean {
  const date = parseDate(input)
  if (!date) return false

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)

  return diffDays >= 0 && diffDays <= days
}
