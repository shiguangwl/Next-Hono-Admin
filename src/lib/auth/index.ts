/**
 * 认证模块
 * @description 统一导出所有认证相关功能
 */

// JWT 工具
export { type AdminPayload, signToken, verifyToken } from './jwt'

// 密码工具
export { hashPassword, verifyPassword } from './password'
