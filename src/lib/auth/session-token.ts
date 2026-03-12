import { createHash, randomBytes } from 'node:crypto'
import { env } from '@/env'

const SESSION_TOKEN_BYTES = 32
const MS_PER_DAY = 24 * 60 * 60 * 1000

export function createSessionToken(): string {
  return randomBytes(SESSION_TOKEN_BYTES).toString('base64url')
}

export function hashSessionToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export function createSessionExpiry(now = new Date(), ttlDays = env.SESSION_TTL_DAYS): Date {
  return new Date(now.getTime() + ttlDays * MS_PER_DAY)
}
