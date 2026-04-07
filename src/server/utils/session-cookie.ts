import type { Context } from 'hono'
import { deleteCookie, setCookie } from 'hono/cookie'
import { env } from '@/env'

// 通过COOKIE_SECURE控制是否需要 secure
function isSecureCookie(): boolean {
  return env.COOKIE_SECURE ?? env.NODE_ENV === 'production'
}

function getCookieOptions() {
  return {
    path: '/',
    httpOnly: true,
    sameSite: 'Strict' as const,
    secure: isSecureCookie(),
    maxAge: env.SESSION_TTL_DAYS * 24 * 60 * 60,
  }
}

export function setSessionCookie(c: Context, token: string): void {
  setCookie(c, env.SESSION_COOKIE_NAME, token, getCookieOptions())
}

export function clearSessionCookie(c: Context): void {
  deleteCookie(c, env.SESSION_COOKIE_NAME, {
    path: '/',
    httpOnly: true,
    sameSite: 'Strict',
    secure: isSecureCookie(),
  })
}
