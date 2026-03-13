import { Hono } from 'hono'
import { describe, expect, test } from 'vitest'
import type { Env } from '@/server/context'
import { createSessionAuth } from '@/server/middleware/session-auth'

describe('session-auth', () => {
  test('should load admin from session cookie', async () => {
    const app = new Hono<Env>()

    app.use(
      '*',
      createSessionAuth(async (token) => {
        if (token !== 'valid-token') {
          return null
        }

        return {
          admin: {
            adminId: 1,
            username: 'admin',
          },
          sessionId: 10,
        }
      })
    )

    app.get('/secure', (c) => {
      return c.json({
        admin: c.get('admin'),
        sessionId: c.get('sessionId'),
      })
    })

    const response = await app.request('http://localhost/secure', {
      headers: {
        Cookie: 'auth_session=valid-token',
      },
    })

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      admin: {
        adminId: 1,
        username: 'admin',
      },
      sessionId: 10,
    })
  })

  test('should clear auth context when session token is invalid', async () => {
    const app = new Hono<Env>()

    app.use(
      '*',
      createSessionAuth(async () => null)
    )
    app.get('/secure', (c) => {
      return c.json({
        admin: c.get('admin'),
        permissions: c.get('permissions'),
        sessionId: c.get('sessionId'),
      })
    })

    const response = await app.request('http://localhost/secure', {
      headers: {
        Cookie: 'auth_session=expired-token',
      },
    })

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      admin: null,
      permissions: null,
      sessionId: null,
    })
  })
})
