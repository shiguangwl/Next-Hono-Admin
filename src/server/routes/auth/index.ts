import { Hono } from 'hono'
import { getCookie } from 'hono/cookie'
import { env } from '@/env'
import type { Env } from '@/server/context'
import { loginRateLimit } from '@/server/middleware/rate-limit'
import { requireAuth } from '@/server/middleware/session-auth'
import {
  getAdminById,
  getAdminMenuTree,
  getAdminPermissions,
  login,
  revokeSessionById,
  revokeSessionToken,
} from '@/server/services'
import { R } from '@/server/utils/response'
import { clearSessionCookie, setSessionCookie } from '@/server/utils/session-cookie'
import { zValidator } from '@/server/utils/validator'
import { LoginInputSchema } from './dtos'

const auth = new Hono<Env>()
  .post('/login', loginRateLimit, zValidator('json', LoginInputSchema), async (c) => {
    const body = c.req.valid('json')
    const ip =
      c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
      c.req.header('x-real-ip') ||
      undefined
    const userAgent = c.req.header('user-agent') || null

    const result = await login({
      username: body.username,
      password: body.password,
      ip,
      userAgent,
    })
    setSessionCookie(c, result.sessionToken)
    return R.ok(
      c,
      {
        sessionToken: result.sessionToken,
        admin: result.admin,
        permissions: result.permissions,
        menus: result.menus,
      },
      '登录成功'
    )
  })
  .post('/logout', loginRateLimit, async (c) => {
    const sessionId = c.get('sessionId')
    const cookieToken = getCookie(c, env.SESSION_COOKIE_NAME)

    if (sessionId) {
      await revokeSessionById(sessionId)
    } else if (cookieToken) {
      await revokeSessionToken(cookieToken)
    }

    clearSessionCookie(c)
    return R.success(c, '登出成功')
  })
  .get('/info', requireAuth, async (c) => {
    const adminPayload = c.get('admin')
    if (!adminPayload) {
      return R.fail(c, '未登录或认证失效')
    }
    const [admin, permissions, menus] = await Promise.all([
      getAdminById(adminPayload.adminId),
      getAdminPermissions(adminPayload.adminId),
      getAdminMenuTree(adminPayload.adminId),
    ])

    return R.ok(c, { admin, permissions, menus })
  })

export { auth }
