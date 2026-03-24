import { Hono } from 'hono'
import { describe, expect, test } from 'vitest'
import { ErrorCode } from '@/lib/errors'
import type { Env } from '@/server/context'
import {
  requireAllPermissions,
  requireAnyPermission,
  requirePermission,
} from '@/server/middleware/rbac'
import { setupErrorHandlers } from '@/server/setup/error-handlers'

function createApp(): Hono<Env> {
  const app = new Hono<Env>()
  app.use('*', async (c, next) => {
    c.set('requestId', 'req-test')
    await next()
  })
  setupErrorHandlers(app)
  return app
}

const superAdmin = { adminId: 1, username: 'superadmin' }
const regularAdmin = { adminId: 2, username: 'admin' }

describe('requirePermission', () => {
  test('super admin (id=1) bypasses all permission checks', async () => {
    const app = createApp()

    app.use(
      '/resource',
      async (c, next) => {
        c.set('admin', superAdmin)
        c.set('permissions', ['*'])
        await next()
      },
      requirePermission('nonexistent:permission')
    )

    app.get('/resource', (c) => c.json({ ok: true }))

    const response = await app.request('http://localhost/resource')
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ ok: true })
  })

  test('user with wildcard * permission passes any check', async () => {
    const app = createApp()

    app.use(
      '/resource',
      async (c, next) => {
        c.set('admin', regularAdmin)
        c.set('permissions', ['*'])
        await next()
      },
      requirePermission('some:random:permission')
    )

    app.get('/resource', (c) => c.json({ ok: true }))

    const response = await app.request('http://localhost/resource')
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ ok: true })
  })

  test('user with exact matching permission passes', async () => {
    const app = createApp()

    app.use(
      '/resource',
      async (c, next) => {
        c.set('admin', regularAdmin)
        c.set('permissions', ['users:read', 'users:write'])
        await next()
      },
      requirePermission('users:read')
    )

    app.get('/resource', (c) => c.json({ ok: true }))

    const response = await app.request('http://localhost/resource')
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ ok: true })
  })

  test('user without required permission gets 403', async () => {
    const app = createApp()

    app.use(
      '/resource',
      async (c, next) => {
        c.set('admin', regularAdmin)
        c.set('permissions', ['users:read'])
        await next()
      },
      requirePermission('users:delete')
    )

    app.get('/resource', (c) => c.json({ ok: true }))

    const response = await app.request('http://localhost/resource')
    expect(response.status).toBe(403)
    await expect(response.json()).resolves.toEqual({
      code: ErrorCode.FORBIDDEN,
      message: '无权限访问',
      requestId: 'req-test',
    })
  })

  test('unauthenticated user (no admin) gets 401', async () => {
    const app = createApp()

    app.use(
      '/resource',
      async (c, next) => {
        c.set('admin', null)
        c.set('permissions', null)
        await next()
      },
      requirePermission('users:read')
    )

    app.get('/resource', (c) => c.json({ ok: true }))

    const response = await app.request('http://localhost/resource')
    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toEqual({
      code: ErrorCode.UNAUTHORIZED,
      message: '未登录或登录已过期',
      requestId: 'req-test',
    })
  })
})

describe('requireAnyPermission', () => {
  test('user with one of multiple required permissions passes', async () => {
    const app = createApp()

    app.use(
      '/resource',
      async (c, next) => {
        c.set('admin', regularAdmin)
        c.set('permissions', ['users:read'])
        await next()
      },
      requireAnyPermission(['users:write', 'users:read', 'users:delete'])
    )

    app.get('/resource', (c) => c.json({ ok: true }))

    const response = await app.request('http://localhost/resource')
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ ok: true })
  })

  test('user with none of required permissions gets 403', async () => {
    const app = createApp()

    app.use(
      '/resource',
      async (c, next) => {
        c.set('admin', regularAdmin)
        c.set('permissions', ['users:read'])
        await next()
      },
      requireAnyPermission(['roles:read', 'roles:write'])
    )

    app.get('/resource', (c) => c.json({ ok: true }))

    const response = await app.request('http://localhost/resource')
    expect(response.status).toBe(403)
    await expect(response.json()).resolves.toEqual({
      code: ErrorCode.FORBIDDEN,
      message: '无权限访问',
      requestId: 'req-test',
    })
  })

  test('super admin bypasses any-mode permission checks', async () => {
    const app = createApp()

    app.use(
      '/resource',
      async (c, next) => {
        c.set('admin', superAdmin)
        c.set('permissions', ['*'])
        await next()
      },
      requireAnyPermission(['roles:read', 'roles:write'])
    )

    app.get('/resource', (c) => c.json({ ok: true }))

    const response = await app.request('http://localhost/resource')
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ ok: true })
  })
})

describe('requireAllPermissions', () => {
  test('user with all required permissions passes', async () => {
    const app = createApp()

    app.use(
      '/resource',
      async (c, next) => {
        c.set('admin', regularAdmin)
        c.set('permissions', ['users:read', 'users:write', 'users:delete'])
        await next()
      },
      requireAllPermissions(['users:read', 'users:write'])
    )

    app.get('/resource', (c) => c.json({ ok: true }))

    const response = await app.request('http://localhost/resource')
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ ok: true })
  })

  test('user missing one required permission gets 403', async () => {
    const app = createApp()

    app.use(
      '/resource',
      async (c, next) => {
        c.set('admin', regularAdmin)
        c.set('permissions', ['users:read'])
        await next()
      },
      requireAllPermissions(['users:read', 'users:write'])
    )

    app.get('/resource', (c) => c.json({ ok: true }))

    const response = await app.request('http://localhost/resource')
    expect(response.status).toBe(403)
    await expect(response.json()).resolves.toEqual({
      code: ErrorCode.FORBIDDEN,
      message: '无权限访问',
      requestId: 'req-test',
    })
  })

  test('super admin bypasses all-mode permission checks', async () => {
    const app = createApp()

    app.use(
      '/resource',
      async (c, next) => {
        c.set('admin', superAdmin)
        c.set('permissions', ['*'])
        await next()
      },
      requireAllPermissions(['users:read', 'users:write', 'users:delete'])
    )

    app.get('/resource', (c) => c.json({ ok: true }))

    const response = await app.request('http://localhost/resource')
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ ok: true })
  })
})
