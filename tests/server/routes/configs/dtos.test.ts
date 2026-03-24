import { describe, expect, test } from 'vitest'
import {
  ConfigTypeSchema,
  CreateConfigInputSchema,
  UpdateConfigInputSchema,
} from '@/server/routes/configs/dtos'

describe('CreateConfigInputSchema', () => {
  test('accepts valid input', () => {
    const result = CreateConfigInputSchema.safeParse({
      configKey: 'site.name',
      configValue: 'My Site',
      configType: 'string',
      configGroup: 'general',
      configName: 'Site Name',
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.configKey).toBe('site.name')
      expect(result.data.configValue).toBe('My Site')
      expect(result.data.configType).toBe('string')
      expect(result.data.configGroup).toBe('general')
      expect(result.data.configName).toBe('Site Name')
    }
  })

  test('strips extra isSystem field (zod default behavior)', () => {
    const result = CreateConfigInputSchema.safeParse({
      configKey: 'site.name',
      configValue: 'My Site',
      configName: 'Site Name',
      isSystem: 1,
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).not.toHaveProperty('isSystem')
    }
  })
})

describe('UpdateConfigInputSchema', () => {
  test('accepts valid partial input', () => {
    const result = UpdateConfigInputSchema.safeParse({
      configName: 'Updated Name',
      remark: 'Updated remark',
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.configName).toBe('Updated Name')
      expect(result.data.remark).toBe('Updated remark')
    }
  })

  test('strips isSystem field', () => {
    const result = UpdateConfigInputSchema.safeParse({
      configName: 'Updated Name',
      isSystem: 1,
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).not.toHaveProperty('isSystem')
    }
  })
})

describe('ConfigTypeSchema', () => {
  const validTypes = ['string', 'boolean', 'number', 'json', 'array']

  for (const type of validTypes) {
    test(`accepts "${type}"`, () => {
      const result = ConfigTypeSchema.safeParse(type)
      expect(result.success).toBe(true)
    })
  }

  test('rejects invalid type', () => {
    const result = ConfigTypeSchema.safeParse('object')
    expect(result.success).toBe(false)
  })
})
