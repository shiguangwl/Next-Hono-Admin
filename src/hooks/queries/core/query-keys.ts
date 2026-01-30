/**
 * Query Key 工厂
 * @description 集中管理所有 Query Keys，确保类型安全和一致性
 */

import type { QueryKeys } from "./types";

/**
 * 创建资源的 Query Keys
 */
export function createQueryKeys(resourceName: string): QueryKeys {
  return {
    all: [resourceName] as const,
    lists: () => [resourceName, "list"] as const,
    list: <P extends Record<string, unknown>>(params?: P) =>
      [resourceName, "list", params] as const,
    details: () => [resourceName, "detail"] as const,
    detail: (id: number) => [resourceName, "detail", id] as const,
  };
}

/**
 * 预定义的资源 Query Keys
 */
export const queryKeys = {
  admins: createQueryKeys("admins"),
  roles: createQueryKeys("roles"),
  menus: createQueryKeys("menus"),
  configs: createQueryKeys("configs"),
  operationLogs: createQueryKeys("operation-logs"),
} as const;
