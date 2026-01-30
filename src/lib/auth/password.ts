/**
 * 密码工具
 * @description 提供密码加密和验证功能
 */

import bcrypt from 'bcryptjs'

/** bcrypt 加密轮数 */
const SALT_ROUNDS = 10

/**
 * 加密密码
 * @param password - 原始密码
 * @returns 加密后的哈希值
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

/**
 * 验证密码
 * @param password - 原始密码
 * @param hash - 加密后的哈希值
 * @returns 密码是否匹配
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}
