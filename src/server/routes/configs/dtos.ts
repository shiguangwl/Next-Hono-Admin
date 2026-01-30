import { z } from '@hono/zod-openapi'
import { createPaginatedSchema, PaginationQuerySchema } from '../shared'

export const ConfigTypeSchema = z.enum(['string', 'boolean', 'number', 'json', 'array']).openapi({
  description: '配置类型',
  example: 'string',
})

export const ConfigSchema = z
  .object({
    id: z.number().openapi({ description: '配置 ID', example: 1 }),
    configKey: z.string().max(100).openapi({ description: '配置键', example: 'site.allow_reg' }),
    configValue: z.string().nullable().openapi({ description: '配置值（原始字符串或 JSON 串）' }),
    configType: ConfigTypeSchema,
    configGroup: z.string().max(50).openapi({ description: '配置分组', example: 'security' }),
    configName: z.string().max(100).openapi({ description: '配置名称', example: '是否允许注册' }),
    remark: z.string().nullable().openapi({ description: '配置说明' }),
    isSystem: z
      .number()
      .int()
      .min(0)
      .max(1)
      .openapi({ description: '是否系统配置：1-是 0-否', example: 0 }),
    status: z
      .number()
      .int()
      .min(0)
      .max(1)
      .openapi({ description: '状态：1-启用 0-停用', example: 1 }),
    createdAt: z.string().openapi({ description: '创建时间', example: '2024-01-01T00:00:00.000Z' }),
    updatedAt: z.string().openapi({ description: '更新时间', example: '2024-01-01T00:00:00.000Z' }),
  })
  .openapi('SysConfig')

export const ConfigQuerySchema = PaginationQuerySchema.extend({
  group: z.string().optional().openapi({ description: '配置分组', example: 'security' }),
  status: z.coerce
    .number()
    .int()
    .min(0)
    .max(1)
    .optional()
    .openapi({ description: '状态：1-启用 0-停用', example: 1 }),
})

export const CreateConfigInputSchema = z
  .object({
    configKey: z
      .string()
      .min(1)
      .max(100)
      .openapi({ description: '配置键', example: 'site.allow_reg' }),
    configValue: z
      .string()
      .nullable()
      .optional()
      .openapi({ description: '配置值（原始字符串或 JSON 串）' }),
    configType: ConfigTypeSchema.default('string'),
    configGroup: z
      .string()
      .max(50)
      .default('general')
      .openapi({ description: '配置分组', example: 'security' }),
    configName: z.string().max(100).openapi({ description: '配置名称', example: '是否允许注册' }),
    remark: z.string().max(255).nullable().optional().openapi({ description: '配置说明' }),
    isSystem: z
      .number()
      .int()
      .min(0)
      .max(1)
      .optional()
      .default(0)
      .openapi({ description: '是否系统配置：1-是 0-否', example: 0 }),
    status: z
      .number()
      .int()
      .min(0)
      .max(1)
      .optional()
      .default(1)
      .openapi({ description: '状态：1-启用 0-停用', example: 1 }),
  })
  .openapi('CreateConfigInput')

export const UpdateConfigInputSchema = z
  .object({
    configKey: z
      .string()
      .max(100)
      .optional()
      .openapi({ description: '配置键', example: 'site.allow_reg' }),
    configValue: z
      .string()
      .nullable()
      .optional()
      .openapi({ description: '配置值（原始字符串或 JSON 串）' }),
    configType: ConfigTypeSchema.optional(),
    configGroup: z
      .string()
      .max(50)
      .optional()
      .openapi({ description: '配置分组', example: 'security' }),
    configName: z
      .string()
      .max(100)
      .optional()
      .openapi({ description: '配置名称', example: '是否允许注册' }),
    remark: z.string().max(255).nullable().optional().openapi({ description: '配置说明' }),
    isSystem: z
      .number()
      .int()
      .min(0)
      .max(1)
      .optional()
      .openapi({ description: '是否系统配置：1-是 0-否', example: 0 }),
    status: z
      .number()
      .int()
      .min(0)
      .max(1)
      .optional()
      .openapi({ description: '状态：1-启用 0-停用', example: 1 }),
  })
  .openapi('UpdateConfigInput')

export const UpdateConfigValueInputSchema = z
  .object({
    configValue: z.string().nullable().openapi({ description: '配置值（原始字符串或 JSON 串）' }),
    configType: ConfigTypeSchema.optional(),
    status: z
      .number()
      .int()
      .min(0)
      .max(1)
      .optional()
      .openapi({ description: '状态：1-启用 0-停用', example: 1 }),
  })
  .openapi('UpdateConfigValueInput')

export const PaginatedConfigSchema = createPaginatedSchema(ConfigSchema, 'PaginatedConfig')

export type Config = z.infer<typeof ConfigSchema>
export type PaginatedConfig = z.infer<typeof PaginatedConfigSchema>
export type ConfigQuery = z.infer<typeof ConfigQuerySchema>
export type CreateConfigInput = z.infer<typeof CreateConfigInputSchema>
export type UpdateConfigInput = z.infer<typeof UpdateConfigInputSchema>
export type UpdateConfigValueInput = z.infer<typeof UpdateConfigValueInputSchema>
