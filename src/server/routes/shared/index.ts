/**
 * 共享模块统一导出
 * @description 提供路由定义所需的所有共享工具
 */

// ========== Re-exports ==========
export { createRoute } from '@hono/zod-openapi'
// ========== CRUD Factory ==========
export type {
  AuditConfig,
  CrudHandlers,
  CrudRouterConfig,
  CrudRoutes,
  CrudRoutesConfig,
} from './crud'
export { createCrudRouter, createCrudRoutes } from './crud'
// ========== Responses ==========
export {
  authResponses,
  conflictResponse,
  createResponses,
  emptySuccessResponse,
  // 基础预设
  errorResponses,
  mutationResponses,
  // 动态工厂
  notFoundResponse,
  // 组合预设
  queryResponses,
  // Builder
  ResponsesBuilder,
  responses,
  successResponse,
} from './responses'
// ========== Schemas ==========
export {
  createDataResponseSchema,
  createPaginatedSchema,
  type ErrorResponse,
  // Common
  ErrorSchema,
  type IdParam,
  IdParamSchema,
  type PaginationMeta,
  PaginationMetaSchema,
  type PaginationQuery,
  // Pagination
  PaginationQuerySchema,
  type SuccessResponse,
  SuccessSchema,
} from './schemas'
