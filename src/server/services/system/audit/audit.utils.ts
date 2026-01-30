/**
 * 审计日志 - 工具函数
 */

import type { sysOperationLog } from '@/db/schema'
import { formatDateToLocal } from '@/lib/utils/date'
import type { OperationLogVo } from './models'

/** 转换为操作日志 VO */
export function toOperationLogVo(log: typeof sysOperationLog.$inferSelect): OperationLogVo {
  return {
    id: log.id,
    adminId: log.adminId,
    adminName: log.adminName,
    module: log.module,
    operation: log.operation,
    description: log.description,
    method: log.method,
    requestMethod: log.requestMethod,
    requestUrl: log.requestUrl,
    requestParams: log.requestParams,
    responseResult: log.responseResult,
    ip: log.ip,
    ipLocation: log.ipLocation,
    userAgent: log.userAgent,
    executionTime: log.executionTime,
    status: log.status,
    errorMsg: log.errorMsg,
    createdAt: formatDateToLocal(log.createdAt) ?? '-',
  }
}
