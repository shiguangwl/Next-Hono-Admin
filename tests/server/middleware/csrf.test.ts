import { Hono } from 'hono'
import { beforeAll, describe, expect, test, vi } from 'vitest'
import { AppError } from '@/lib/errors'
import type { Env } from '@/server/context'
import { csrfMiddleware } from '@/server/middleware/csrf'

// WHY: vi.hoisted is NOT hoisted — safe for mutable state accessible from vi.mock
// Use a container object so the mock always reads the latest reference
const { mockEnv } = vi.hoisted(() => ({
  mockEnv: { CORS_ORIGINS: [] as string[] },
}))
vi.mock('@/env', () => ({
  env: mockEnv,
}))

function createApp(): Hono<Env> {
  const app = new Hono<Env>()

  app.use('*', csrfMiddleware)

  // WHY: AppError (including ForbiddenError) is thrown as a plain Error from middleware.
  // Without an error handler, Hono returns 500 for any unhandled error.
  // We attach an onError to map AppError.httpStatus so tests can assert on the correct status code.
  app.onError((err, c) => {
    if (err instanceof AppError) {
      return c.json({ message: err.message, code: err.code }, err.httpStatus as 403)
    }
    return c.json({ message: err.message }, 500)
  })

  app.all('/test', (c) => c.json({ ok: true }))

  return app
}

describe('csrfMiddleware', () => {
  // ------------------------------------------------------------------
  // CORS_ORIGINS empty (default) — Host-based fallback
  // ------------------------------------------------------------------
  describe('when CORS_ORIGINS is empty (host-based validation)', () => {
    beforeAll(() => {
      mockEnv.CORS_ORIGINS = []
    })

    // 1. Safe methods pass through without Origin/Referer
    test('GET passes through without Origin or Referer', async () => {
      const app = createApp()
      const res = await app.request('http://localhost:3000/test', { method: 'GET' })
      expect(res.status).toBe(200)
      await expect(res.json()).resolves.toEqual({ ok: true })
    })

    test('HEAD passes through without Origin or Referer', async () => {
      const app = createApp()
      const res = await app.request('http://localhost:3000/test', { method: 'HEAD' })
      expect(res.status).toBe(200)
    })

    test('OPTIONS passes through without Origin or Referer', async () => {
      const app = createApp()
      const res = await app.request('http://localhost:3000/test', { method: 'OPTIONS' })
      expect(res.status).toBe(200)
    })

    // 2. POST with matching Origin (Origin host === Host)
    test('POST with matching Origin passes', async () => {
      const app = createApp()
      const res = await app.request('http://localhost:3000/test', {
        method: 'POST',
        headers: {
          Host: 'localhost:3000',
          Origin: 'http://localhost:3000',
        },
      })
      expect(res.status).toBe(200)
      await expect(res.json()).resolves.toEqual({ ok: true })
    })

    // 3. POST with matching Referer (Referer host === Host)
    test('POST with matching Referer passes', async () => {
      const app = createApp()
      const res = await app.request('http://localhost:3000/test', {
        method: 'POST',
        headers: {
          Host: 'localhost:3000',
          Referer: 'http://localhost:3000/some-page',
        },
      })
      expect(res.status).toBe(200)
      await expect(res.json()).resolves.toEqual({ ok: true })
    })

    // 4. POST with Origin mismatch fails
    test('POST with Origin mismatch fails with 403', async () => {
      const app = createApp()
      const res = await app.request('http://localhost:3000/test', {
        method: 'POST',
        headers: {
          Host: 'localhost:3000',
          Origin: 'http://evil.com',
        },
      })
      expect(res.status).toBe(403)
      await expect(res.json()).resolves.toMatchObject({
        message: 'CSRF validation failed: origin mismatch',
      })
    })

    // 5. POST with Referer mismatch fails
    test('POST with Referer mismatch fails with 403', async () => {
      const app = createApp()
      const res = await app.request('http://localhost:3000/test', {
        method: 'POST',
        headers: {
          Host: 'localhost:3000',
          Referer: 'http://evil.com/attack',
        },
      })
      expect(res.status).toBe(403)
      await expect(res.json()).resolves.toMatchObject({
        message: 'CSRF validation failed: referer mismatch',
      })
    })

    // 7. POST missing both Origin and Referer fails
    test('POST missing both Origin and Referer fails with 403', async () => {
      const app = createApp()
      const res = await app.request('http://localhost:3000/test', {
        method: 'POST',
        headers: {
          Host: 'localhost:3000',
        },
      })
      expect(res.status).toBe(403)
      await expect(res.json()).resolves.toMatchObject({
        message: 'CSRF validation failed: missing origin and referer',
      })
    })

    // 8. POST missing Host fails
    test('POST missing Host fails with 403', async () => {
      const app = createApp()
      // WHY: Fetch API always sets Host from URL, so we delete it from the Request headers
      // to test the middleware's defensive Host-missing check
      const reqNoHost = new Request('http://localhost:3000/test', {
        method: 'POST',
        headers: {
          Origin: 'http://localhost:3000',
        },
      })
      reqNoHost.headers.delete('host')
      const resNoHost = await app.request(reqNoHost)

      expect(resNoHost.status).toBe(403)
      await expect(resNoHost.json()).resolves.toMatchObject({
        message: 'CSRF validation failed: missing Host header',
      })
    })
  })

  // ------------------------------------------------------------------
  // CORS_ORIGINS whitelist mode
  // ------------------------------------------------------------------
  describe('when CORS_ORIGINS whitelist is configured', () => {
    beforeAll(() => {
      mockEnv.CORS_ORIGINS = ['http://trusted.com', 'https://admin.example.com']
    })

    // 9. Origin in whitelist passes
    test('POST with Origin in whitelist passes', async () => {
      const app = createApp()
      const res = await app.request('http://localhost:3000/test', {
        method: 'POST',
        headers: {
          Host: 'localhost:3000',
          Origin: 'http://trusted.com',
        },
      })
      expect(res.status).toBe(200)
      await expect(res.json()).resolves.toEqual({ ok: true })
    })

    // 10. Origin NOT in whitelist fails
    test('POST with Origin not in whitelist fails with 403', async () => {
      const app = createApp()
      const res = await app.request('http://localhost:3000/test', {
        method: 'POST',
        headers: {
          Host: 'localhost:3000',
          Origin: 'http://evil.com',
        },
      })
      expect(res.status).toBe(403)
      await expect(res.json()).resolves.toMatchObject({
        message: 'CSRF validation failed: origin mismatch',
      })
    })

    // 11. Referer origin in whitelist passes
    test('POST with Referer origin in whitelist passes', async () => {
      const app = createApp()
      const res = await app.request('http://localhost:3000/test', {
        method: 'POST',
        headers: {
          Host: 'localhost:3000',
          Referer: 'https://admin.example.com/dashboard',
        },
      })
      expect(res.status).toBe(200)
      await expect(res.json()).resolves.toEqual({ ok: true })
    })

    // 12. Referer origin NOT in whitelist fails
    test('POST with Referer origin not in whitelist fails with 403', async () => {
      const app = createApp()
      const res = await app.request('http://localhost:3000/test', {
        method: 'POST',
        headers: {
          Host: 'localhost:3000',
          Referer: 'http://untrusted.org/page',
        },
      })
      expect(res.status).toBe(403)
      await expect(res.json()).resolves.toMatchObject({
        message: 'CSRF validation failed: referer mismatch',
      })
    })

    // 6. Referer prefix spoofing rejected
    // WHY: This was a security fix — http://trusted.evil.com must NOT match http://trusted.com
    // The referer origin is extracted with new URL(referer).origin and compared exactly.
    test('POST with Referer prefix spoofing is rejected', async () => {
      const app = createApp()
      const res = await app.request('http://localhost:3000/test', {
        method: 'POST',
        headers: {
          Host: 'localhost:3000',
          Origin: 'http://evil.com',
          Referer: 'http://trusted.evil.com/attack',
        },
      })
      expect(res.status).toBe(403)
      await expect(res.json()).resolves.toMatchObject({
        message: 'CSRF validation failed: origin mismatch',
      })
    })

    // Additional: verify that Referer-only prefix spoofing is also rejected
    test('POST with only Referer prefix spoofing is rejected', async () => {
      const app = createApp()
      const res = await app.request('http://localhost:3000/test', {
        method: 'POST',
        headers: {
          Host: 'localhost:3000',
          Referer: 'http://trusted.evil.com/attack',
        },
      })
      expect(res.status).toBe(403)
      await expect(res.json()).resolves.toMatchObject({
        message: 'CSRF validation failed: referer mismatch',
      })
    })

    // Additional: Origin sub-path match (allowed by isOriginAllowed)
    test('POST with Origin that is sub-path of whitelisted origin passes', async () => {
      const app = createApp()
      const res = await app.request('http://localhost:3000/test', {
        method: 'POST',
        headers: {
          Host: 'localhost:3000',
          Origin: 'http://trusted.com/admin',
        },
      })
      expect(res.status).toBe(200)
      await expect(res.json()).resolves.toEqual({ ok: true })
    })
  })
})
