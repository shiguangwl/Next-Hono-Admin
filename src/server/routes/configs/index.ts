/**
 * 系统配置路由实现
 */

import { OpenAPIHono } from '@hono/zod-openapi'
import type { Env } from '@/server/context'
import { auditLog } from '@/server/middleware/audit-log'
import { requireAuth } from '@/server/middleware/jwt-auth'
import { requirePermission } from '@/server/middleware/rbac'
import {
  createConfig,
  deleteConfig,
  getConfigById,
  listConfigs,
  preloadAllActiveConfigs,
  updateConfig,
} from '@/server/services'
import type { PaginatedResult } from '@/server/utils/shared'
import { createCrudRouter } from '../shared'
import { configRoutes, updateConfigValueRoute } from './defs'
import type { ConfigQuery, CreateConfigInput, UpdateConfigInput } from './dtos'

// ========== 系统配置 CRUD（使用工厂） ==========

type ConfigVo = Awaited<ReturnType<typeof getConfigById>>

const configRouter = createCrudRouter<
  PaginatedResult<ConfigVo>,
  ConfigVo,
  CreateConfigInput,
  UpdateConfigInput,
  ConfigQuery
>(
  {
    moduleName: '系统配置',
    permissionPrefix: 'system:config',
    routes: configRoutes,
    audit: {
      create: '创建系统配置项',
      update: '更新系统配置项',
      delete: '删除系统配置项',
    },
  },
  {
    list: async (query) => {
      const result = await listConfigs(query)
      // 创建/更新/删除后刷新缓存
      return result
    },
    detail: async (id) => {
      return getConfigById(id)
    },
    create: async (input) => {
      const config = await createConfig({
        configKey: input.configKey,
        configValue: input.configValue ?? null,
        configType: input.configType,
        configGroup: input.configGroup,
        configName: input.configName,
        remark: input.remark ?? null,
        isSystem: input.isSystem,
        status: input.status,
      })
      await preloadAllActiveConfigs()
      return config
    },
    update: async (id, input) => {
      const config = await updateConfig(id, {
        configKey: input.configKey,
        configValue: input.configValue,
        configType: input.configType,
        configGroup: input.configGroup,
        configName: input.configName,
        remark: input.remark,
        isSystem: input.isSystem,
        status: input.status,
      })
      await preloadAllActiveConfigs()
      return config
    },
    delete: async (id) => {
      await deleteConfig(id)
      await preloadAllActiveConfigs()
    },
  }
)

// ========== 扩展路由：仅更新配置值 ==========

configRouter.use(
  updateConfigValueRoute.path,
  requirePermission('system:config:update'),
  auditLog({
    module: '系统配置',
    operation: '更新配置值',
    description: '更新系统配置值',
  })
)
configRouter.openapi(updateConfigValueRoute, async (c) => {
  const { id } = c.req.valid('param')
  const body = c.req.valid('json')

  const config = await updateConfig(id, {
    configValue: body.configValue,
    configType: body.configType,
    status: body.status,
  })
  await preloadAllActiveConfigs()

  return c.json({ code: 'OK', data: config }, 200)
})

export { configRouter as configs }
