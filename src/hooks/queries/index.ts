/**
 * React Query Hooks 统一导出
 */

export * from "./admins";
export * from "./configs";
export type {
  BasePaginationQuery,
  PaginatedResponse,
  QueryKeys,
  ResourceConfig,
} from "./core";
// Core 模块（供扩展使用）
export {
  createQueryKeys,
  createReadonlyResource,
  createResource,
} from "./core";
export * from "./menus";
export * from "./operation-logs";
export * from "./roles";
