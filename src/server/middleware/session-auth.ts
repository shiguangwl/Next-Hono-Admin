import type { Context } from 'hono'
import { getCookie } from 'hono/cookie'
import { createMiddleware } from 'hono/factory'
import { env } from '@/env'
import { UnauthorizedError } from '@/lib/errors'
import type { Env } from '@/server/context'
import { authenticateSessionToken, type SessionLookupResult } from '@/server/services'
import { clearSessionCookie } from '@/server/utils/session-cookie'

type SessionResolver = (token: string) => Promise<SessionLookupResult | null>

const BEARER_PREFIX = 'Bearer '

interface TokenCandidate {
  token: string
  fromCookie: boolean
}

function collectTokenCandidates(c: Context<Env>): TokenCandidate[] {
  const candidates: TokenCandidate[] = []

  const cookieToken = getCookie(c, env.SESSION_COOKIE_NAME)
  if (cookieToken) {
    candidates.push({ token: cookieToken, fromCookie: true })
  }

  const authHeader = c.req.header('Authorization')
  if (authHeader?.startsWith(BEARER_PREFIX)) {
    candidates.push({
      token: authHeader.slice(BEARER_PREFIX.length),
      fromCookie: false,
    })
  }

  return candidates
}

function clearAuthContext(c: Context<Env>) {
  c.set('admin', null)
  c.set('permissions', null)
  c.set('sessionId', null)
}

// WHY: cookie 验证失败时回退到 Bearer，避免失效 cookie 屏蔽有效 Bearer token
export function createSessionAuth(resolveSession: SessionResolver) {
  return createMiddleware<Env>(async (c, next) => {
    const candidates = collectTokenCandidates(c)

    if (candidates.length === 0) {
      clearAuthContext(c)
      return next()
    }

    for (const { token, fromCookie } of candidates) {
      const session = await resolveSession(token)
      if (session) {
        c.set('admin', session.admin)
        c.set('sessionId', session.sessionId)
        return next()
      }
      if (fromCookie) {
        clearSessionCookie(c)
      }
    }

    clearAuthContext(c)
    return next()
  })
}

export const sessionAuth = createSessionAuth(authenticateSessionToken)

export const requireAuth = createMiddleware<Env>(async (c, next) => {
  if (!c.get('admin')) {
    throw new UnauthorizedError()
  }

  return next()
})
