/**
 * 认证路由 DTO 定义
 * @description 登录、登出、获取认证信息的请求/响应 Schema
 */

import { z } from '@hono/zod-openapi'

// ========== 基础 Schema ==========

/**
 * 角色简要信息 Schema
 */
export const RoleBriefSchema = z.object({
  id: z.number().openapi({ description: '角色 ID', example: 1 }),
  roleName: z.string().openapi({ description: '角色名称', example: '超级管理员' }),
})

/**
 * 管理员信息 Schema（不含密码）
 */
export const AdminInfoSchema = z
  .object({
    id: z.number().openapi({ description: '管理员 ID', example: 1 }),
    username: z.string().openapi({ description: '用户名', example: 'admin' }),
    nickname: z.string().openapi({ description: '昵称', example: '系统管理员' }),
    status: z.number().openapi({ description: '状态：0-禁用 1-正常', example: 1 }),
    loginIp: z.string().nullable().openapi({ description: '最后登录 IP', example: '127.0.0.1' }),
    loginTime: z.string().nullable().openapi({
      description: '最后登录时间',
      example: '2024-01-01T00:00:00.000Z',
    }),
    remark: z.string().nullable().openapi({ description: '备注' }),
    createdAt: z.string().openapi({
      description: '创建时间',
      example: '2024-01-01T00:00:00.000Z',
    }),
    updatedAt: z.string().openapi({
      description: '更新时间',
      example: '2024-01-01T00:00:00.000Z',
    }),
    roles: z.array(RoleBriefSchema).optional().openapi({ description: '角色列表' }),
  })
  .openapi('AdminInfo')

/**
 * 菜单树节点 Schema
 */
export const MenuTreeNodeSchema: z.ZodType<MenuTreeNode> = z
  .lazy(() =>
    z.object({
      id: z.number().openapi({ description: '菜单 ID', example: 1 }),
      parentId: z.number().openapi({ description: '父级 ID', example: 0 }),
      menuType: z.enum(['D', 'M', 'B']).openapi({
        description: '菜单类型：D-目录 M-菜单 B-按钮',
        example: 'M',
      }),
      menuName: z.string().openapi({ description: '菜单名称', example: '系统管理' }),
      permission: z
        .string()
        .nullable()
        .openapi({ description: '权限标识', example: 'system:admin:list' }),
      path: z.string().nullable().openapi({ description: '路由路径', example: '/system' }),
      component: z
        .string()
        .nullable()
        .openapi({ description: '组件路径', example: 'system/admin/index' }),
      icon: z.string().nullable().openapi({ description: '图标', example: 'setting' }),
      sort: z.number().openapi({ description: '排序', example: 1 }),
      visible: z.number().openapi({ description: '是否可见：0-隐藏 1-显示', example: 1 }),
      status: z.number().openapi({ description: '状态：0-禁用 1-正常', example: 1 }),
      isExternal: z.number().openapi({ description: '是否外链：0-否 1-是', example: 0 }),
      isCache: z.number().openapi({ description: '是否缓存：0-否 1-是', example: 1 }),
      remark: z.string().nullable().openapi({ description: '备注' }),
      createdAt: z.string().openapi({ description: '创建时间' }),
      updatedAt: z.string().openapi({ description: '更新时间' }),
      children: z
        .array(z.lazy(() => MenuTreeNodeSchema))
        .optional()
        .openapi({ description: '子菜单' }),
    })
  )
  .openapi('MenuTreeNode')

// 类型定义（用于递归类型）
interface MenuTreeNode {
  id: number
  parentId: number
  menuType: 'D' | 'M' | 'B'
  menuName: string
  permission: string | null
  path: string | null
  component: string | null
  icon: string | null
  sort: number
  visible: number
  status: number
  isExternal: number
  isCache: number
  remark: string | null
  createdAt: string
  updatedAt: string
  children?: MenuTreeNode[]
}

// ========== 登录相关 ==========

/**
 * 登录请求 Schema
 */
export const LoginInputSchema = z
  .object({
    username: z
      .string()
      .min(1, '用户名不能为空')
      .max(50, '用户名最多50个字符')
      .openapi({ description: '用户名', example: 'admin' }),
    password: z
      .string()
      .min(1, '密码不能为空')
      .max(100, '密码最多100个字符')
      .openapi({ description: '密码', example: 'admin123' }),
  })
  .openapi('LoginInput')

/**
 * 登录响应 Schema
 */
export const LoginResultSchema = z
  .object({
    token: z.string().openapi({
      description: 'JWT Token',
      example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    }),
    admin: AdminInfoSchema.openapi({ description: '管理员信息' }),
    permissions: z.array(z.string()).openapi({
      description: '权限标识列表',
      example: ['system:admin:list', 'system:admin:create'],
    }),
    menus: z.array(MenuTreeNodeSchema).openapi({ description: '菜单树' }),
  })
  .openapi('LoginResult')

// ========== 认证信息 ==========

/**
 * 认证信息响应 Schema
 */
export const AuthInfoResultSchema = z
  .object({
    admin: AdminInfoSchema.openapi({ description: '管理员信息' }),
    permissions: z.array(z.string()).openapi({ description: '权限标识列表' }),
    menus: z.array(MenuTreeNodeSchema).openapi({ description: '菜单树' }),
  })
  .openapi('AuthInfoResult')

// ========== 类型导出 ==========

export type LoginInput = z.infer<typeof LoginInputSchema>
export type LoginResult = z.infer<typeof LoginResultSchema>
export type AuthInfoResult = z.infer<typeof AuthInfoResultSchema>
export type AdminInfo = z.infer<typeof AdminInfoSchema>
