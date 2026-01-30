/**
 * 权限检查 Hook
 * @description 提供权限检查函数，用于前端权限控制
 */

import { useCallback, useMemo } from 'react'
import { useAuthStore } from './use-auth'

/**
 * 超级管理员权限标识
 */
const SUPER_ADMIN_PERMISSION = '*'

/**
 * 权限检查 Hook
 * @description 提供权限检查函数
 */
export function usePermission() {
  const permissions = useAuthStore((state) => state.permissions)

  /**
   * 检查是否为超级管理员
   */
  const isSuperAdmin = useMemo(() => {
    return permissions.includes(SUPER_ADMIN_PERMISSION)
  }, [permissions])

  /**
   * 检查是否拥有指定权限
   * @param permission 权限标识
   * @returns 是否拥有权限
   */
  const hasPermission = useCallback(
    (permission: string): boolean => {
      // 超级管理员拥有所有权限
      if (isSuperAdmin) {
        return true
      }
      return permissions.includes(permission)
    },
    [permissions, isSuperAdmin]
  )

  /**
   * 检查是否拥有任意一个指定权限
   * @param permissionList 权限标识列表
   * @returns 是否拥有任意一个权限
   */
  const hasAnyPermission = useCallback(
    (permissionList: string[]): boolean => {
      // 超级管理员拥有所有权限
      if (isSuperAdmin) {
        return true
      }
      return permissionList.some((p) => permissions.includes(p))
    },
    [permissions, isSuperAdmin]
  )

  /**
   * 检查是否拥有所有指定权限
   * @param permissionList 权限标识列表
   * @returns 是否拥有所有权限
   */
  const hasAllPermissions = useCallback(
    (permissionList: string[]): boolean => {
      // 超级管理员拥有所有权限
      if (isSuperAdmin) {
        return true
      }
      return permissionList.every((p) => permissions.includes(p))
    },
    [permissions, isSuperAdmin]
  )

  return {
    permissions,
    isSuperAdmin,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  }
}
