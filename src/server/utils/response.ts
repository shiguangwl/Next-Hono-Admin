import type { Context } from 'hono'

export type ApiSuccessResponse<T> = {
  code: 'OK'
  data: T
  message?: string
}

export type EmptyApiSuccessResponse = {
  code: 'OK'
  data: null
  message?: string
}

export const R = {
  ok<T>(c: Context, data: T, message?: string) {
    return c.json({
      code: 'OK',
      data,
      ...(message && { message }),
    })
  },

  success(c: Context, message = '操作成功') {
    return c.json({
      code: 'OK',
      data: null,
      message,
    })
  },
  fail(c: Context, message = '操作失败') {
    return c.json({
      code: 'BAD_REQUEST',
      data: null,
      message,
    })
  },
}
