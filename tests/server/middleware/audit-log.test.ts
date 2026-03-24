import { Hono } from 'hono'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import type { Env } from '@/server/context'
import { auditLog, type OperationLogData, setLogRecorder } from '@/server/middleware/audit-log'

const { mockState } = vi.hoisted(() => ({
  mockState: {
    recorder: vi.fn<(_: OperationLogData) => Promise<void>>(),
    loggerDebug: vi.fn(),
    loggerError: vi.fn(),
    handlerCalls: 0,
  },
}))

vi.mock('@/lib/logging', () => ({
  logger: {
    debug: mockState.loggerDebug,
    error: mockState.loggerError,
  },
}))

function createApp(): Hono<Env> {
  const app = new Hono<Env>()

  app.use('*', async (c, next) => {
    c.set('admin', {
      adminId: 7,
      username: 'auditor',
    })
    await next()
  })

  return app
}

function flushImmediate() {
  return new Promise<void>((resolve) => {
    setImmediate(() => resolve())
  })
}

describe('auditLog middleware', () => {
  beforeEach(() => {
    mockState.recorder.mockReset()
    mockState.recorder.mockResolvedValue(undefined)
    mockState.loggerDebug.mockReset()
    mockState.loggerError.mockReset()
    mockState.handlerCalls = 0
    setLogRecorder(mockState.recorder)
  })

  test('records logs after the request completes without blocking the handler', async () => {
    const app = createApp()

    app.get(
      '/logs',
      auditLog({
        module: '测试模块',
        operation: '查询',
        description: '读取测试数据',
      }),
      async (c) => {
        mockState.handlerCalls += 1
        return c.json({ ok: true })
      }
    )

    const response = await app.request('http://localhost/logs?status=ok', {
      headers: {
        'user-agent': 'vitest',
        'x-real-ip': '127.0.0.1',
      },
    })

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ ok: true })
    expect(mockState.handlerCalls).toBe(1)
    expect(mockState.recorder).not.toHaveBeenCalled()

    await flushImmediate()

    expect(mockState.recorder).toHaveBeenCalledTimes(1)
    expect(mockState.recorder).toHaveBeenCalledWith(
      expect.objectContaining({
        adminId: 7,
        adminName: 'auditor',
        module: '测试模块',
        operation: '查询',
        description: '读取测试数据',
        action: 'GET /logs',
        requestMethod: 'GET',
        requestUrl: 'http://localhost/logs?status=ok',
        requestParams: JSON.stringify({ status: 'ok' }),
        ip: '127.0.0.1',
        userAgent: 'vitest',
        status: 1,
        errorMsg: null,
      })
    )
  })

  test('sanitizes sensitive fields recursively in POST request bodies', async () => {
    const app = createApp()

    app.post(
      '/logs',
      auditLog({
        module: '测试模块',
        operation: '创建',
        description: '写入测试数据',
      }),
      async (c) => {
        mockState.handlerCalls += 1
        return c.json({ ok: true }, 201)
      }
    )

    const response = await app.request('http://localhost/logs', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        username: 'alice',
        password: 'plain-text',
        profile: {
          newPassword: 'new-secret',
          oldPassword: 'old-secret',
          nested: {
            token: 'token-value',
            apiKey: 'api-key-value',
            Authorization: 'Bearer secret',
            note: 'keep-me',
          },
        },
        meta: {
          secret: 'secret-value',
          ssn: '123-45-6789',
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
          creditCard: '4111111111111111',
        },
      }),
    })

    expect(response.status).toBe(201)
    await expect(response.json()).resolves.toEqual({ ok: true })
    expect(mockState.handlerCalls).toBe(1)

    await flushImmediate()

    expect(mockState.recorder).toHaveBeenCalledTimes(1)
    const [logData] = mockState.recorder.mock.calls[0]

    expect(JSON.parse(logData.requestParams ?? 'null')).toEqual({
      username: 'alice',
      password: '******',
      profile: {
        newPassword: '******',
        oldPassword: '******',
        nested: {
          token: '******',
          apiKey: '******',
          Authorization: '******',
          note: 'keep-me',
        },
      },
      meta: {
        secret: '******',
        ssn: '******',
        accessToken: '******',
        refreshToken: '******',
        creditCard: '******',
      },
    })
  })
})
