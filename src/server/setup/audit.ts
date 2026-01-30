/**
 * 审计日志配置模块
 * @description 配置审计日志记录器
 */

import { setLogRecorder } from '@/server/middleware/audit-log'
import { createOperationLog } from '@/server/services'

/**
 * 配置审计日志记录器
 * @description 将审计日志写入数据库
 */
export function setupAuditLogger(): void {
  setLogRecorder(async (data) => {
    await createOperationLog({
      adminId: data.adminId,
      adminName: data.adminName,
      module: data.module,
      operation: data.operation,
      description: data.description,
      method: data.method,
      requestMethod: data.requestMethod,
      requestUrl: data.requestUrl,
      requestParams: data.requestParams,
      ip: data.ip,
      userAgent: data.userAgent,
      executionTime: data.executionTime,
      status: data.status,
      errorMsg: data.errorMsg,
    })
  })
}
