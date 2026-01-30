/**
 * 时间处理工具 - 通用模块
 * @description 提供跨平台（前后端）的时间处理工具函数
 */

/**
 * 安全地解析日期
 * @param input - 日期输入（Date、字符串、时间戳）
 * @returns Date 对象或 null
 */
export function parseDate(
  input: Date | string | number | null | undefined
): Date | null {
  if (!input) return null;

  if (input instanceof Date) {
    return isValidDate(input) ? input : null;
  }

  const date = new Date(input);
  return isValidDate(date) ? date : null;
}

/**
 * 验证日期是否有效
 * @param date - Date 对象
 * @returns 是否为有效日期
 */
export function isValidDate(date: Date): boolean {
  return date instanceof Date && !Number.isNaN(date.getTime());
}

/**
 * 将时间向下取整到指定分钟数
 * @param date - 原始时间
 * @param minutes - 分钟间隔（如 10、15、30）
 * @returns 取整后的时间
 * @example
 * floorToMinutes(new Date('2024-01-01 09:37:45'), 10) // => 2024-01-01 09:30:00
 */
export function floorToMinutes(date: Date, minutes: number): Date {
  if (!isValidDate(date)) {
    throw new Error("Invalid date provided to floorToMinutes");
  }

  const result = new Date(date);
  const currentMinutes = result.getMinutes();
  result.setMinutes(Math.floor(currentMinutes / minutes) * minutes, 0, 0);
  return result;
}

/**
 * 将时间向上取整到指定分钟数
 * @param date - 原始时间
 * @param minutes - 分钟间隔
 * @returns 取整后的时间
 */
export function ceilToMinutes(date: Date, minutes: number): Date {
  if (!isValidDate(date)) {
    throw new Error("Invalid date provided to ceilToMinutes");
  }

  const result = new Date(date);
  const currentMinutes = result.getMinutes();
  const roundedMinutes = Math.ceil(currentMinutes / minutes) * minutes;
  result.setMinutes(roundedMinutes, 0, 0);
  return result;
}

/**
 * 格式化日期为 ISO 8601 字符串
 * @param date - Date 对象
 * @returns ISO 字符串或 null
 * @description 统一替代 Date.toISOString()，增加空值处理
 */
export function formatDateToISO(date: Date | null | undefined): string | null {
  if (!date) return null;
  if (!isValidDate(date)) return null;
  return date.toISOString();
}

/**
 * 格式化日期为本地 YYYY-MM-DD HH:mm:ss
 * @param date - Date 对象
 * @returns 格式化字符串或 null
 * @description 使用运行环境的本地时区（需确保 TZ=Asia/Shanghai）
 */
export function formatDateToLocal(
  date: Date | null | undefined
): string | null {
  if (!date) return null;
  if (!isValidDate(date)) return null;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * 获取日期的开始时间（00:00:00.000）
 * @param date - Date 对象
 * @returns 当天开始时间
 */
export function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * 获取日期的结束时间（23:59:59.999）
 * @param date - Date 对象
 * @returns 当天结束时间
 */
export function endOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * 计算两个日期之间的天数差
 * @param date1 - 日期1
 * @param date2 - 日期2
 * @returns 天数差（绝对值）
 */
export function daysBetween(date1: Date, date2: Date): number {
  const ms1 = startOfDay(date1).getTime();
  const ms2 = startOfDay(date2).getTime();
  const diffMs = Math.abs(ms1 - ms2);
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * 检查是否为同一天
 * @param date1 - 日期1
 * @param date2 - 日期2
 * @returns 是否同一天
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * 格式化日期为 YYYY-MM-DD（使用本地时区）
 * @param date - Date 对象
 * @returns 日期字符串 (YYYY-MM-DD) 或 null
 * @description 使用本地时区的日期组件，避免 toISOString() 导致的日期偏差
 */
export function formatDateOnly(date: Date | null | undefined): string | null {
  if (!date) return null;
  if (!isValidDate(date)) return null;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
