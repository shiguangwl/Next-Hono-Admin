import type { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import { ErrorCode, mapErrorToResponse, reportError } from '@/lib/errors'
import type { Env } from '@/server/context'

export function setupErrorHandlers(app: Hono<Env>): void {
  app.onError(async (err, c) => {
    const requestId = c.get('requestId')

    // Hono 框架内部异常（malformed JSON 等边界情况）
    if (err instanceof HTTPException) {
      if (err.status >= 500) {
        reportError(err, { requestId, httpStatus: err.status })
      }

      if (err.res) {
        const headers = new Headers(err.res.headers)
        if (requestId) headers.set('x-request-id', requestId)

        const contentType = headers.get('content-type') || ''
        if (!contentType.includes('application/json')) {
          return new Response(err.res.body, {
            status: err.res.status,
            statusText: err.res.statusText,
            headers,
          })
        }
        for (const [key, value] of headers.entries()) {
          c.header(key, value)
        }
      } else if (requestId) {
        c.header('x-request-id', requestId)
      }

      const STATUS_TO_CODE: Record<number, string> = {
        401: ErrorCode.UNAUTHORIZED,
        403: ErrorCode.FORBIDDEN,
        404: ErrorCode.NOT_FOUND,
        409: ErrorCode.CONFLICT,
        429: ErrorCode.TOO_MANY_REQUESTS,
      }
      const codeStr = STATUS_TO_CODE[err.status] ?? ErrorCode.HTTP_ERROR
      return c.json(
        {
          code: codeStr,
          message: err.status >= 500 ? '服务器内部错误' : err.message || '请求处理失败',
          requestId,
        },
        err.status as ContentfulStatusCode
      )
    }

    // AppError 及其子类 / 未知错误
    const errorResponse = mapErrorToResponse(err, requestId)
    return c.json(
      {
        code: errorResponse.code,
        message: errorResponse.message,
        details: errorResponse.details,
        requestId: errorResponse.requestId,
      },
      errorResponse.status as ContentfulStatusCode
    )
  })

  app.notFound((c) => {
    return c.json(
      {
        code: ErrorCode.NOT_FOUND,
        message: `Route ${c.req.method} ${c.req.path} not found`,
        requestId: c.get('requestId'),
      },
      404
    )
  })
}
