import type { MySql2Database } from "drizzle-orm/mysql2";

// biome-ignore lint/suspicious/noExplicitAny: <>
type AnyDatabase = MySql2Database<any>;

import {
  sysAdmin,
  sysAdminRole,
  sysConfig,
  sysMenu,
  sysRole,
  sysRoleMenu,
} from "@/db/schema";
import { CONFIGS, MENUS, ROLES } from "@/db/seed-data";
import { hashPassword } from "@/lib/auth";
import { eq } from "drizzle-orm";

/** 超级管理员 ID（与 @/lib/utils/constants 保持一致） */
const SUPER_ADMIN_ID = 1;

/** 超级管理员默认配置 */
const DEFAULT_ADMIN = {
  username: "admin",
  password: "admin123",
  nickname: "超级管理员",
} as const;

/**
 * 执行数据库 Seed
 */
export async function runSeed(db: AnyDatabase): Promise<void> {
  await db.transaction(async (tx) => {
    // 初始化角色
    for (const role of ROLES) {
      await tx
        .insert(sysRole)
        .values(role)
        .onDuplicateKeyUpdate({
          set: {
            roleName: role.roleName,
            sort: role.sort,
            status: role.status,
            remark: role.remark,
          },
        });
    }

    // 初始化菜单
    for (const menu of MENUS) {
      await tx
        .insert(sysMenu)
        .values(menu)
        .onDuplicateKeyUpdate({
          set: {
            parentId: menu.parentId,
            menuType: menu.menuType,
            menuName: menu.menuName,
            permission: menu.permission,
            path: menu.path,
            component: menu.component,
            icon: menu.icon,
            sort: menu.sort,
            visible: menu.visible,
            status: menu.status,
          },
        });
    }

    // 初始化系统配置（仅在不存在时插入，不覆盖已有配置）
    for (const config of CONFIGS) {
      const existing = await tx
        .select({ id: sysConfig.id })
        .from(sysConfig)
        .where(eq(sysConfig.configKey, config.configKey))
        .limit(1)
        .then((rows) => rows[0]);

      if (!existing) {
        await tx.insert(sysConfig).values(config);
      }
    }

    // 初始化超级管理员（使用 upsert 避免 ID 和 username 冲突）
    await tx
      .insert(sysAdmin)
      .values({
        id: SUPER_ADMIN_ID,
        username: DEFAULT_ADMIN.username,
        password: await hashPassword(DEFAULT_ADMIN.password),
        nickname: DEFAULT_ADMIN.nickname,
        status: 1,
        remark: "系统初始化创建",
      })
      .onDuplicateKeyUpdate({
        set: {
          nickname: DEFAULT_ADMIN.nickname,
          remark: "系统初始化创建",
        },
      });

    // 为基础角色分配所有菜单权限
    const baseRoleId = ROLES[0]?.id;
    if (!baseRoleId) {
      throw new Error("ROLES seed data is empty");
    }

    for (const menu of MENUS) {
      await tx
        .insert(sysRoleMenu)
        .values({ roleId: baseRoleId, menuId: menu.id })
        .onDuplicateKeyUpdate({ set: { roleId: baseRoleId } });
    }

    // 为超级管理员分配基础角色
    await tx
      .insert(sysAdminRole)
      .values({ adminId: SUPER_ADMIN_ID, roleId: baseRoleId })
      .onDuplicateKeyUpdate({ set: { adminId: SUPER_ADMIN_ID } });
  });
}
