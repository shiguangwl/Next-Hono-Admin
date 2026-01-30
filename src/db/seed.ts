/**
 * 数据库初始化脚本（CLI）
 * 使用方式: pnpm db:seed
 */

import 'dotenv/config'
import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'
import { env } from '@/env'
import { runSeed } from './seed-runner'

const DATABASE_URL = env.DATABASE_URL

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL 环境变量未设置')
  process.exit(1)
}

async function main() {
  console.log('🌱 开始初始化数据...')

  const pool = mysql.createPool({ uri: DATABASE_URL })
  const db = drizzle(pool, { mode: 'default' })

  try {
    await runSeed(db)

    console.log('\n🎉 数据初始化完成!')
    console.log('   登录账号: admin')
    console.log('   默认密码: admin123')
  } catch (error) {
    console.error('❌ 数据初始化失败:', error)
    throw error
  } finally {
    await pool.end()
  }
}

main()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))
