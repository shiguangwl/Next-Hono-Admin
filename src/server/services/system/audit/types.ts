/** 创建操作日志输入 */
export interface CreateOperationLogInput {
  adminId: number | null;
  adminName: string | null;
  module: string | null;
  operation: string | null;
  description: string | null;
  /** HTTP 方法 + 路径，如 "POST /api/admins" */
  action: string | null;
  requestMethod: string | null;
  requestUrl: string | null;
  requestParams: string | null;
  responseResult?: string | null;
  ip: string | null;
  ipLocation?: string | null;
  userAgent: string | null;
  executionTime: number | null;
  status: number;
  errorMsg: string | null;
}

/** 操作日志查询条件 */
export interface OperationLogQuery {
  page?: number;
  pageSize?: number;
  adminId?: number;
  adminName?: string;
  module?: string;
  operation?: string;
  status?: number;
  startTime?: string;
  endTime?: string;
}

/** 操作日志 VO */
export interface OperationLogVo {
  id: number;
  adminId: number | null;
  adminName: string | null;
  module: string | null;
  operation: string | null;
  description: string | null;
  method: string | null;
  requestMethod: string | null;
  requestUrl: string | null;
  requestParams: string | null;
  responseResult: string | null;
  ip: string | null;
  ipLocation: string | null;
  userAgent: string | null;
  executionTime: number | null;
  status: number;
  errorMsg: string | null;
  createdAt: string;
}

/** 日志统计 VO */
export interface LogStatisticsVo {
  total: number;
  successCount: number;
  failCount: number;
}
