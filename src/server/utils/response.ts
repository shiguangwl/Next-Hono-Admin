import { AsyncLocalStorage } from 'node:async_hooks'
import type { Context } from 'hono'

const contextStorage = new AsyncLocalStorage<Context>()

export const contextMiddleware = async (c: Context, next: () => Promise<void>) => {
  return contextStorage.run(c, next)
}

const getContext = (): Context => {
  const c = contextStorage.getStore()
  if (!c) {
    throw new Error(
      '❌ Context not found! 请确保已注册 contextMiddleware:\n' + "app.use('*', contextMiddleware)"
    )
  }
  return c
}

export const SuccessCode = {
  OK: 'OK',
} as const

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
  ok<T>(data: T, message?: string) {
    const c = getContext()
    return c.json(
      {
        code: SuccessCode.OK,
        data,
        ...(message && { message }),
      },
      200
    )
  },

  created<T>(data: T, message = '创建成功') {
    const c = getContext()
    return c.json(
      {
        code: SuccessCode.OK,
        data,
        message,
      },
      201
    )
  },

  success(message = '操作成功') {
    const c = getContext()
    return c.json(
      {
        code: SuccessCode.OK,
        data: null,
        message,
      },
      200
    )
  },
}
