/**
 * Schema 模块统一导出
 */

export {
  createDataResponseSchema,
  type ErrorResponse,
  ErrorSchema,
  type IdParam,
  IdParamSchema,
  type SuccessResponse,
  SuccessSchema,
} from './common'

export {
  createPaginatedSchema,
  type PaginationMeta,
  PaginationMetaSchema,
  type PaginationQuery,
  PaginationQuerySchema,
} from './pagination'
