import { zValidator as baseZValidator } from '@hono/zod-validator'
import type { ValidationTargets } from 'hono'
import type { ZodIssue, ZodSchema } from 'zod'
import { ValidationError, type ValidationIssue, type ValidationIssueSource } from '@/lib/errors'
import { logger } from '@/lib/logging'

function toValidationSource(target: keyof ValidationTargets): ValidationIssueSource {
  if (target === 'json' || target === 'form' || target === 'query') {
    return target
  }

  return target === 'param' || target === 'header' || target === 'cookie' ? target : 'json'
}

function formatIssues(issues: ZodIssue[], source: ValidationIssueSource): ValidationIssue[] {
  return issues.map((issue) => ({
    path: issue.path.map(String).join('.') || source,
    message: issue.message,
    code: issue.code,
    source,
  }))
}

export const zValidator = <T extends ZodSchema, Target extends keyof ValidationTargets>(
  target: Target,
  schema: T
) => {
  return baseZValidator(target, schema, (result) => {
    if (!result.success) {
      const source = toValidationSource(target)
      const issues = formatIssues(result.error.issues, source)

      // WHY: 开发环境打印原始数据和校验原因，便于快速排查参数问题
      logger.debug('参数校验失败', {
        source: target,
        rawData: result.data,
        issues,
      })

      throw new ValidationError('请求参数校验失败', { issues })
    }
  })
}
