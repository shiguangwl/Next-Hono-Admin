/**
 * 通用工具函数
 * @description 通用工具函数集合
 */

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * 合并 Tailwind CSS 类名
 * @description 使用 clsx 处理条件类名，使用 tailwind-merge 合并冲突的 Tailwind 类
 * @param inputs 类名参数
 * @returns 合并后的类名字符串
 * @example
 * cn('px-2 py-1', 'px-4') // => 'py-1 px-4'
 * cn('text-red-500', condition && 'text-blue-500') // => 'text-blue-500' (if condition is true)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
