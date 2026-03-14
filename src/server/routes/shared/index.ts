export type {
  AuditConfig,
  CrudHandlers,
  CrudMiddlewareConfig,
  CrudMiddlewares,
} from './crud/router-factory'
export { createCrudMiddlewares } from './crud/router-factory'

export {
  createDataResponseSchema,
  type ErrorResponse,
  ErrorSchema,
  type IdParam,
  IdParamSchema,
  type SuccessResponse,
  SuccessSchema,
  type ValidationErrorDetails,
  ValidationErrorDetailsSchema,
  type ValidationIssue,
  ValidationIssueSchema,
} from './schemas/common'

export {
  type MenuTreeNode,
  type MenuTreeNodeDto,
  MenuTreeNodeSchema,
  MenuTypeEnum,
  type RoleBrief,
  RoleBriefSchema,
} from './schemas/entities'

export {
  createPaginatedSchema,
  type PaginationMeta,
  PaginationMetaSchema,
  type PaginationQuery,
  PaginationQuerySchema,
  type SortablePaginationQuery,
  SortablePaginationQuerySchema,
  type SortQuery,
  SortQuerySchema,
} from './schemas/pagination'
