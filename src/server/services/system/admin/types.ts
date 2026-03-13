/** 创建管理员输入 */
export interface CreateAdminInput {
  username: string;
  password: string;
  nickname?: string;
  status?: number;
  remark?: string;
  roleIds?: number[];
}

/** 更新管理员输入 */
export interface UpdateAdminInput {
  nickname?: string;
  status?: number;
  remark?: string;
}

/** 管理员 VO */
export interface AdminVo {
  id: number;
  username: string;
  nickname: string;
  status: number;
  loginIp: string | null;
  loginTime: string | null;
  remark: string | null;
  createdAt: string;
  updatedAt: string;
  roles?: { id: number; roleName: string }[];
}
