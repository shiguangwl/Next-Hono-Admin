import { env } from "@/env";
import { logger } from "@/lib/logging";
import { drizzle, type MySql2Database } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";
import { runSeed } from "./seed-runner";

/**
 * 数据库类型定义
 */
type Database = MySql2Database<typeof schema>;

/**
 * 全局单例（防止 HMR 时重复创建连接）
 */
declare global {
  var __dbPool: mysql.Pool | undefined;
  var __db: Database | undefined;
  var __dbInitialized: boolean | undefined;
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
    timezone: "local",
  });

  return pool;
}

export const pool = globalThis.__dbPool ?? createPool();
export const db =
  globalThis.__db ?? drizzle({ client: pool, schema, mode: "default" });

if (env.NODE_ENV !== "production") {
  globalThis.__dbPool = pool;
  globalThis.__db = db;
}

/**
 * 执行数据库迁移
 */
async function runMigration(): Promise<void> {
  const { migrate } = await import("drizzle-orm/mysql2/migrator");
  await migrate(db, { migrationsFolder: "drizzle" });
}

/**
 * 确保数据库已初始化
 */
export async function ensureDatabaseInitialized(): Promise<void> {
  if (!env.AUTO_DB_MIGRATE && !env.AUTO_DB_SEED) return;
  if (globalThis.__dbInitialized) return;

  logger.info("[DB] Starting database initialization...");
  const startTime = performance.now();

  if (env.AUTO_DB_MIGRATE) {
    logger.info("[DB] Running migrations...");
    const migrateStart = performance.now();
    await runMigration();
    const ms = Math.round(performance.now() - migrateStart);
    if (env.NODE_ENV !== "production") {
      logger.info(`[DB] Migrations completed (${ms}ms)`);
    } else {
      logger.info("[DB] Migrations completed", { durationMs: ms });
    }
  }

  if (env.AUTO_DB_SEED) {
    logger.info("[DB] Running seed...");
    const seedStart = performance.now();
    await runSeed(db);
    const ms = Math.round(performance.now() - seedStart);
    if (env.NODE_ENV !== "production") {
      logger.info(`[DB] Seed completed (${ms}ms)`);
    } else {
      logger.info("[DB] Seed completed", { durationMs: ms });
    }
  }

  globalThis.__dbInitialized = true;
  const ms = Math.round(performance.now() - startTime);
  if (env.NODE_ENV !== "production") {
    logger.info(`[DB] Database initialization completed (${ms}ms)`);
  } else {
    logger.info("[DB] Database initialization completed", { durationMs: ms });
  }
}
