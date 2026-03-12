import { z } from 'zod'

export const ValidationIssueSchema = z.object({
  path: z.string(),
  message: z.string(),
  code: z.string(),
  source: z.enum(['json', 'form', 'query', 'param', 'header', 'cookie']),
})

export const ValidationErrorDetailsSchema = z.object({
  issues: z.array(ValidationIssueSchema),
})

const ErrorDetailsSchema = z.union([
  ValidationErrorDetailsSchema,
  z.record(z.string(), z.unknown()),
  z.array(z.unknown()),
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
])

export const ErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: ErrorDetailsSchema.optional(),
  requestId: z.string().optional(),
})

export const SuccessSchema = z.object({
  code: z.string(),
  message: z.string().optional(),
  data: z.null(),
})

export const IdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
})

export function createDataResponseSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    code: z.string(),
    message: z.string().optional(),
    data: dataSchema,
  })
}

export type ErrorResponse = z.infer<typeof ErrorSchema>
export type ValidationErrorDetails = z.infer<typeof ValidationErrorDetailsSchema>
export type ValidationIssue = z.infer<typeof ValidationIssueSchema>
export type SuccessResponse = z.infer<typeof SuccessSchema>
export type IdParam = z.infer<typeof IdParamSchema>
