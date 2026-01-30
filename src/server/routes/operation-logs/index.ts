/**
 * 操作日志路由实现
 * @description 实现操作日志查询的路由处理
 */

import { OpenAPIHono } from '@hono/zod-openapi'
import type { Env } from '@/server/context'
import { requireAuth } from '@/server/middleware/jwt-auth'
import { requirePermission } from '@/server/middleware/rbac'
import { deleteOperationLog, getOperationLogById, getOperationLogList } from '@/server/services'
import { deleteLogRoute, getLogRoute, listLogsRoute } from './defs'

const operationLogs = new OpenAPIHono<Env>()

// 所有路由需要认证
operationLogs.use('/*', requireAuth)

/**
 * GET /api/operation-logs - 获取操作日志列表
 */
operationLogs.use('/', requirePermission('system:log:list'))
operationLogs.openapi(listLogsRoute, async (c) => {
  const query = c.req.valid('query')

  const result = await getOperationLogList({
    page: query.page,
    pageSize: query.pageSize,
    adminId: query.adminId,
    adminName: query.adminName,
    module: query.module,
    operation: query.operation,
    status: query.status,
    startTime: query.startTime,
    endTime: query.endTime,
  })

  return c.json(
    {
      code: 'OK',
      data: result,
    },
    200
  )
})

/**
 * GET /api/operation-logs/:id - 获取操作日志详情
 */
operationLogs.use('/:id', requirePermission('system:log:query'))
operationLogs.openapi(getLogRoute, async (c) => {
  const { id } = c.req.valid('param')

  const log = await getOperationLogById(id)

  return c.json(
    {
      code: 'OK',
      data: log,
    },
    200
  )
})

/**
 * DELETE /api/operation-logs/:id - 删除操作日志
 */
operationLogs.use(deleteLogRoute.path, requirePermission('system:log:delete'))
operationLogs.openapi(deleteLogRoute, async (c) => {
  const { id } = c.req.valid('param')

  await deleteOperationLog(id)

  return c.json(
    {
      code: 'OK',
      message: '删除成功',
      data: null,
    },
    200
  )
})

export { operationLogs }
