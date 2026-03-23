import { drizzle, type MySql2Database } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'
import { env } from '@/env'
import { logger } from '@/lib/logging'
import * as schema from './schema'
import { runSeed } from './seed-runner'

/**
 * 数据库类型定义
 */
type Database = MySql2Database<typeof schema>

/**
 * 全局单例（防止 HMR 时重复创建连接）
 */
declare global {
  var __dbPool: mysql.Pool | undefined
  var __db: Database | undefined
  var __dbInitialized: boolean | undefined
}

function createPool(): mysql.Pool {
  const pool = mysql.createPool({
    uri: env.DATABASE_URL,
    waitForConnections: true,
    connectionLimit: env.DATABASE_MAX_CONNECTIONS,
    idleTimeout: env.DATABASE_IDLE_TIMEOUT * 1000,
    connectTimeout: env.DATABASE_CONNECT_TIMEOUT * 1000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
    timezone: 'local',
  })

  return pool
}

export const pool = globalThis.__dbPool ?? createPool()
export const db = globalThis.__db ?? drizzle({ client: pool, schema, mode: 'default' })

if (env.NODE_ENV !== 'production') {
  globalThis.__dbPool = pool
  globalThis.__db = db
}

const MAX_RETRIES = 3
const RETRY_DELAY_MS = 2000

async function runMigration(): Promise<void> {
  const { migrate } = await import('drizzle-orm/mysql2/migrator')
  await migrate(db, { migrationsFolder: 'drizzle' })
}

function elapsed(since: number): number {
  return Math.round(performance.now() - since)
}

// WHY: Docker Compose 等场景下 DB 可能晚于 App 启动，需要重试
async function verifyConnection(): Promise<void> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await pool.query('SELECT 1')
      return
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      logger.warn('[DB] Connection attempt failed', {
        attempt,
        maxRetries: MAX_RETRIES,
        error: msg,
      })
      if (attempt === MAX_RETRIES) {
        throw new Error(`[DB] Unable to connect after ${MAX_RETRIES} attempts: ${msg}`)
      }
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS))
    }
  }
}

async function runInitSteps(): Promise<void> {
  if (env.AUTO_DB_MIGRATE) {
    logger.info('[DB] Running migrations...')
    const t = performance.now()
    await runMigration()
    logger.info('[DB] Migrations completed', { durationMs: elapsed(t) })
  }

  if (env.AUTO_DB_SEED) {
    logger.info('[DB] Running seed...')
    const t = performance.now()
    await runSeed(db)
    logger.info('[DB] Seed completed', { durationMs: elapsed(t) })
  }
}

export async function ensureDatabaseInitialized(): Promise<void> {
  if (globalThis.__dbInitialized) return

  const startTime = performance.now()

  try {
    await verifyConnection()
    logger.info('[DB] Connection verified')

    if (env.AUTO_DB_MIGRATE || env.AUTO_DB_SEED) {
      await runInitSteps()
    }

    globalThis.__dbInitialized = true
    logger.info('[DB] Initialization completed', {
      durationMs: elapsed(startTime),
    })
  } catch (err) {
    logger.fatal('[DB] Initialization failed', {
      err: err instanceof Error ? err : undefined,
      error: err instanceof Error ? err.message : String(err),
      durationMs: elapsed(startTime),
    })
    throw err
  }
}
