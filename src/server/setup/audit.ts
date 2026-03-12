/**
 * 审计日志配置模块
 * @description 配置审计日志记录器
 */

import { setLogRecorder } from "@/server/middleware/audit-log";
import { createOperationLog } from "@/server/services";

/**
 * 配置审计日志记录器
 * @description 将审计日志写入数据库
 */
export function setupAuditLogger(): void {
  setLogRecorder(createOperationLog);
}
