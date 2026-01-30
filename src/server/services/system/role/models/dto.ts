/**
 * 角色 - 输入模型
 */

/** 创建角色输入 */
export interface CreateRoleInput {
  roleName: string
  sort?: number
  status?: number
  remark?: string
  menuIds?: number[]
}

/** 更新角色输入 */
export interface UpdateRoleInput {
  roleName?: string
  sort?: number
  status?: number
  remark?: string
}
