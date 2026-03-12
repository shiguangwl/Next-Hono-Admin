import { Hono } from 'hono'
import type { Env } from '@/server/context'
import { requirePermission } from '@/server/middleware/rbac'
import { requireAuth } from '@/server/middleware/session-auth'
import { deleteOperationLog, getOperationLogById, getOperationLogList } from '@/server/services'
import { R } from '@/server/utils/response'
import { zValidator } from '@/server/utils/validator'
import { IdParamSchema } from '../shared'
import { LogQuerySchema } from './dtos'

const operationLogs = new Hono<Env>()
  .use('/*', requireAuth)
  .get(
    '/',
    requirePermission('system:log:list'),
    zValidator('query', LogQuerySchema),
    async (c) => {
      const query = c.req.valid('query')
      const result = await getOperationLogList(query)
      return R.ok(result)
    }
  )
  .get(
    '/:id',
    requirePermission('system:log:query'),
    zValidator('param', IdParamSchema),
    async (c) => {
      const { id } = c.req.valid('param')
      const log = await getOperationLogById(id)
      return R.ok(log)
    }
  )
  .delete(
    '/:id',
    requirePermission('system:log:delete'),
    zValidator('param', IdParamSchema),
    async (c) => {
      const { id } = c.req.valid('param')
      await deleteOperationLog(id)
      return R.success('删除成功')
    }
  )

export { operationLogs }
