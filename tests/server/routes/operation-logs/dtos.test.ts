import { describe, expect, test } from 'vitest'
import { LogQuerySchema } from '@/server/routes/operation-logs/dtos'

describe('LogQuerySchema', () => {
  test('should reject invalid datetime filters', () => {
    const result = LogQuerySchema.safeParse({
      startTime: 'not-a-date',
      endTime: '2026-13-99',
    })

    expect(result.success).toBe(false)
  })

  test('should accept valid datetime filters', () => {
    const result = LogQuerySchema.safeParse({
      startTime: '2026-03-09T00:00:00.000Z',
      endTime: '2026-03-10T00:00:00.000Z',
    })

    expect(result.success).toBe(true)
  })
})
