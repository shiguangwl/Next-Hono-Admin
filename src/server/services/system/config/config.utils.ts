/**
 * 配置服务纯函数与缓存工具
 */

import { and, eq } from 'drizzle-orm'
import { db } from '@/db'
import { sysConfig } from '@/db/schema'
import { formatDateToLocal } from '@/lib/date'
import { NotFoundError, ValidationError } from '@/lib/errors'
import type { ConfigCacheEntry, ConfigValueType, ConfigVo } from './types'

// ========== 缓存管理 ==========

const configCache = new Map<string, ConfigCacheEntry>()

export function clearConfigCache(): void {
  configCache.clear()
}

export function removeConfigCache(key: string): void {
  configCache.delete(key)
}

export function getConfigCacheSize(): number {
  return configCache.size
}

// ========== 纯函数 ==========

export function parseConfigValue(value: string | null, type: ConfigValueType): unknown {
  if (value === null) return null

  if (type === 'string') return value

  if (type === 'boolean') {
    const normalized = value.trim().toLowerCase()
    if (normalized === 'true' || normalized === '1') return true
    if (normalized === 'false' || normalized === '0') return false
    throw new Error(`Invalid boolean config value: ${value}`)
  }

  if (type === 'number') {
    const num = Number(value)
    if (Number.isNaN(num)) {
      throw new Error(`Invalid number config value: ${value}`)
    }
    return num
  }

  try {
    const parsed = JSON.parse(value)
    if (type === 'array' && !Array.isArray(parsed)) {
      throw new Error('Expected array config value')
    }
    return parsed
  } catch (error) {
    throw new Error(`Invalid JSON config value: ${(error as Error).message}`)
  }
}

/** 校验配置值是否符合声明类型，通过则返回原字符串，失败抛 ValidationError */
export function validateConfigValue(value: string | null, type: ConfigValueType): string | null {
  if (value === null) return null
  try {
    parseConfigValue(value, type)
    return value
  } catch (error) {
    throw new ValidationError(`配置值与类型 ${type} 不匹配: ${(error as Error).message}`)
  }
}

export function toConfigVo(row: typeof sysConfig.$inferSelect): ConfigVo {
  return {
    id: row.id,
    configKey: row.configKey,
    configValue: row.configValue,
    configType: row.configType as ConfigValueType,
    configGroup: row.configGroup,
    configName: row.configName,
    remark: row.remark,
    isSystem: row.isSystem,
    status: row.status,
    createdAt: formatDateToLocal(row.createdAt) ?? '',
    updatedAt: formatDateToLocal(row.updatedAt) ?? '',
  }
}

// ========== 查询方法 ==========

/** 获取配置值（带缓存） */
export async function getConfigValue<T = unknown>(key: string): Promise<T | null> {
  const cached = configCache.get(key)
  if (cached) {
    return cached.parsedValue as T
  }

  const row = await db
    .select()
    .from(sysConfig)
    .where(and(eq(sysConfig.configKey, key), eq(sysConfig.status, 1)))
    .limit(1)
    .then((rows) => rows[0])

  if (!row) return null

  const parsedValue = parseConfigValue(row.configValue, row.configType as ConfigValueType)
  configCache.set(key, {
    rawValue: row.configValue,
    parsedValue,
    type: row.configType as ConfigValueType,
  })

  return parsedValue as T
}

// ========== 查询方法（无缓存） ==========

/** 预加载所有启用的配置 */
export async function preloadAllActiveConfigs(): Promise<void> {
  const rows = await db.select().from(sysConfig).where(eq(sysConfig.status, 1))

  configCache.clear()

  for (const row of rows) {
    const type = row.configType as ConfigValueType
    const parsedValue = parseConfigValue(row.configValue, type)
    configCache.set(row.configKey, {
      rawValue: row.configValue,
      parsedValue,
      type,
    })
  }
}

/** 根据 ID 获取配置 */
export async function getConfigById(id: number): Promise<ConfigVo> {
  const row = await db
    .select()
    .from(sysConfig)
    .where(eq(sysConfig.id, id))
    .limit(1)
    .then((rows) => rows[0])

  if (!row) {
    throw new NotFoundError('SysConfig', id)
  }

  return toConfigVo(row)
}

/** 根据 Key 获取配置 */
export async function getConfigByKey(key: string): Promise<ConfigVo> {
  const row = await db
    .select()
    .from(sysConfig)
    .where(eq(sysConfig.configKey, key))
    .limit(1)
    .then((rows) => rows[0])

  if (!row) {
    throw new NotFoundError('SysConfig', key)
  }

  return toConfigVo(row)
}
