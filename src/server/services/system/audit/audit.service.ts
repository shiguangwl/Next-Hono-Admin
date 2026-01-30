/**
 * 审计日志服务
 */

import { and, count, desc, eq, gte, like, lte, sql } from 'drizzle-orm'
import { db } from '@/db'
import { sysOperationLog } from '@/db/schema'
import { NotFoundError } from '@/lib/errors'
import type { PaginatedResult } from '@/server/utils/shared'
import { toOperationLogVo } from './audit.utils'
import type { CreateOperationLogInput, OperationLogQuery, OperationLogVo } from './models'

/** 创建操作日志 */
export async function createOperationLog(input: CreateOperationLogInput): Promise<void> {
  await db.insert(sysOperationLog).values({
    adminId: input.adminId,
    adminName: input.adminName,
    module: input.module,
    operation: input.operation,
    description: input.description,
    method: input.method,
    requestMethod: input.requestMethod,
    requestUrl: input.requestUrl,
    requestParams: input.requestParams,
    responseResult: input.responseResult,
    ip: input.ip,
    ipLocation: input.ipLocation,
    userAgent: input.userAgent,
    executionTime: input.executionTime,
    status: input.status,
    errorMsg: input.errorMsg,
  })
}

/** 获取操作日志列表（分页） */
export async function getOperationLogList(
  options: OperationLogQuery = {}
): Promise<PaginatedResult<OperationLogVo>> {
  const {
    page = 1,
    pageSize = 20,
    adminId,
    adminName,
    module,
    operation,
    status,
    startTime,
    endTime,
  } = options
  const offset = (page - 1) * pageSize

  const conditions = []

  if (adminId !== undefined) {
    conditions.push(eq(sysOperationLog.adminId, adminId))
  }
  if (adminName) {
    conditions.push(like(sysOperationLog.adminName, `%${adminName}%`))
  }
  if (module) {
    conditions.push(eq(sysOperationLog.module, module))
  }
  if (operation) {
    conditions.push(eq(sysOperationLog.operation, operation))
  }
  if (status !== undefined) {
    conditions.push(eq(sysOperationLog.status, status))
  }
  if (startTime) {
    conditions.push(gte(sysOperationLog.createdAt, new Date(startTime)))
  }
  if (endTime) {
    conditions.push(lte(sysOperationLog.createdAt, new Date(endTime)))
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined

  const [{ total }] = await db.select({ total: count() }).from(sysOperationLog).where(whereClause)

  const logs = await db
    .select()
    .from(sysOperationLog)
    .where(whereClause)
    .orderBy(desc(sysOperationLog.createdAt))
    .limit(pageSize)
    .offset(offset)

  return {
    items: logs.map(toOperationLogVo),
    total,
    page,
    pageSize,
    totalPages: total === 0 ? 0 : Math.ceil(total / pageSize),
  }
}

/** 获取操作日志详情 */
export async function getOperationLogById(id: number): Promise<OperationLogVo> {
  const log = await db
    .select()
    .from(sysOperationLog)
    .where(eq(sysOperationLog.id, id))
    .limit(1)
    .then((rows) => rows[0])

  if (!log) {
    throw new NotFoundError('OperationLog', id)
  }

  return toOperationLogVo(log)
}

/** 删除操作日志 */
export async function deleteOperationLog(id: number): Promise<void> {
  const existing = await db
    .select({ id: sysOperationLog.id })
    .from(sysOperationLog)
    .where(eq(sysOperationLog.id, id))
    .limit(1)
    .then((rows) => rows[0])

  if (!existing) {
    throw new NotFoundError('OperationLog', id)
  }

  await db.delete(sysOperationLog).where(eq(sysOperationLog.id, id))
}

/** 批量删除操作日志 */
export async function batchDeleteOperationLogs(ids: number[]): Promise<void> {
  if (ids.length === 0) return

  await db.delete(sysOperationLog).where(
    sql`${sysOperationLog.id} IN (${sql.join(
      ids.map((id) => sql`${id}`),
      sql`, `
    )})`
  )
}

/** 清理过期日志 */
export async function cleanExpiredLogs(days: number): Promise<number> {
  const expireDate = new Date()
  expireDate.setDate(expireDate.getDate() - days)

  const result = await db.delete(sysOperationLog).where(lte(sysOperationLog.createdAt, expireDate))

  return result[0]?.affectedRows ?? 0
}

/** 获取日志统计信息 */
export async function getLogStatistics(): Promise<{
  total: number
  successCount: number
  failCount: number
}> {
  const [stats] = await db
    .select({
      total: count(),
      successCount: sql<number>`SUM(CASE WHEN ${sysOperationLog.status} = 1 THEN 1 ELSE 0 END)`,
      failCount: sql<number>`SUM(CASE WHEN ${sysOperationLog.status} = 0 THEN 1 ELSE 0 END)`,
    })
    .from(sysOperationLog)

  return {
    total: stats.total,
    successCount: Number(stats.successCount) || 0,
    failCount: Number(stats.failCount) || 0,
  }
}
