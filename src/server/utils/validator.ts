import { zValidator as baseZValidator } from '@hono/zod-validator'
import type { ValidationTargets } from 'hono'
import type { ZodIssue, ZodSchema } from 'zod'
import { ValidationError, type ValidationIssue, type ValidationIssueSource } from '@/lib/errors'

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
      throw new ValidationError('请求参数校验失败', {
        issues: formatIssues(result.error.issues, toValidationSource(target)),
      })
    }
  })
}
