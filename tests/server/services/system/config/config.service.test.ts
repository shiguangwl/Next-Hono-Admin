import { describe, expect, test } from 'vitest'
import { ValidationError } from '@/lib/errors'
import { validateConfigValue } from '@/server/services/system/config/config.utils'
import type { ConfigValueType } from '@/server/services/system/config/types'

const ALL_TYPES: ConfigValueType[] = ['string', 'boolean', 'number', 'json', 'array']

describe('validateConfigValue', () => {
  // ---------- 1. null value returns null for all types ----------

  test('returns null when value is null for all types', () => {
    for (const type of ALL_TYPES) {
      expect(validateConfigValue(null, type)).toBeNull()
    }
  })

  // ---------- 2. string type: any string returns as-is ----------

  test('string type: returns any string as-is', () => {
    expect(validateConfigValue('hello', 'string')).toBe('hello')
    expect(validateConfigValue('', 'string')).toBe('')
    expect(validateConfigValue('any weird value !@#$', 'string')).toBe('any weird value !@#$')
  })

  // ---------- 3. boolean type: valid values return as-is ----------

  test('boolean type: accepts "true", "1", "false", "0"', () => {
    expect(validateConfigValue('true', 'boolean')).toBe('true')
    expect(validateConfigValue('1', 'boolean')).toBe('1')
    expect(validateConfigValue('false', 'boolean')).toBe('false')
    expect(validateConfigValue('0', 'boolean')).toBe('0')
  })

  // ---------- 4. boolean type: invalid value throws ValidationError ----------

  test('boolean type: throws ValidationError for invalid value', () => {
    expect(() => validateConfigValue('invalid', 'boolean')).toThrow(ValidationError)
  })

  // ---------- 5. number type: valid values return as-is ----------

  test('number type: accepts "42", "3.14", "0"', () => {
    expect(validateConfigValue('42', 'number')).toBe('42')
    expect(validateConfigValue('3.14', 'number')).toBe('3.14')
    expect(validateConfigValue('0', 'number')).toBe('0')
  })

  // ---------- 6. number type: invalid value throws ValidationError ----------

  test('number type: throws ValidationError for non-numeric string', () => {
    expect(() => validateConfigValue('abc', 'number')).toThrow(ValidationError)
  })

  // ---------- 7. json type: valid JSON returns as-is ----------

  test('json type: accepts valid JSON object string', () => {
    const input = '{"key": "value"}'
    expect(validateConfigValue(input, 'json')).toBe(input)
  })

  // ---------- 8. json type: invalid JSON throws ValidationError ----------

  test('json type: throws ValidationError for non-JSON string', () => {
    expect(() => validateConfigValue('not json', 'json')).toThrow(ValidationError)
  })

  // ---------- 9. array type: valid JSON array returns as-is ----------

  test('array type: accepts valid JSON array string', () => {
    const input = '[1, 2, 3]'
    expect(validateConfigValue(input, 'array')).toBe(input)
  })

  // ---------- 10. array type: non-array JSON throws ValidationError ----------

  test('array type: throws ValidationError when parsed value is not an array', () => {
    const input = '{"not": "array"}'
    expect(() => validateConfigValue(input, 'array')).toThrow(ValidationError)
  })
})
