import type { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { env } from '@/env'
import { mapErrorToResponse } from '@/lib/errors'
import { logger } from '@/lib/logging'
import type { Env } from '@/server/context'

export function setupErrorHandlers(app: Hono<Env>): void {
  app.onError((err, c) => {
    const requestId = c.get('requestId')

    if (err instanceof HTTPException) {
      const message =
        env.NODE_ENV === 'production' && err.status >= 500 ? 'Internal Server Error' : err.message

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
        { code: 'HTTP_ERROR', message, requestId },
        err.status
      )
    }

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
