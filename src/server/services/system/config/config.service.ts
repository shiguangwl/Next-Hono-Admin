/**
 * 系统配置服务
 */

import { and, eq } from 'drizzle-orm'
import { db } from '@/db'
import { sysConfig } from '@/db/schema'
import { ConflictError, NotFoundError } from '@/lib/errors'
import { formatDateToLocal } from '@/lib/utils/date'
import type { PaginatedResult } from '../../../utils/shared'
import type {
  ConfigCacheEntry,
  ConfigQuery,
  ConfigValueType,
  ConfigVo,
  UpdateConfigValueInput,
  UpsertConfigInput,
} from './models'

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

// ========== 内部工具 ==========

function parseConfigValue(value: string | null, type: ConfigValueType): unknown {
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

function toConfigVo(row: typeof sysConfig.$inferSelect): ConfigVo {
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

// ========== 服务方法 ==========

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

/** 获取配置列表（分页） */
export async function listConfigs(options: ConfigQuery): Promise<PaginatedResult<ConfigVo>> {
  const page = options.page && options.page > 0 ? options.page : 1
  const pageSize =
    options.pageSize && options.pageSize > 0 && options.pageSize <= 100 ? options.pageSize : 20

  const whereClauses = []

  if (options.group) {
    whereClauses.push(eq(sysConfig.configGroup, options.group))
  }

  if (options.status !== undefined) {
    whereClauses.push(eq(sysConfig.status, options.status))
  }

  const where =
    whereClauses.length === 0
      ? undefined
      : whereClauses.length === 1
        ? whereClauses[0]
        : and(...whereClauses)

  const [items, totalResult] = await Promise.all([
    db
      .select()
      .from(sysConfig)
      .where(where as never)
      .orderBy(sysConfig.configGroup, sysConfig.configKey)
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db
      .select({ count: sysConfig.id })
      .from(sysConfig)
      .where(where as never)
      .then((rows) => rows[0]),
  ])

  const total = Number(totalResult?.count ?? 0)
  const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize)

  return {
    items: items.map(toConfigVo),
    total,
    page,
    pageSize,
    totalPages,
  }
}

/** 创建配置 */
export async function createConfig(input: UpsertConfigInput): Promise<ConfigVo> {
  const existing = await db
    .select({ id: sysConfig.id })
    .from(sysConfig)
    .where(eq(sysConfig.configKey, input.configKey))
    .limit(1)
    .then((rows) => rows[0])

  if (existing) {
    throw new ConflictError(`配置键 ${input.configKey} 已存在`)
  }

  const [insertResult] = await db.insert(sysConfig).values({
    configKey: input.configKey,
    configValue: input.configValue,
    configType: input.configType,
    configGroup: input.configGroup,
    configName: input.configName,
    remark: input.remark ?? null,
    isSystem: input.isSystem ?? 0,
    status: input.status ?? 1,
  })

  const id = Number(insertResult.insertId)
  removeConfigCache(input.configKey)
  return getConfigById(id)
}

/** 更新配置 */
export async function updateConfig(
  id: number,
  input: Partial<UpsertConfigInput>
): Promise<ConfigVo> {
  const existing = await db
    .select()
    .from(sysConfig)
    .where(eq(sysConfig.id, id))
    .limit(1)
    .then((rows) => rows[0])

  if (!existing) {
    throw new NotFoundError('SysConfig', id)
  }

  if (existing.isSystem === 1 && input.configKey && input.configKey !== existing.configKey) {
    throw new ConflictError('系统级配置不允许修改 configKey')
  }

  if (input.configKey && input.configKey !== existing.configKey) {
    const conflict = await db
      .select({ id: sysConfig.id })
      .from(sysConfig)
      .where(eq(sysConfig.configKey, input.configKey))
      .limit(1)
      .then((rows) => rows[0])

    if (conflict) {
      throw new ConflictError(`配置键 ${input.configKey} 已存在`)
    }
  }

  await db
    .update(sysConfig)
    .set({
      configKey: input.configKey ?? existing.configKey,
      configValue: input.configValue ?? existing.configValue,
      configType: input.configType ?? existing.configType,
      configGroup: input.configGroup ?? existing.configGroup,
      configName: input.configName ?? existing.configName,
      remark: input.remark ?? existing.remark,
      isSystem: input.isSystem ?? existing.isSystem,
      status: input.status ?? existing.status,
    })
    .where(eq(sysConfig.id, id))

  removeConfigCache(existing.configKey)
  if (input.configKey && input.configKey !== existing.configKey) {
    removeConfigCache(input.configKey)
  }

  return getConfigById(id)
}

/** 根据 Key 更新配置值 */
export async function updateConfigValueByKey(
  key: string,
  input: UpdateConfigValueInput
): Promise<ConfigVo> {
  const existing = await db
    .select()
    .from(sysConfig)
    .where(eq(sysConfig.configKey, key))
    .limit(1)
    .then((rows) => rows[0])

  if (!existing) {
    throw new NotFoundError('SysConfig', key)
  }

  await db
    .update(sysConfig)
    .set({
      configValue: input.configValue,
      configType: input.configType ?? existing.configType,
      status: input.status ?? existing.status,
    })
    .where(eq(sysConfig.configKey, key))

  removeConfigCache(key)
  return getConfigByKey(key)
}

/** 删除配置 */
export async function deleteConfig(id: number): Promise<void> {
  const existing = await db
    .select()
    .from(sysConfig)
    .where(eq(sysConfig.id, id))
    .limit(1)
    .then((rows) => rows[0])

  if (!existing) {
    throw new NotFoundError('SysConfig', id)
  }

  if (existing.isSystem === 1) {
    throw new ConflictError('系统级配置不允许删除')
  }

  await db.delete(sysConfig).where(eq(sysConfig.id, id))
  removeConfigCache(existing.configKey)
}
