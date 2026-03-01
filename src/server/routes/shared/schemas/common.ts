import { z } from 'zod'

export const ErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.any().optional(),
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
export type SuccessResponse = z.infer<typeof SuccessSchema>
export type IdParam = z.infer<typeof IdParamSchema>
