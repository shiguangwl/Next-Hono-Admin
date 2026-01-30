import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

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

    // JWT 配置
    JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
    JWT_EXPIRES_IN: z
      .string()
      .regex(
        /^\d+(\.\d+)?\s*(ms|milliseconds?|s|secs?|seconds?|m|mins?|minutes?|h|hrs?|hours?|d|days?|w|weeks?|y|yrs?|years?)$/i,
        'JWT_EXPIRES_IN must be a valid time span (e.g., 60, 1h, 7d, 2 days)'
      )
      .optional()
      .default('7d'),

    // 运行环境
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
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
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
    NODE_ENV: process.env.NODE_ENV,
  },

  /**
   * 跳过验证（仅用于构建时无环境变量的场景）
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
})
