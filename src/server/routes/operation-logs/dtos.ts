import { z } from 'zod'
import { createPaginatedSchema, PaginationQuerySchema } from '../shared'

export const OperationLogSchema = z.object({
  id: z.number(),
  adminId: z.number().nullable(),
  adminName: z.string().nullable(),
  module: z.string().nullable(),
  operation: z.string().nullable(),
  description: z.string().nullable(),
  method: z.string().nullable(),
  requestMethod: z.string().nullable(),
  requestUrl: z.string().nullable(),
  requestParams: z.string().nullable(),
  responseResult: z.string().nullable(),
  ip: z.string().nullable(),
  ipLocation: z.string().nullable(),
  userAgent: z.string().nullable(),
  executionTime: z.number().nullable(),
  status: z.number(),
  errorMsg: z.string().nullable(),
  createdAt: z.string(),
})

export const LogQuerySchema = PaginationQuerySchema.extend({
  adminId: z.coerce.number().int().positive().optional(),
  adminName: z.string().optional(),
  module: z.string().optional(),
  operation: z.string().optional(),
  status: z.coerce.number().int().min(0).max(1).optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
})

export const PaginatedOperationLogSchema = createPaginatedSchema(OperationLogSchema)

export type OperationLog = z.infer<typeof OperationLogSchema>
export type LogQuery = z.infer<typeof LogQuerySchema>
