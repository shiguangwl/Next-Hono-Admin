/**
 * 日志工具
 * @description 基于 Pino 的结构化日志，支持 requestId 上下文和 OTel trace 关联
 */

import pino from 'pino'
import { env } from '@/env'
import { getTraceContext } from '@/lib/telemetry'
import { getRequestContext } from './context'

/**
 * 创建 Pino logger 实例
 * @description 开发环境输出 JSON（通过 CLI 管道 pino-pretty 美化），生产环境输出纯 JSON
 */
function createLogger() {
  const isDev = env.NODE_ENV !== 'production'
  const defaultLevel = isDev ? 'debug' : 'info'

  return pino({
    level: env.LOG_LEVEL ?? defaultLevel,

    // WHY: 防止 password/token/secret 等敏感字段泄漏到日志
    redact: {
      paths: [
        'password',
        'token',
        'secret',
        'apiKey',
        'authorization',
        'cookie',
        '*.password',
        '*.token',
        '*.secret',
        '*.apiKey',
        '*.authorization',
        '*.cookie',
      ],
      censor: '[REDACTED]',
    },

    // 格式化配置
    formatters: {
      level: (label) => ({ level: label }),
      // 优化对象序列化，避免嵌套过深
      bindings: (bindings) => ({
        pid: bindings.pid,
        hostname: bindings.hostname,
      }),
    },

    // WHY: OTel 启用时自动注入 traceId/spanId，使日志与链路追踪关联
    mixin() {
      return getTraceContext() ?? {}
    },

    // WHY: 使用北京时间(UTC+8) ISO 格式，便于国内团队排查问题
    timestamp() {
      const now = new Date()
      const offset = 8 * 60 * 60_000
      const local = new Date(now.getTime() + offset)
      const iso = local.toISOString().replace('Z', '+08:00')
      return `,"time":"${iso}"`
    },

    // 基础字段配置
    base: {
      pid: process.pid,
      hostname: process.env.HOSTNAME || 'localhost',
    },

    // 序列化器：标准化对象格式
    serializers: {
      err: pino.stdSerializers.err,
      req: pino.stdSerializers.req,
      res: pino.stdSerializers.res,
    },
  })
}

/** 根 logger 实例 */
const rootLogger = createLogger()

export type LogMeta = Record<string, unknown>

/** warn/error/fatal 的 meta 类型，引导开发者使用 err key */
export type ErrorLogMeta = LogMeta & { err?: Error }

// WHY: catch(error) { log({ error }) } 是最高频误用，pino 只识别 err key
function normalizeMeta(meta?: LogMeta): Record<string, unknown> {
  if (!meta) return {}
  const { error, ...rest } = meta
  if (error instanceof Error) {
    // WHY: err 已显式设置时，说明开发者用了正确 key，丢弃误命名的 error
    if ('err' in rest) return rest
    return { ...rest, err: error }
  }
  return meta
}

function getContextualLogger(): pino.Logger {
  try {
    const ctx = getRequestContext()
    if (ctx?.requestId) {
      return rootLogger.child({ requestId: ctx.requestId })
    }
  } catch {
    // 不在请求上下文中，使用根 logger
  }
  return rootLogger
}

type PinoLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal'

function emit(level: PinoLevel, msg: string, meta?: LogMeta): void {
  getContextualLogger()[level](normalizeMeta(meta), msg)
}

export const logger = {
  debug(msg: string, meta?: LogMeta): void {
    emit('debug', msg, meta)
  },

  info(msg: string, meta?: LogMeta): void {
    emit('info', msg, meta)
  },

  warn(msg: string, meta?: ErrorLogMeta): void {
    emit('warn', msg, meta)
  },

  error(msg: string, meta?: ErrorLogMeta): void {
    emit('error', msg, meta)
  },

  fatal(msg: string, meta?: ErrorLogMeta): void {
    emit('fatal', msg, meta)
  },

  child(bindings: LogMeta): pino.Logger {
    return rootLogger.child(bindings)
  },
}

/** 导出根 logger 供特殊场景使用 */
export { rootLogger }
