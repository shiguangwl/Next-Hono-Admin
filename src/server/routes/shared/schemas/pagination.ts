/**
 * 分页相关 Schema 定义
 */

import { z } from '@hono/zod-openapi'

/**
 * 分页查询参数 Schema
 */
export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1).openapi({ description: '页码', example: 1 }),
  pageSize: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(20)
    .openapi({ description: '每页数量', example: 20 }),
})

/**
 * 分页元数据 Schema
 */
export const PaginationMetaSchema = z.object({
  total: z.number().openapi({ description: '总记录数', example: 100 }),
  page: z.number().openapi({ description: '当前页码', example: 1 }),
  pageSize: z.number().openapi({ description: '每页数量', example: 20 }),
  totalPages: z.number().openapi({ description: '总页数', example: 5 }),
})

/**
 * 创建分页响应 Schema 工厂函数
 */
export function createPaginatedSchema<T extends z.ZodTypeAny>(itemSchema: T, name: string) {
  return z
    .object({
      items: z.array(itemSchema).openapi({ description: '数据列表' }),
      total: z.number().openapi({ description: '总记录数', example: 100 }),
      page: z.number().openapi({ description: '当前页码', example: 1 }),
      pageSize: z.number().openapi({ description: '每页数量', example: 20 }),
      totalPages: z.number().openapi({ description: '总页数', example: 5 }),
    })
    .openapi(name)
}

// ========== 类型导出 ==========

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>
export type PaginationMeta = z.infer<typeof PaginationMetaSchema>
