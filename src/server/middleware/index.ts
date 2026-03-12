/**
 * 中间件统一导出
 */

// 操作日志
export {
  auditLog,
  createAuditLog,
  setLogRecorder,
  type AuditOptions,
  type LogRecorder,
  type OperationLogData,
} from "./audit-log";
// CORS
export { corsMiddleware } from "./cors";
// CSRF
export { csrfMiddleware } from "./csrf";
// 速率限制
export {
  apiRateLimit,
  loginRateLimit,
  rateLimit,
  strictRateLimit,
  type RateLimitOptions,
} from "./rate-limit";
// RBAC 权限
export {
  createLoadPermissions,
  invalidateAllPermissionCache,
  invalidatePermissionCache,
  loadPermissions,
  requireAllPermissions,
  requireAnyPermission,
  requirePermission,
} from "./rbac";
// 会话认证
export { createSessionAuth, requireAuth, sessionAuth } from "./session-auth";
