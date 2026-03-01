import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
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
import { R } from '@/server/utils/response'
import { IdParamSchema } from '../shared'
import {
  ConfigQuerySchema,
  CreateConfigInputSchema,
  UpdateConfigInputSchema,
  UpdateConfigValueInputSchema,
} from './dtos'

const configs = new Hono<Env>()
  .use('/*', requireAuth)
  .get(
    '/',
    requirePermission('system:config:list'),
    zValidator('query', ConfigQuerySchema),
    async (c) => {
      const query = c.req.valid('query')
      const result = await listConfigs(query)
      return R.ok(result)
    }
  )
  .get(
    '/:id',
    requirePermission('system:config:query'),
    zValidator('param', IdParamSchema),
    async (c) => {
      const { id } = c.req.valid('param')
      const result = await getConfigById(id)
      return R.ok(result)
    }
  )
  .post(
    '/',
    requirePermission('system:config:create'),
    auditLog({ module: '系统配置', operation: '创建', description: '创建系统配置项' }),
    zValidator('json', CreateConfigInputSchema),
    async (c) => {
      const body = c.req.valid('json')
      const config = await createConfig({
        configKey: body.configKey,
        configValue: body.configValue ?? null,
        configType: body.configType,
        configGroup: body.configGroup,
        configName: body.configName,
        remark: body.remark ?? null,
        isSystem: body.isSystem,
        status: body.status,
      })
      await preloadAllActiveConfigs()
      return R.created(config)
    }
  )
  .put(
    '/:id',
    requirePermission('system:config:update'),
    auditLog({ module: '系统配置', operation: '更新', description: '更新系统配置项' }),
    zValidator('param', IdParamSchema),
    zValidator('json', UpdateConfigInputSchema),
    async (c) => {
      const { id } = c.req.valid('param')
      const body = c.req.valid('json')
      const config = await updateConfig(id, body)
      await preloadAllActiveConfigs()
      return R.ok(config)
    }
  )
  .delete(
    '/:id',
    requirePermission('system:config:delete'),
    auditLog({ module: '系统配置', operation: '删除', description: '删除系统配置项' }),
    zValidator('param', IdParamSchema),
    async (c) => {
      const { id } = c.req.valid('param')
      await deleteConfig(id)
      await preloadAllActiveConfigs()
      return R.success('删除成功')
    }
  )
  .patch(
    '/key/:id',
    requirePermission('system:config:update'),
    auditLog({ module: '系统配置', operation: '更新配置值', description: '更新系统配置值' }),
    zValidator('param', IdParamSchema),
    zValidator('json', UpdateConfigValueInputSchema),
    async (c) => {
      const { id } = c.req.valid('param')
      const body = c.req.valid('json')
      const config = await updateConfig(id, {
        configValue: body.configValue,
        configType: body.configType,
        status: body.status,
      })
      await preloadAllActiveConfigs()
      return R.ok(config)
    }
  )

export { configs }
