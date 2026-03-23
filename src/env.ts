import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

import { DEFAULT_SESSION_COOKIE_NAME } from './lib/constants.ts'

const DEFAULT_SESSION_TTL_DAYS = 7

export const env = createEnv({
  /**
   * 服务端环境变量
   */
  server: {
    // 数据库配置
    DATABASE_URL: z.string().url(),
    DATABASE_MAX_CONNECTIONS: z.coerce.number().int().positive().optional().default(10),
    DATABASE_IDLE_TIMEOUT: z.coerce.number().int().positive().optional().default(20),
    DATABASE_CONNECT_TIMEOUT: z.coerce.number().int().positive().optional().default(10),
    AUTO_DB_MIGRATE: z
      .enum(['true', 'false'])
      .optional()
      .default('false')
      .transform((v) => v === 'true'),
    AUTO_DB_SEED: z
      .enum(['true', 'false'])
      .optional()
      .default('false')
      .transform((v) => v === 'true'),

    // 会话配置
    SESSION_COOKIE_NAME: z.string().min(1).optional().default(DEFAULT_SESSION_COOKIE_NAME),
    SESSION_TTL_DAYS: z.coerce
      .number()
      .int()
      .positive()
      .max(30)
      .optional()
      .default(DEFAULT_SESSION_TTL_DAYS),
    COOKIE_SECURE: z
      .enum(['true', 'false'])
      .optional()
      .transform((v) => (v !== undefined ? v === 'true' : undefined)),

    // CORS 配置
    CORS_ORIGINS: z
      .string()
      .optional()
      .default('')
      .transform((v) =>
        v
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      ),

    // 运行环境
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

    // 日志级别（默认：开发=debug，生产=info）
    LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).optional(),
  },

  /**
   * 客户端环境变量(NEXT_PUBLIC_ 前缀)
   */
  client: {},

  /**
   * 运行时环境变量映射
   */
  runtimeEnv: {
    // 服务端
    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_MAX_CONNECTIONS: process.env.DATABASE_MAX_CONNECTIONS,
    DATABASE_IDLE_TIMEOUT: process.env.DATABASE_IDLE_TIMEOUT,
    DATABASE_CONNECT_TIMEOUT: process.env.DATABASE_CONNECT_TIMEOUT,
    AUTO_DB_MIGRATE: process.env.AUTO_DB_MIGRATE,
    AUTO_DB_SEED: process.env.AUTO_DB_SEED,
    SESSION_COOKIE_NAME: process.env.SESSION_COOKIE_NAME,
    SESSION_TTL_DAYS: process.env.SESSION_TTL_DAYS,
    CORS_ORIGINS: process.env.CORS_ORIGINS,
    NODE_ENV: process.env.NODE_ENV,
    LOG_LEVEL: process.env.LOG_LEVEL,
    COOKIE_SECURE: process.env.COOKIE_SECURE,
  },

  /**
   * 跳过验证（仅用于构建时无环境变量的场景）
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
})
