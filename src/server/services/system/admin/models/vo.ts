/**
 * 管理员 - 输出模型
 */

/** 管理员 VO */
export interface AdminVo {
  id: number
  username: string
  nickname: string
  status: number
  loginIp: string | null
  loginTime: string | null
  remark: string | null
  createdAt: string
  updatedAt: string
  roles?: { id: number; roleName: string }[]
}
