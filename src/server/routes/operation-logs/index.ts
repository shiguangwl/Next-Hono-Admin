import { Hono } from 'hono'
import type { Env } from '@/server/context'
import { auditLog } from '@/server/middleware/audit-log'
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
      return R.ok(c, result)
    }
  )
  .get(
    '/:id',
    requirePermission('system:log:query'),
    zValidator('param', IdParamSchema),
    async (c) => {
      const { id } = c.req.valid('param')
      const log = await getOperationLogById(id)
      return R.ok(c, log)
    }
  )
  .delete(
    '/:id',
    requirePermission('system:log:delete'),
    auditLog({
      module: '操作日志',
      operation: '删除',
      description: '删除操作日志',
    }),
    zValidator('param', IdParamSchema),
    async (c) => {
      const { id } = c.req.valid('param')
      await deleteOperationLog(id)
      return R.success(c, '删除成功')
    }
  )

export { operationLogs }
