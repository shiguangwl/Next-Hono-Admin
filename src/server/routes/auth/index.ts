import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import type { Env } from '@/server/context'
import { requireAuth } from '@/server/middleware/jwt-auth'
import { loginRateLimit } from '@/server/middleware/rate-limit'
import { getAdminById, getAdminMenuTree, getAdminPermissions, login } from '@/server/services'
import { R } from '@/server/utils/response'
import { LoginInputSchema } from './dtos'

const auth = new Hono<Env>()
  .post('/login', zValidator('json', LoginInputSchema), async (c) => {
    await loginRateLimit(c, async () => { })

    const body = c.req.valid('json')
    const ip =
      c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
      c.req.header('x-real-ip') ||
      undefined

    const result = await login({ username: body.username, password: body.password, ip })
    return R.ok(result, '登录成功')
  })
  .post('/logout', async () => {
    return R.success('登出成功')
  })
  .get('/info', requireAuth, async (c) => {
    const adminPayload = c.get('admin')!
    const admin = await getAdminById(adminPayload.adminId)
    const permissions = await getAdminPermissions(adminPayload.adminId)
    const menus = await getAdminMenuTree(adminPayload.adminId)

    return R.ok({ admin, permissions, menus })
  })

export { auth }
