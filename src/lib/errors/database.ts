/**
 * 数据库错误处理器
 * @description 将数据库错误转换为友好的业务错误
 */

import type { AppError } from './types'
import { ConflictError, InternalServerError, ValidationError } from './types'

/**
 * MySQL 错误接口
 */
interface MySQLError {
  code?: string
  errno?: number
  sqlMessage?: string
  sql?: string
}

/**
 * 数据库错误处理器
 * @description 识别常见数据库错误并转换为对应的业务错误类型
 * @param err - 数据库抛出的错误对象
 * @returns AppError 子类实例
 */
export function handleDatabaseError(err: unknown): AppError {
  // 确保是对象类型
  if (!err || typeof err !== 'object') {
    return new InternalServerError('数据库操作失败', err)
  }

  const dbError = err as MySQLError

  // ========== 客户端错误（转为 4xx） ==========

  // MySQL 唯一键冲突 (1062)
  if (dbError.code === 'ER_DUP_ENTRY' || dbError.errno === 1062) {
    return new ConflictError('数据已存在，违反唯一性约束')
  }

  // MySQL 外键约束失败 - 引用不存在 (1452)
  if (dbError.code === 'ER_NO_REFERENCED_ROW_2' || dbError.errno === 1452) {
    return new ValidationError('关联的数据不存在')
  }

  // MySQL 外键约束失败 - 被引用无法删除 (1451)
  if (dbError.code === 'ER_ROW_IS_REFERENCED_2' || dbError.errno === 1451) {
    return new ConflictError('数据正在被使用，无法删除')
  }

  // ========== 服务器错误（转为 5xx） ==========

  // 连接错误
  if (dbError.code === 'ECONNREFUSED') {
    return new InternalServerError('数据库连接失败', err)
  }

  // 超时错误
  if (dbError.code === 'ETIMEDOUT') {
    return new InternalServerError('数据库连接超时', err)
  }

  // 访问拒绝（配置错误）
  if (dbError.code === 'ER_ACCESS_DENIED_ERROR' || dbError.errno === 1045) {
    return new InternalServerError('数据库访问拒绝', err)
  }

  // ========== 编程错误（字段/语法错误） ==========

  // 字段不存在
  if (dbError.code === 'ER_BAD_FIELD_ERROR' || dbError.errno === 1054) {
    return new InternalServerError('数据库查询错误：字段不存在', err)
  }

  // SQL 语法错误
  if (dbError.code === 'ER_PARSE_ERROR' || dbError.errno === 1064) {
    return new InternalServerError('数据库查询错误：SQL语法错误', err)
  }

  // 其他未知数据库错误
  return new InternalServerError('数据库操作失败', err)
}
