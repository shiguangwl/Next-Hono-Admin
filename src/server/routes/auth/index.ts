/**
 * 认证路由实现
 * @description 实现登录、登出、获取认证信息的路由处理
 */

import { OpenAPIHono } from '@hono/zod-openapi'
import type { Env } from '@/server/context'
import { requireAuth } from '@/server/middleware/jwt-auth'
import { loginRateLimit } from '@/server/middleware/rate-limit'
import { getAdminById, getAdminMenuTree, getAdminPermissions, login } from '@/server/services'
import { R } from '@/server/utils/response'
import { getAuthInfoRoute, loginRoute, logoutRoute } from './defs'

const auth = new OpenAPIHono<Env>()

/**
 * POST /api/auth/login - 管理员登录
 */
auth.openapi(loginRoute, async (c) => {
  await loginRateLimit(c, async () => {})

  const body = c.req.valid('json')

  const ip =
    c.req.header('x-forwarded-for')?.split(',')[0]?.trim() || c.req.header('x-real-ip') || undefined

  const result = await login({
    username: body.username,
    password: body.password,
    ip,
  })

  return R.ok(result, '登录成功')
})

/**
 * POST /api/auth/logout - 管理员登出
 */
auth.openapi(logoutRoute, async (c) => {
  return R.success('登出成功')
})

/**
 * GET /api/auth/info - 获取当前管理员信息
 */
auth.use('/info', requireAuth)
auth.openapi(getAuthInfoRoute, async (c) => {
  const adminPayload = c.get('admin')!

  const admin = await getAdminById(adminPayload.adminId)
  const permissions = await getAdminPermissions(adminPayload.adminId)
  const menus = await getAdminMenuTree(adminPayload.adminId)

  return R.ok({
    admin,
    permissions,
    menus,
  })
})

export { auth }
