/**
 * 系统配置服务
 */

import { and, asc, count, eq } from 'drizzle-orm'
import { db } from '@/db'
import { sysConfig } from '@/db/schema'
import { ConflictError, NotFoundError } from '@/lib/errors'
import {
  buildPaginatedResult,
  buildSortOrder,
  normalizePagination,
  type PaginatedResult,
} from '@/server/utils/pagination'
import {
  getConfigById,
  getConfigByKey,
  removeConfigCache,
  toConfigVo,
  validateConfigValue,
} from './config.utils'
import type {
  ConfigQuery,
  ConfigValueType,
  ConfigVo,
  UpdateConfigValueInput,
  UpsertConfigInput,
} from './types'

// WHY: re-export 工具函数，保持 index.ts 的 export * 不受影响
export {
  clearConfigCache,
  getConfigById,
  getConfigByKey,
  getConfigCacheSize,
  getConfigValue,
  parseConfigValue,
  preloadAllActiveConfigs,
  removeConfigCache,
  toConfigVo,
  validateConfigValue,
} from './config.utils'

// ========== 服务方法 ==========

const CONFIG_SORTABLE_FIELDS = [
  'id',
  'configKey',
  'configGroup',
  'configName',
  'configType',
  'status',
  'createdAt',
] as const

/** 获取配置列表（分页） */
export async function listConfigs(options: ConfigQuery): Promise<PaginatedResult<ConfigVo>> {
  const { page, pageSize, offset, sortBy, sortOrder } = normalizePagination(options)

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

  const orderBy = buildSortOrder(sysConfig, sortBy, sortOrder, CONFIG_SORTABLE_FIELDS, [
    asc(sysConfig.configGroup),
    asc(sysConfig.configKey),
  ])

  const [items, totalResult] = await Promise.all([
    db
      .select()
      .from(sysConfig)
      .where(where as never)
      .orderBy(...orderBy)
      .limit(pageSize)
      .offset(offset),
    db
      .select({ count: count() })
      .from(sysConfig)
      .where(where as never)
      .then((rows) => rows[0]),
  ])

  const total = Number(totalResult?.count ?? 0)
  return buildPaginatedResult(items.map(toConfigVo), total, page, pageSize)
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

  const validatedValue = validateConfigValue(input.configValue, input.configType)

  const [insertResult] = await db.insert(sysConfig).values({
    configKey: input.configKey,
    configValue: validatedValue,
    configType: input.configType,
    configGroup: input.configGroup,
    configName: input.configName,
    remark: input.remark ?? null,
    isSystem: 0,
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

  // WHY: configValue 或 configType 变更时校验值与类型匹配
  const resolvedType = input.configType ?? (existing.configType as ConfigValueType)
  const resolvedValue = input.configValue !== undefined ? input.configValue : existing.configValue
  if (input.configValue !== undefined || input.configType) {
    validateConfigValue(resolvedValue, resolvedType)
  }

  await db
    .update(sysConfig)
    .set({
      configKey: input.configKey ?? existing.configKey,
      // WHY: configValue/remark 可 null（表示清空），?? 会将 null 回退为旧值
      configValue: input.configValue !== undefined ? input.configValue : existing.configValue,
      configType: input.configType ?? existing.configType,
      configGroup: input.configGroup ?? existing.configGroup,
      configName: input.configName ?? existing.configName,
      remark: input.remark !== undefined ? input.remark : existing.remark,
      isSystem: existing.isSystem,
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

  // WHY: configValue 或 configType 变更时校验值与类型匹配
  const resolvedType = input.configType ?? (existing.configType as ConfigValueType)
  validateConfigValue(input.configValue, resolvedType)

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
