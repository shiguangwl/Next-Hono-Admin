/**
 * 管理员 - 输入模型
 */

/** 创建管理员输入 */
export interface CreateAdminInput {
  username: string
  password: string
  nickname?: string
  status?: number
  remark?: string
  roleIds?: number[]
}

/** 更新管理员输入 */
export interface UpdateAdminInput {
  nickname?: string
  status?: number
  remark?: string
}
