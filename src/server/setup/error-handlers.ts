/**
 * 错误处理模块
 * @description 配置全局错误处理和 404 处理
 */

import type { OpenAPIHono } from '@hono/zod-openapi'
import { HTTPException } from 'hono/http-exception'
import { env } from '@/env'
import { mapErrorToResponse } from '@/lib/errors'
import { logger } from '@/lib/logging'
import type { Env } from '@/server/context'

/**
 * 配置全局错误处理
 * @param app - Hono 应用实例
 */
export function setupErrorHandlers(app: OpenAPIHono<Env>): void {
  // 全局错误处理
  app.onError((err, c) => {
    const requestId = c.get('requestId')

    // 处理 HTTPException
    if (err instanceof HTTPException) {
      const message =
        env.NODE_ENV === 'production' && err.status >= 500 ? 'Internal Server Error' : err.message

      // 记录 5xx 错误
      if (err.status >= 500) {
        logger.error('HTTP Exception', {
          requestId,
          status: err.status,
          method: c.req.method,
          path: c.req.path,
          err,
        })
      }

      return c.json(
        {
          code: 'HTTP_ERROR',
          message,
          requestId,
        },
        err.status
      )
    }

    // 处理业务错误（集成日志和监控）
    const errorResponse = mapErrorToResponse(err, requestId)

    return c.json(
      {
        code: errorResponse.code,
        message: errorResponse.message,
        details: errorResponse.details,
        requestId: errorResponse.requestId,
      },
      errorResponse.status as 400 | 401 | 403 | 404 | 409 | 429 | 500
    )
  })

  // 404 处理
  app.notFound((c) => {
    return c.json(
      {
        code: 'NOT_FOUND',
        message: `Route ${c.req.method} ${c.req.path} not found`,
        requestId: c.get('requestId'),
      },
      404
    )
  })
}
