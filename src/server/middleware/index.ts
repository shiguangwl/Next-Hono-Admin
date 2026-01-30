/**
 * 中间件统一导出
 */

// 操作日志
export {
  type AuditOptions,
  auditLog,
  createAuditLog,
  type LogRecorder,
  type OperationLogData,
  setLogRecorder,
} from './audit-log'
// CORS
export { corsMiddleware } from './cors'
// CSRF
export { csrfMiddleware, generateCsrfToken } from './csrf'
// JWT 认证
export { jwtAuth, requireAuth } from './jwt-auth'
// 速率限制
export {
  apiRateLimit,
  loginRateLimit,
  type RateLimitOptions,
  rateLimit,
  strictRateLimit,
} from './rate-limit'
// RBAC 权限
export {
  createLoadPermissions,
  invalidateAllPermissionCache,
  invalidatePermissionCache,
  loadPermissions,
  requireAllPermissions,
  requireAnyPermission,
  requirePermission,
} from './rbac'
