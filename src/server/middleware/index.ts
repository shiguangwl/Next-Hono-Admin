/**
 * Middleware barrel export
 * Re-exports all public APIs from individual middleware modules.
 */

// audit-log
export {
  type AuditOptions,
  auditLog,
  createAuditLog,
  type LogRecorder,
  type OperationLogData,
  setLogRecorder,
} from './audit-log'

// cors
export { corsMiddleware } from './cors'

// csrf
export { csrfMiddleware } from './csrf'

// rate-limit
export {
  apiRateLimit,
  clearRateLimitStore,
  getRateLimitStoreSize,
  loginRateLimit,
  type RateLimitOptions,
  rateLimit,
  strictRateLimit,
} from './rate-limit'

// rbac
export {
  createLoadPermissions,
  getPermissionCacheSize,
  invalidateAllPermissionCache,
  invalidatePermissionCache,
  loadPermissions,
  requireAllPermissions,
  requireAnyPermission,
  requirePermission,
} from './rbac'

// request-context
export { requestContextMiddleware } from './request-context'

// request-logger
export { requestLoggerMiddleware } from './request-logger'

// session-auth
export { createSessionAuth, requireAuth, sessionAuth } from './session-auth'
