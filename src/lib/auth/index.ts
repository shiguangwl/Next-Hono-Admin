/**
 * 认证模块
 * @description 统一导出所有认证相关功能
 */

export type AdminPayload = {
  adminId: number
  username: string
}

// 密码工具
export { hashPassword, verifyPassword } from './password'
export { createSessionExpiry, createSessionToken, hashSessionToken } from './session-token'
