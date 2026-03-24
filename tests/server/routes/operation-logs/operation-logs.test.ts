import { Hono } from 'hono'
import { createMiddleware } from 'hono/factory'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { ErrorCode, ForbiddenError, UnauthorizedError } from '@/lib/errors'
import type { Env } from '@/server/context'
import { operationLogs } from '@/server/routes/operation-logs'
import { setupErrorHandlers } from '@/server/setup/error-handlers'

const { mockState } = vi.hoisted(() => ({
  mockState: {
    allowAuth: true,
    grantedPermissions: ['*'] as string[],
    authCalls: [] as string[],
    permissionCalls: [] as Array<{ permission: string; method: string; path: string }>,
    auditCalls: [] as Array<{
      method: string
      path: string
      options: { module: string; operation: string; description?: string }
    }>,
    executionOrder: [] as string[],
    getOperationLogList: vi.fn(),
    getOperationLogById: vi.fn(),
    deleteOperationLog: vi.fn(),
  },
}))

vi.mock('@/server/middleware/session-auth', () => ({
  requireAuth: createMiddleware<Env>(async (c, next) => {
    mockState.authCalls.push(`${c.req.method} ${c.req.path}`)
    mockState.executionOrder.push('auth')

    if (!mockState.allowAuth) {
      throw new UnauthorizedError()
    }

    c.set('admin', { adminId: 2, username: 'tester' })
    c.set('permissions', mockState.grantedPermissions)
    await next()
  }),
}))

vi.mock('@/server/middleware/rbac', () => ({
  requirePermission: (permission: string) =>
    createMiddleware<Env>(async (c, next) => {
      mockState.permissionCalls.push({
        permission,
        method: c.req.method,
        path: c.req.path,
      })
      mockState.executionOrder.push(`permission:${permission}`)

      if (
        !mockState.grantedPermissions.includes('*') &&
        !mockState.grantedPermissions.includes(permission)
      ) {
        throw new ForbiddenError()
      }

      await next()
    }),
}))

vi.mock('@/server/middleware/audit-log', () => ({
  auditLog: (options: { module: string; operation: string; description?: string }) =>
    createMiddleware<Env>(async (c, next) => {
      mockState.auditCalls.push({
        method: c.req.method,
        path: c.req.path,
        options,
      })
      mockState.executionOrder.push(`audit:${options.operation}`)
      await next()
    }),
}))

vi.mock('@/server/services', () => ({
  getOperationLogList: mockState.getOperationLogList,
  getOperationLogById: mockState.getOperationLogById,
  deleteOperationLog: mockState.deleteOperationLog,
}))

function createApp(): Hono<Env> {
  const app = new Hono<Env>()

  app.use('*', async (c, next) => {
    c.set('requestId', 'req-test')
    await next()
  })

  app.route('/api/operation-logs', operationLogs)
  setupErrorHandlers(app)

  return app
}

describe('operationLogs routes', () => {
  beforeEach(() => {
    mockState.allowAuth = true
    mockState.grantedPermissions = ['*']
    mockState.authCalls = []
    mockState.permissionCalls = []
    mockState.auditCalls = []
    mockState.executionOrder = []
    mockState.getOperationLogList.mockReset()
    mockState.getOperationLogById.mockReset()
    mockState.deleteOperationLog.mockReset()
  })

  test('all routes require authentication', async () => {
    mockState.allowAuth = false
    const app = createApp()

    const listResponse = await app.request('http://localhost/api/operation-logs')
    const detailResponse = await app.request('http://localhost/api/operation-logs/1')
    const deleteResponse = await app.request('http://localhost/api/operation-logs/1', {
      method: 'DELETE',
    })

    expect(listResponse.status).toBe(401)
    expect(detailResponse.status).toBe(401)
    expect(deleteResponse.status).toBe(401)
    expect(mockState.authCalls).toEqual([
      'GET /api/operation-logs',
      'GET /api/operation-logs/1',
      'DELETE /api/operation-logs/1',
    ])
    expect(mockState.permissionCalls).toEqual([])
    expect(mockState.auditCalls).toEqual([])
  })

  test('each route requires the correct permission', async () => {
    mockState.grantedPermissions = []
    const app = createApp()

    const listResponse = await app.request('http://localhost/api/operation-logs')
    const detailResponse = await app.request('http://localhost/api/operation-logs/1')
    const deleteResponse = await app.request('http://localhost/api/operation-logs/1', {
      method: 'DELETE',
    })

    expect(listResponse.status).toBe(403)
    expect(detailResponse.status).toBe(403)
    expect(deleteResponse.status).toBe(403)
    expect(mockState.permissionCalls).toEqual([
      {
        permission: 'system:log:list',
        method: 'GET',
        path: '/api/operation-logs',
      },
      {
        permission: 'system:log:query',
        method: 'GET',
        path: '/api/operation-logs/1',
      },
      {
        permission: 'system:log:delete',
        method: 'DELETE',
        path: '/api/operation-logs/1',
      },
    ])
    expect(mockState.auditCalls).toEqual([])
  })

  test('delete route runs auditLog before param validation', async () => {
    mockState.grantedPermissions = ['system:log:delete']
    const app = createApp()

    const response = await app.request('http://localhost/api/operation-logs/invalid', {
      method: 'DELETE',
    })

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toMatchObject({
      code: ErrorCode.VALIDATION_ERROR,
      message: '请求参数校验失败',
      details: {
        issues: [
          expect.objectContaining({
            path: 'id',
            source: 'param',
          }),
        ],
      },
    })
    expect(mockState.executionOrder).toEqual(['auth', 'permission:system:log:delete', 'audit:删除'])
    expect(mockState.auditCalls).toEqual([
      {
        method: 'DELETE',
        path: '/api/operation-logs/invalid',
        options: {
          module: '操作日志',
          operation: '删除',
          description: '删除操作日志',
        },
      },
    ])
    expect(mockState.deleteOperationLog).not.toHaveBeenCalled()
  })

  test('route params are validated with IdParamSchema', async () => {
    mockState.grantedPermissions = ['system:log:query']
    const app = createApp()

    const response = await app.request('http://localhost/api/operation-logs/not-a-number')

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toMatchObject({
      code: ErrorCode.VALIDATION_ERROR,
      message: '请求参数校验失败',
      details: {
        issues: [
          expect.objectContaining({
            path: 'id',
            source: 'param',
          }),
        ],
      },
    })
    expect(mockState.getOperationLogById).not.toHaveBeenCalled()
  })
})
