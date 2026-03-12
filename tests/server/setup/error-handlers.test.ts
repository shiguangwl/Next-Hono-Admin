import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { describe, expect, test } from 'vitest'
import { z } from 'zod'
import { ErrorCode } from '@/lib/errors'
import type { Env } from '@/server/context'
import { setupErrorHandlers } from '@/server/setup/error-handlers'
import { zValidator } from '@/server/utils/validator'

function createApp(): Hono<Env> {
  const app = new Hono<Env>()
  app.use('*', async (c, next) => {
    c.set('requestId', 'req-test')
    await next()
  })
  return app
}

describe('setupErrorHandlers', () => {
  test('应将校验失败统一为稳定错误码', async () => {
    const app = createApp()
    app.post('/validate', zValidator('json', z.object({ name: z.string().min(1) })), (c) =>
      c.json({ ok: true })
    )
    setupErrorHandlers(app)

    const response = await app.request('http://localhost/validate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: 123 }),
    })

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      code: ErrorCode.VALIDATION_ERROR,
      message: '请求参数校验失败',
      details: {
        issues: [
          {
            path: 'name',
            message: 'Invalid input: expected string, received number',
            code: 'invalid_type',
            source: 'json',
          },
        ],
      },
      requestId: 'req-test',
    })
  })

  test('应保留 HTTPException 的 JSON 头信息并补齐 requestId', async () => {
    const app = createApp()
    app.get('/http-json', () => {
      throw new HTTPException(401, {
        message: '未授权',
        res: new Response(JSON.stringify({ message: '未授权' }), {
          status: 401,
          headers: { 'content-type': 'application/json; charset=utf-8', 'x-custom': '1' },
        }),
      })
    })
    setupErrorHandlers(app)

    const response = await app.request('http://localhost/http-json')

    expect(response.status).toBe(401)
    expect(response.headers.get('x-custom')).toBe('1')
    expect(response.headers.get('x-request-id')).toBe('req-test')
    await expect(response.json()).resolves.toEqual({
      code: ErrorCode.UNAUTHORIZED,
      message: '未授权',
      requestId: 'req-test',
    })
  })

  test('应保留非 JSON HTTPException 原始响应语义', async () => {
    const app = createApp()
    app.get('/http-text', () => {
      throw new HTTPException(401, {
        res: new Response('unauthorized', {
          status: 401,
          headers: { 'content-type': 'text/plain', 'www-authenticate': 'Bearer realm="admin"' },
        }),
      })
    })
    setupErrorHandlers(app)

    const response = await app.request('http://localhost/http-text')

    expect(response.status).toBe(401)
    expect(response.headers.get('www-authenticate')).toBe('Bearer realm="admin"')
    expect(response.headers.get('x-request-id')).toBe('req-test')
    await expect(response.text()).resolves.toBe('unauthorized')
  })
})
