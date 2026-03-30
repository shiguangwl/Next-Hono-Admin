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

/** 日志元数据类型 */
export type LogMeta = Record<string, unknown>

/**
 * 获取带请求上下文的 logger
 * 自动注入 requestId（如果在请求上下文中）
 */
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

/**
 * 日志记录器
 * 自动注入请求上下文中的 requestId
 */
export const logger = {
  /**
   * 调试日志（仅开发环境）
   */
  debug(msg: string, meta?: LogMeta): void {
    getContextualLogger().debug(meta ?? {}, msg)
  },

  /**
   * 信息日志
   */
  info(msg: string, meta?: LogMeta): void {
    getContextualLogger().info(meta ?? {}, msg)
  },

  /**
   * 警告日志
   */
  warn(msg: string, meta?: LogMeta): void {
    getContextualLogger().warn(meta ?? {}, msg)
  },

  /**
   * 错误日志
   */
  error(msg: string, meta?: LogMeta & { err?: Error }): void {
    const log = getContextualLogger()
    if (meta?.err) {
      // Pino 会自动序列化 Error 对象（包含 stack）
      log.error({ ...meta, err: meta.err }, msg)
    } else {
      log.error(meta ?? {}, msg)
    }
  },

  /**
   * 创建子 logger（用于模块级日志）
   */
  child(bindings: LogMeta): pino.Logger {
    return rootLogger.child(bindings)
  },

  /**
   * 致命错误（进程级崩溃）
   */
  fatal(msg: string, meta?: LogMeta & { err?: Error }): void {
    const log = getContextualLogger()
    if (meta?.err) {
      log.fatal({ ...meta, err: meta.err }, msg)
    } else {
      log.fatal(meta ?? {}, msg)
    }
  },
}

/** 导出根 logger 供特殊场景使用 */
export { rootLogger }
