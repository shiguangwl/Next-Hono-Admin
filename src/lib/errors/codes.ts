/**
 * 错误码常量
 * @description 提供类型安全的错误码定义，便于前端精确处理错误
 */

export const ErrorCode = {
  // ========== 客户端错误 4xx ==========

  /** 请求参数验证失败 (400) */
  VALIDATION_ERROR: 'VALIDATION_ERROR',

  /** 未登录或登录已过期 (401) */
  UNAUTHORIZED: 'UNAUTHORIZED',

  /** 无权限访问 (403) */
  FORBIDDEN: 'FORBIDDEN',

  /** 资源不存在 (404) */
  NOT_FOUND: 'NOT_FOUND',

  /** 资源冲突（如唯一性约束） (409) */
  CONFLICT: 'CONFLICT',

  /** 请求频率超限 (429) */
  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',

  // ========== 业务错误 ==========

  /** 通用业务错误 (400) */
  BUSINESS_ERROR: 'BUSINESS_ERROR',

  /** 不能删除超级管理员账号 */
  CANNOT_DELETE_SUPER_ADMIN: 'CANNOT_DELETE_SUPER_ADMIN',

  /** 不能删除自己的账号 */
  CANNOT_DELETE_SELF: 'CANNOT_DELETE_SELF',

  /** 不能修改超级管理员的角色 */
  CANNOT_MODIFY_SUPER_ADMIN_ROLES: 'CANNOT_MODIFY_SUPER_ADMIN_ROLES',

  /** 账号已禁用 */
  ACCOUNT_DISABLED: 'ACCOUNT_DISABLED',

  /** 无效的父级菜单 */
  INVALID_PARENT: 'INVALID_PARENT',

  /** 菜单下有子菜单 */
  HAS_CHILDREN: 'HAS_CHILDREN',

  /** 角色已被使用 */
  ROLE_IN_USE: 'ROLE_IN_USE',

  // ========== 服务器错误 5xx ==========

  /** 服务器内部错误 (500) */
  INTERNAL_ERROR: 'INTERNAL_ERROR',

  /** 数据库操作失败 (500) */
  DATABASE_ERROR: 'DATABASE_ERROR',

  /** 外部服务调用失败 (500) */
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',

  /** HTTP错误（兼容HTTPException，逐步淘汰） */
  HTTP_ERROR: 'HTTP_ERROR',
} as const

/**
 * 错误码类型
 */
export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode]
