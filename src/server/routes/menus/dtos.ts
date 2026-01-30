/**
 * 菜单路由 DTO 定义
 * @description 菜单 CRUD 的请求/响应 Schema
 */

import { z } from "@hono/zod-openapi";

// ========== 基础 Schema ==========

/**
 * 菜单类型枚举
 */
export const MenuTypeEnum = z.enum(["D", "M", "B"]).openapi({
  description: "菜单类型：D-目录 M-菜单 B-按钮",
  example: "M",
});

/**
 * 菜单 Schema
 */
export const MenuSchema = z
  .object({
    id: z.number().openapi({ description: "菜单 ID", example: 1 }),
    parentId: z.number().openapi({ description: "父级 ID", example: 0 }),
    menuType: MenuTypeEnum,
    menuName: z
      .string()
      .openapi({ description: "菜单名称", example: "系统管理" }),
    permission: z
      .string()
      .nullable()
      .openapi({ description: "权限标识", example: "system:admin:list" }),
    path: z
      .string()
      .nullable()
      .openapi({ description: "路由路径", example: "/system" }),
    component: z
      .string()
      .nullable()
      .openapi({ description: "组件路径", example: "system/admin/index" }),
    icon: z
      .string()
      .nullable()
      .openapi({ description: "图标", example: "setting" }),
    sort: z.number().openapi({ description: "排序", example: 1 }),
    visible: z
      .number()
      .openapi({ description: "是否可见：0-隐藏 1-显示", example: 1 }),
    status: z
      .number()
      .openapi({ description: "状态：0-禁用 1-正常", example: 1 }),
    isExternal: z
      .number()
      .openapi({ description: "是否外链：0-否 1-是", example: 0 }),
    isCache: z
      .number()
      .openapi({ description: "是否缓存：0-否 1-是", example: 1 }),
    remark: z.string().nullable().openapi({ description: "备注" }),
    createdAt: z.string().openapi({
      description: "创建时间",
      example: "2024-01-01T00:00:00.000Z",
    }),
    updatedAt: z.string().openapi({
      description: "更新时间",
      example: "2024-01-01T00:00:00.000Z",
    }),
  })
  .openapi("Menu");

/**
 * 菜单树节点 Schema
 */
export const MenuTreeNodeSchema: z.ZodType<MenuTreeNode> = z
  .lazy(() =>
    MenuSchema.extend({
      children: z
        .array(z.lazy(() => MenuTreeNodeSchema))
        .optional()
        .openapi({ description: "子菜单" }),
    })
  )
  .openapi("MenuTreeNode");

// 类型定义（用于递归类型）
interface MenuTreeNode {
  id: number;
  parentId: number;
  menuType: "D" | "M" | "B";
  menuName: string;
  permission: string | null;
  path: string | null;
  component: string | null;
  icon: string | null;
  sort: number;
  visible: number;
  status: number;
  isExternal: number;
  isCache: number;
  remark: string | null;
  createdAt: string;
  updatedAt: string;
  children?: MenuTreeNode[];
}

// ========== 查询参数 ==========

/**
 * 菜单列表查询参数 Schema
 */
export const MenuQuerySchema = z.object({
  menuType: MenuTypeEnum.optional().openapi({ description: "菜单类型筛选" }),
  status: z.coerce
    .number()
    .int()
    .min(0)
    .max(1)
    .optional()
    .openapi({ description: "状态筛选", example: 1 }),
});

// ========== 创建/更新 ==========

/**
 * 创建菜单请求 Schema
 */
export const CreateMenuInputSchema = z
  .object({
    parentId: z
      .number()
      .int()
      .min(0)
      .default(0)
      .openapi({ description: "父级 ID（0 表示顶级）", example: 0 }),
    menuType: MenuTypeEnum,
    menuName: z
      .string()
      .min(1, "菜单名称不能为空")
      .max(50, "菜单名称最多50个字符")
      .openapi({ description: "菜单名称", example: "用户管理" }),
    permission: z
      .string()
      .max(100, "权限标识最多100个字符")
      .optional()
      .openapi({ description: "权限标识", example: "system:user:list" }),
    path: z
      .string()
      .max(200, "路由路径最多200个字符")
      .optional()
      .openapi({ description: "路由路径", example: "/system/user" }),
    component: z
      .string()
      .max(200, "组件路径最多200个字符")
      .optional()
      .openapi({ description: "组件路径", example: "system/user/index" }),
    icon: z
      .string()
      .max(100, "图标最多100个字符")
      .optional()
      .openapi({ description: "图标", example: "user" }),
    sort: z
      .number()
      .int()
      .min(0)
      .default(0)
      .openapi({ description: "排序", example: 0 }),
    visible: z
      .number()
      .int()
      .min(0)
      .max(1)
      .default(1)
      .openapi({ description: "是否可见：0-隐藏 1-显示", example: 1 }),
    status: z
      .number()
      .int()
      .min(0)
      .max(1)
      .default(1)
      .openapi({ description: "状态：0-禁用 1-正常", example: 1 }),
    isExternal: z
      .number()
      .int()
      .min(0)
      .max(1)
      .default(0)
      .openapi({ description: "是否外链：0-否 1-是", example: 0 }),
    isCache: z
      .number()
      .int()
      .min(0)
      .max(1)
      .default(1)
      .openapi({ description: "是否缓存：0-否 1-是", example: 1 }),
    remark: z
      .string()
      .max(500, "备注最多500个字符")
      .optional()
      .openapi({ description: "备注" }),
  })
  .refine(
    (data) => {
      // 目录类型禁止设置路径
      if (data.menuType === "D" && data.path) {
        return false;
      }
      return true;
    },
    {
      message: "目录类型仅用于菜单分组，不能设置路由路径",
      path: ["path"],
    }
  )
  .openapi("CreateMenuInput");

/**
 * 更新菜单请求 Schema
 */
export const UpdateMenuInputSchema = z
  .object({
    parentId: z
      .number()
      .int()
      .min(0)
      .optional()
      .openapi({ description: "父级 ID（0 表示顶级）", example: 0 }),
    menuType: MenuTypeEnum.optional(),
    menuName: z
      .string()
      .min(1, "菜单名称不能为空")
      .max(50, "菜单名称最多50个字符")
      .optional()
      .openapi({ description: "菜单名称", example: "用户管理" }),
    permission: z
      .string()
      .max(100, "权限标识最多100个字符")
      .optional()
      .openapi({ description: "权限标识", example: "system:user:list" }),
    path: z
      .string()
      .max(200, "路由路径最多200个字符")
      .optional()
      .openapi({ description: "路由路径", example: "/system/user" }),
    component: z
      .string()
      .max(200, "组件路径最多200个字符")
      .optional()
      .openapi({ description: "组件路径", example: "system/user/index" }),
    icon: z
      .string()
      .max(100, "图标最多100个字符")
      .optional()
      .openapi({ description: "图标", example: "user" }),
    sort: z
      .number()
      .int()
      .min(0)
      .optional()
      .openapi({ description: "排序", example: 0 }),
    visible: z
      .number()
      .int()
      .min(0)
      .max(1)
      .optional()
      .openapi({ description: "是否可见：0-隐藏 1-显示", example: 1 }),
    status: z
      .number()
      .int()
      .min(0)
      .max(1)
      .optional()
      .openapi({ description: "状态：0-禁用 1-正常", example: 1 }),
    isExternal: z
      .number()
      .int()
      .min(0)
      .max(1)
      .optional()
      .openapi({ description: "是否外链：0-否 1-是", example: 0 }),
    isCache: z
      .number()
      .int()
      .min(0)
      .max(1)
      .optional()
      .openapi({ description: "是否缓存：0-否 1-是", example: 1 }),
    remark: z
      .string()
      .max(500, "备注最多500个字符")
      .optional()
      .openapi({ description: "备注" }),
  })
  .refine(
    (data) => {
      // 目录类型禁止设置路径
      if (data.menuType === "D" && data.path) {
        return false;
      }
      return true;
    },
    {
      message: "目录类型仅用于菜单分组，不能设置路由路径",
      path: ["path"],
    }
  )
  .openapi("UpdateMenuInput");

// ========== 类型导出 ==========

export type Menu = z.infer<typeof MenuSchema>;
export type MenuTreeNodeDto = z.infer<typeof MenuTreeNodeSchema>;
export type MenuQuery = z.infer<typeof MenuQuerySchema>;
export type CreateMenuInput = z.infer<typeof CreateMenuInputSchema>;
export type UpdateMenuInput = z.infer<typeof UpdateMenuInputSchema>;
