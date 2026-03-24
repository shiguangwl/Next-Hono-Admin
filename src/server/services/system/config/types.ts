export type ConfigPrimitiveType = 'string' | 'boolean' | 'number'
export type ConfigValueType = ConfigPrimitiveType | 'json' | 'array'

/** 配置查询条件 */
export interface ConfigQuery {
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  group?: string
  keyword?: string
  status?: number
}

/** 创建/更新配置输入 */
export interface UpsertConfigInput {
  configKey: string
  configValue: string | null
  configType: ConfigValueType
  configGroup: string
  configName: string
  remark?: string | null
  status?: number
}

/** 更新配置值输入 */
export interface UpdateConfigValueInput {
  configValue: string | null
  configType?: ConfigValueType
  status?: number
}

/** 配置 VO */
export interface ConfigVo {
  id: number
  configKey: string
  configValue: string | null
  configType: ConfigValueType
  configGroup: string
  configName: string
  remark: string | null
  isSystem: number
  status: number
  createdAt: string
  updatedAt: string
}

/** 配置缓存条目 */
export interface ConfigCacheEntry {
  rawValue: string | null
  parsedValue: unknown
  type: ConfigValueType
}
