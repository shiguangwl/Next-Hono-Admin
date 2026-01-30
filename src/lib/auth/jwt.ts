/**
 * JWT 工具
 * @description 提供 JWT Token 的签发和验证功能
 */

import jwt from 'jsonwebtoken'
import type { StringValue } from 'ms'
import { env } from '@/env'

/**
 * JWT Payload 类型
 */
export interface AdminPayload {
  adminId: number
  username: string
}

/**
 * 签发 JWT Token
 * @param payload - Token 载荷
 * @returns 签发的 JWT Token
 */
export function signToken(payload: AdminPayload): string {
  // env.JWT_EXPIRES_IN 已通过 Zod 验证，确保格式正确
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as StringValue,
  })
}

/**
 * 验证 JWT Token
 * @param token - 待验证的 Token
 * @returns 解码后的 Payload，验证失败返回 null
 */
export function verifyToken(token: string): AdminPayload | null {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AdminPayload
    return decoded
  } catch {
    return null
  }
}
