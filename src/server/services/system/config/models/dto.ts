/**
 * 系统配置 - 输入模型
 */

export type ConfigPrimitiveType = 'string' | 'boolean' | 'number'
export type ConfigValueType = ConfigPrimitiveType | 'json' | 'array'

/** 配置查询条件 */
export interface ConfigQuery {
  page?: number
  pageSize?: number
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
  isSystem?: number
  status?: number
}

/** 更新配置值输入 */
export interface UpdateConfigValueInput {
  configValue: string | null
  configType?: ConfigValueType
  status?: number
}
