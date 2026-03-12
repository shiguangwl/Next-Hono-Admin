import { and, eq, gt, isNotNull, isNull, lte, or } from 'drizzle-orm'
import { db } from '@/db'
import { sysAdmin, sysAdminSession } from '@/db/schema'
import {
  type AdminPayload,
  createSessionExpiry,
  createSessionToken,
  hashSessionToken,
} from '@/lib/auth'

export interface CreateSessionInput {
  adminId: number
  ip?: string
  userAgent?: string | null
}

export interface SessionLookupResult {
  admin: AdminPayload
  sessionId: number
}

export async function createAdminSession(input: CreateSessionInput): Promise<string> {
  const token = createSessionToken()

  await db.insert(sysAdminSession).values({
    adminId: input.adminId,
    tokenHash: hashSessionToken(token),
    loginIp: input.ip ?? null,
    userAgent: input.userAgent ?? null,
    expiresAt: createSessionExpiry(),
  })

  return token
}

export async function authenticateSessionToken(token: string): Promise<SessionLookupResult | null> {
  const now = new Date()
  const session = await db
    .select({
      sessionId: sysAdminSession.id,
      adminId: sysAdmin.id,
      username: sysAdmin.username,
    })
    .from(sysAdminSession)
    .innerJoin(sysAdmin, eq(sysAdminSession.adminId, sysAdmin.id))
    .where(
      and(
        eq(sysAdminSession.tokenHash, hashSessionToken(token)),
        eq(sysAdmin.status, 1),
        isNull(sysAdminSession.revokedAt),
        gt(sysAdminSession.expiresAt, now)
      )
    )
    .limit(1)
    .then((rows) => rows[0])

  if (!session) {
    return null
  }

  return {
    admin: {
      adminId: session.adminId,
      username: session.username,
    },
    sessionId: session.sessionId,
  }
}

export async function revokeSessionToken(token: string): Promise<void> {
  await db
    .update(sysAdminSession)
    .set({ revokedAt: new Date() })
    .where(
      and(eq(sysAdminSession.tokenHash, hashSessionToken(token)), isNull(sysAdminSession.revokedAt))
    )
}

export async function revokeSessionById(sessionId: number): Promise<void> {
  await db
    .update(sysAdminSession)
    .set({ revokedAt: new Date() })
    .where(and(eq(sysAdminSession.id, sessionId), isNull(sysAdminSession.revokedAt)))
}

export async function revokeSessionsByAdminId(adminId: number): Promise<void> {
  await db
    .update(sysAdminSession)
    .set({ revokedAt: new Date() })
    .where(and(eq(sysAdminSession.adminId, adminId), isNull(sysAdminSession.revokedAt)))
}

export async function deleteExpiredSessions(): Promise<number> {
  const result = await db
    .delete(sysAdminSession)
    .where(or(lte(sysAdminSession.expiresAt, new Date()), isNotNull(sysAdminSession.revokedAt)))

  return result[0]?.affectedRows ?? 0
}
