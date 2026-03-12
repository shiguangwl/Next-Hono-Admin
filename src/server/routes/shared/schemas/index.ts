/**
 * Schema 模块统一导出
 */

export {
  ErrorSchema,
  IdParamSchema,
  SuccessSchema,
  ValidationErrorDetailsSchema,
  ValidationIssueSchema,
  createDataResponseSchema,
  type ErrorResponse,
  type IdParam,
  type SuccessResponse,
  type ValidationErrorDetails,
  type ValidationIssue,
} from "./common";

export {
  MenuTreeNodeSchema,
  MenuTypeEnum,
  RoleBriefSchema,
  type MenuTreeNode,
  type MenuTreeNodeDto,
  type RoleBrief,
} from "./entities";

export {
  PaginationMetaSchema,
  PaginationQuerySchema,
  createPaginatedSchema,
  type PaginationMeta,
  type PaginationQuery,
} from "./pagination";
