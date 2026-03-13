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

/** 角色 VO */
export interface RoleVo {
  id: number
  roleName: string
  sort: number
  status: number
  remark: string | null
  createdAt: string
  updatedAt: string
  menuIds?: number[]
}
