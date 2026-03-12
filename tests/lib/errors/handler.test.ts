import { afterEach, describe, expect, test, vi } from 'vitest'
import {
  addErrorMonitor,
  ErrorCode,
  type ErrorMonitor,
  InternalServerError,
  mapErrorToResponse,
  ValidationError,
} from '@/lib/errors'

// WHY: 通过 spy monitor 验证 reportError 对消费者的通知行为
function createSpyMonitor() {
  const captureError = vi.fn()
  const monitor: ErrorMonitor = { captureError }
  addErrorMonitor(monitor)
  return { captureError }
}

describe('mapErrorToResponse', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('应保留 4xx 校验错误详情，不触发 monitor（操作性错误）', () => {
    const spy = createSpyMonitor()

    const response = mapErrorToResponse(
      new ValidationError('请求参数校验失败', {
        issues: [
          {
            path: 'name',
            message: '必填',
            code: 'invalid_type',
            source: 'json',
          },
        ],
      }),
      'req-validation'
    )

    expect(response).toEqual({
      status: 400,
      code: ErrorCode.VALIDATION_ERROR,
      message: '请求参数校验失败',
      details: {
        issues: [
          {
            path: 'name',
            message: '必填',
            code: 'invalid_type',
            source: 'json',
          },
        ],
      },
      requestId: 'req-validation',
    })
    expect(spy.captureError).not.toHaveBeenCalled()
  })

  test('应对 5xx 做脱敏并通知 monitor', () => {
    const spy = createSpyMonitor()

    const response = mapErrorToResponse(new InternalServerError('数据库连接串泄露'), 'req-500')

    expect(response).toEqual({
      status: 500,
      code: ErrorCode.INTERNAL_ERROR,
      message: '服务器内部错误',
      details: undefined,
      requestId: 'req-500',
    })
    expect(spy.captureError).toHaveBeenCalledWith(
      expect.any(InternalServerError),
      expect.objectContaining({
        requestId: 'req-500',
        code: ErrorCode.INTERNAL_ERROR,
        httpStatus: 500,
      })
    )
  })

  test('应将未知错误转为 500 并通知 monitor', () => {
    const spy = createSpyMonitor()

    const response = mapErrorToResponse(new TypeError('undefined is not a function'), 'req-unknown')

    expect(response).toEqual({
      status: 500,
      code: ErrorCode.INTERNAL_ERROR,
      message: '服务器内部错误',
      requestId: 'req-unknown',
    })
    expect(spy.captureError).toHaveBeenCalledWith(
      expect.any(TypeError),
      expect.objectContaining({ requestId: 'req-unknown' })
    )
  })

  test('应将非 Error 对象包装后通知 monitor', () => {
    const spy = createSpyMonitor()

    const response = mapErrorToResponse('raw string error', 'req-raw')

    expect(response.status).toBe(500)
    expect(response.code).toBe(ErrorCode.INTERNAL_ERROR)
    expect(spy.captureError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ requestId: 'req-raw' })
    )
  })
})
