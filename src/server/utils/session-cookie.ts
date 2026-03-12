import type { Context } from 'hono'
import { deleteCookie, setCookie } from 'hono/cookie'
import { env } from '@/env'

function getCookieOptions() {
  return {
    path: '/',
    httpOnly: true,
    sameSite: 'Strict' as const,
    secure: env.NODE_ENV === 'production',
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
    secure: env.NODE_ENV === 'production',
  })
}
