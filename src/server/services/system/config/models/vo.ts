/**
 * 系统配置 - 输出模型
 */

import type { ConfigValueType } from './dto'

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
