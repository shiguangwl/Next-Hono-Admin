/**
 * 认证服务
 */

import { db } from "@/db";
import {
  sysAdmin,
  sysAdminRole,
  sysMenu,
  sysRole,
  sysRoleMenu,
} from "@/db/schema";
import { verifyPassword } from "@/lib/auth";
import { SUPER_ADMIN_ID } from "@/lib/constants";
import { BusinessError, ErrorCode, UnauthorizedError } from "@/lib/errors";
import { and, eq, inArray } from "drizzle-orm";
import { toAdminVo } from "../admin/admin.utils";
import { buildMenuTree, toMenuTreeNode } from "../menu/menu.utils";
import type { MenuTreeNode } from "../menu/types";
import { createAdminSession } from "./session.service";
import type { LoginInput, LoginResultVo } from "./types";

async function findAdminByUsername(username: string) {
  return db
    .select()
    .from(sysAdmin)
    .where(eq(sysAdmin.username, username))
    .limit(1)
    .then((rows) => rows[0]);
}

function assertAdminIsActive(
  admin: typeof sysAdmin.$inferSelect | undefined,
): asserts admin {
  if (!admin) {
    throw new UnauthorizedError("用户名或密码错误");
  }

  if (admin.status === 0) {
    throw new BusinessError("账号已禁用", ErrorCode.ACCOUNT_DISABLED);
  }
}

async function updateAdminLoginMetadata(
  adminId: number,
  ip?: string,
): Promise<void> {
  await db
    .update(sysAdmin)
    .set({
      loginIp: ip || null,
      loginTime: new Date(),
    })
    .where(eq(sysAdmin.id, adminId));
}

async function getAllActiveMenus() {
  return db.select().from(sysMenu).where(eq(sysMenu.status, 1));
}

async function getGrantedMenus(adminId: number) {
  if (adminId === SUPER_ADMIN_ID) {
    return getAllActiveMenus();
  }

  const roleIds = await getAdminRoleIds(adminId);
  if (roleIds.length === 0) {
    return [];
  }

  const roleMenus = await db
    .select({ menuId: sysRoleMenu.menuId })
    .from(sysRoleMenu)
    .where(inArray(sysRoleMenu.roleId, roleIds));

  if (roleMenus.length === 0) {
    return [];
  }

  return db
    .select()
    .from(sysMenu)
    .where(
      and(
        inArray(sysMenu.id, [...new Set(roleMenus.map((item) => item.menuId))]),
        eq(sysMenu.status, 1),
      ),
    );
}

/** 管理员登录 */
export async function login(input: LoginInput): Promise<LoginResultVo> {
  const admin = await findAdminByUsername(input.username);
  assertAdminIsActive(admin);

  const isValid = await verifyPassword(input.password, admin.password);
  if (!isValid) {
    throw new UnauthorizedError("用户名或密码错误");
  }

  // WHY: 先并发执行 session 创建 和 菜单查询，二者无依赖关系
  // getGrantedMenus 只调用一次，权限列表和菜单树均从同一结果中提取
  const [sessionToken, grantedMenus] = await Promise.all([
    createAdminSession({
      adminId: admin.id,
      ip: input.ip,
      userAgent: input.userAgent,
    }),
    getGrantedMenus(admin.id),
  ]);

  await updateAdminLoginMetadata(admin.id, input.ip);

  const permissions = extractPermissions(admin.id, grantedMenus);
  const menus = extractMenuTree(grantedMenus);

  return {
    sessionToken,
    // WHY: updateAdminLoginMetadata 只改 loginIp/loginTime，无需回库，本地更新
    admin: toAdminVo({
      ...admin,
      loginIp: input.ip ?? null,
      loginTime: new Date(),
    }),
    permissions,
    menus,
  };
}

/** 获取管理员角色 ID 列表 */
export async function getAdminRoleIds(adminId: number): Promise<number[]> {
  const roles = await db
    .select({ roleId: sysAdminRole.roleId })
    .from(sysAdminRole)
    .innerJoin(sysRole, eq(sysAdminRole.roleId, sysRole.id))
    .where(and(eq(sysAdminRole.adminId, adminId), eq(sysRole.status, 1)));

  return roles.map((role) => role.roleId);
}

function extractPermissions(
  adminId: number,
  menus: Awaited<ReturnType<typeof getGrantedMenus>>,
) {
  if (adminId === SUPER_ADMIN_ID) return ["*"];
  return [
    ...new Set(
      menus.flatMap((menu) => (menu.permission ? [menu.permission] : [])),
    ),
  ];
}

function extractMenuTree(menus: Awaited<ReturnType<typeof getGrantedMenus>>) {
  const visible = menus.filter(
    (menu) =>
      menu.visible === 1 && (menu.menuType === "D" || menu.menuType === "M"),
  );
  return buildMenuTree(visible.map(toMenuTreeNode));
}

/** 获取管理员权限列表 */
export async function getAdminPermissions(adminId: number): Promise<string[]> {
  if (adminId === SUPER_ADMIN_ID) return ["*"];
  return extractPermissions(adminId, await getGrantedMenus(adminId));
}

/** 获取管理员菜单树 */
export async function getAdminMenuTree(
  adminId: number,
): Promise<MenuTreeNode[]> {
  return extractMenuTree(await getGrantedMenus(adminId));
}
