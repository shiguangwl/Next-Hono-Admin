/**
 * 角色 - 输出模型
 */

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
