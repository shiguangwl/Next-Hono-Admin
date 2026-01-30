/**
 * 通用 Schema 定义
 * @description API 响应的基础结构定义
 */

import { z } from '@hono/zod-openapi'

/**
 * 错误响应 Schema
 */
export const ErrorSchema = z
  .object({
    code: z.string().openapi({ description: '错误代码', example: 'NOT_FOUND' }),
    message: z.string().openapi({ description: '错误消息', example: '资源不存在' }),
    details: z.any().optional().openapi({ description: '错误详情' }),
    requestId: z.string().optional().openapi({ description: '请求 ID' }),
  })
  .openapi('Error')

/**
 * 成功响应 Schema（无数据）
 */
export const SuccessSchema = z
  .object({
    code: z.string().openapi({ description: '业务状态码', example: 'OK' }),
    message: z.string().optional().openapi({ description: '成功消息' }),
    data: z.null().openapi({ description: '无业务数据时固定为 null', example: null }),
  })
  .openapi('Success')

/**
 * ID 参数 Schema
 */
export const IdParamSchema = z.object({
  id: z.coerce.number().int().positive().openapi({ description: '资源 ID', example: 1 }),
})

/**
 * 创建数据响应 Schema 工厂函数
 */
export function createDataResponseSchema<T extends z.ZodTypeAny>(dataSchema: T, name: string) {
  return z
    .object({
      code: z.string().openapi({ description: '业务状态码', example: 'OK' }),
      message: z.string().optional().openapi({ description: '提示信息' }),
      data: dataSchema.openapi({ description: '业务数据' }),
    })
    .openapi(name)
}

// ========== 类型导出 ==========

export type ErrorResponse = z.infer<typeof ErrorSchema>
export type SuccessResponse = z.infer<typeof SuccessSchema>
export type IdParam = z.infer<typeof IdParamSchema>
