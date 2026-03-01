import { z } from 'zod'
import { createPaginatedSchema, PaginationQuerySchema } from '../shared'

export const ConfigTypeSchema = z.enum(['string', 'boolean', 'number', 'json', 'array'])

export const ConfigSchema = z.object({
  id: z.number(),
  configKey: z.string().max(100),
  configValue: z.string().nullable(),
  configType: ConfigTypeSchema,
  configGroup: z.string().max(50),
  configName: z.string().max(100),
  remark: z.string().nullable(),
  isSystem: z.number().int().min(0).max(1),
  status: z.number().int().min(0).max(1),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const ConfigQuerySchema = PaginationQuerySchema.extend({
  group: z.string().optional(),
  status: z.coerce.number().int().min(0).max(1).optional(),
})

export const CreateConfigInputSchema = z.object({
  configKey: z.string().min(1).max(100),
  configValue: z.string().nullable().optional(),
  configType: ConfigTypeSchema.default('string'),
  configGroup: z.string().max(50).default('general'),
  configName: z.string().max(100),
  remark: z.string().max(255).nullable().optional(),
  isSystem: z.number().int().min(0).max(1).optional().default(0),
  status: z.number().int().min(0).max(1).optional().default(1),
})

export const UpdateConfigInputSchema = z.object({
  configKey: z.string().max(100).optional(),
  configValue: z.string().nullable().optional(),
  configType: ConfigTypeSchema.optional(),
  configGroup: z.string().max(50).optional(),
  configName: z.string().max(100).optional(),
  remark: z.string().max(255).nullable().optional(),
  isSystem: z.number().int().min(0).max(1).optional(),
  status: z.number().int().min(0).max(1).optional(),
})

export const UpdateConfigValueInputSchema = z.object({
  configValue: z.string().nullable(),
  configType: ConfigTypeSchema.optional(),
  status: z.number().int().min(0).max(1).optional(),
})

export const PaginatedConfigSchema = createPaginatedSchema(ConfigSchema)

export type Config = z.infer<typeof ConfigSchema>
export type PaginatedConfig = z.infer<typeof PaginatedConfigSchema>
export type ConfigQuery = z.infer<typeof ConfigQuerySchema>
export type CreateConfigInput = z.infer<typeof CreateConfigInputSchema>
export type UpdateConfigInput = z.infer<typeof UpdateConfigInputSchema>
export type UpdateConfigValueInput = z.infer<typeof UpdateConfigValueInputSchema>
