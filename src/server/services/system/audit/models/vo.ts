/**
 * 审计日志 - 输出模型
 */

/** 操作日志 VO */
export interface OperationLogVo {
  id: number
  adminId: number | null
  adminName: string | null
  module: string | null
  operation: string | null
  description: string | null
  method: string | null
  requestMethod: string | null
  requestUrl: string | null
  requestParams: string | null
  responseResult: string | null
  ip: string | null
  ipLocation: string | null
  userAgent: string | null
  executionTime: number | null
  status: number
  errorMsg: string | null
  createdAt: string
}

/** 日志统计 VO */
export interface LogStatisticsVo {
  total: number
  successCount: number
  failCount: number
}
