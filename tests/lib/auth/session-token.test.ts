import { describe, expect, test } from 'vitest'
import { createSessionExpiry, createSessionToken, hashSessionToken } from '@/lib/auth/session-token'

describe('session-token', () => {
  test('createSessionToken should generate unique opaque tokens', () => {
    const first = createSessionToken()
    const second = createSessionToken()

    expect(first).not.toBe(second)
    expect(first.length).toBeGreaterThanOrEqual(43)
    expect(second.length).toBeGreaterThanOrEqual(43)
  })

  test('hashSessionToken should be deterministic', () => {
    const token = 'opaque-token-value'

    expect(hashSessionToken(token)).toBe(hashSessionToken(token))
    expect(hashSessionToken(token)).not.toBe(hashSessionToken(`${token}-2`))
  })

  test('createSessionExpiry should honor ttl days', () => {
    const now = new Date('2026-03-09T00:00:00.000Z')

    expect(createSessionExpiry(now, 7).toISOString()).toBe('2026-03-16T00:00:00.000Z')
  })
})
