/**
 * 超级管理员重置脚本（CLI）
 *
 * 使用方式:
 *   pnpm admin:reset-pwd --password <新密码>
 *   pnpm admin:reset-pwd --password <新密码> --username <新用户名>
 *
 * WHY: 超管凭证重置必须绑定为「基础设施级操作」，
 * 需要直接访问服务器执行，API 层面禁止此操作。
 */

import { sysAdmin, sysAdminSession } from "@/db/schema";
import { env } from "@/env";
import { hashPassword } from "@/lib/auth";
import { SUPER_ADMIN_ID } from "@/lib/constants";
import "dotenv/config";
import { and, eq, isNull, ne } from "drizzle-orm";
import { drizzle, type MySql2Database } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

const MIN_PASSWORD_LENGTH = 6;
const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;

function parseArgs(): { password?: string; username?: string } {
  const args = process.argv.slice(2);
  const result: { password?: string; username?: string } = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--password" && args[i + 1]) {
      result.password = args[++i];
    } else if (args[i] === "--username" && args[i + 1]) {
      result.username = args[++i];
    }
  }

  return result;
}

function printUsage(): void {
  console.error("❌ 用法:");
  console.error("   pnpm admin:reset-pwd --password <新密码>");
  console.error(
    "   pnpm admin:reset-pwd --password <新密码> --username <新用户名>",
  );
  console.error("");
  console.error("示例:");
  console.error("   pnpm admin:reset-pwd --password MyNewP@ss123");
  console.error(
    "   pnpm admin:reset-pwd --password MyNewP@ss123 --username sysroot",
  );
}

function validate(opts: { password?: string; username?: string }): void {
  if (!opts.password) {
    printUsage();
    process.exit(1);
  }

  if (opts.password.length < MIN_PASSWORD_LENGTH) {
    console.error(`❌ 密码长度不能少于 ${MIN_PASSWORD_LENGTH} 位`);
    process.exit(1);
  }

  if (opts.username !== undefined) {
    if (opts.username.length < 2 || opts.username.length > 50) {
      console.error("❌ 用户名长度需在 2~50 个字符之间");
      process.exit(1);
    }
    if (!USERNAME_REGEX.test(opts.username)) {
      console.error("❌ 用户名只能包含字母、数字和下划线");
      process.exit(1);
    }
  }
}

async function fetchSuperAdmin(db: MySql2Database<Record<string, never>>) {
  const admin = await db
    .select({ id: sysAdmin.id, username: sysAdmin.username })
    .from(sysAdmin)
    .where(eq(sysAdmin.id, SUPER_ADMIN_ID))
    .limit(1)
    .then((rows) => rows[0]);

  if (!admin) {
    console.error(`❌ 超级管理员 (ID=${SUPER_ADMIN_ID}) 不存在`);
    process.exit(1);
  }

  return admin;
}

async function checkUsernameConflict(
  db: MySql2Database<Record<string, never>>,
  newUsername: string,
) {
  const conflict = await db
    .select({ id: sysAdmin.id })
    .from(sysAdmin)
    .where(
      and(eq(sysAdmin.username, newUsername), ne(sysAdmin.id, SUPER_ADMIN_ID)),
    )
    .limit(1)
    .then((rows) => rows[0]);

  if (conflict) {
    console.error(`❌ 用户名 "${newUsername}" 已被其他管理员使用`);
    process.exit(1);
  }
}

async function updateCredentials(
  db: MySql2Database<Record<string, never>>,
  opts: { password: string; username?: string },
) {
  const updateData: { password: string; username?: string } = {
    password: await hashPassword(opts.password),
  };
  if (opts.username) updateData.username = opts.username;

  await db
    .update(sysAdmin)
    .set(updateData)
    .where(eq(sysAdmin.id, SUPER_ADMIN_ID));

  // WHY: 密码/用户名变更后吊销所有 Session，防止旧凭证持有者继续访问
  const revokeResult = await db
    .update(sysAdminSession)
    .set({ revokedAt: new Date() })
    .where(
      and(
        eq(sysAdminSession.adminId, SUPER_ADMIN_ID),
        isNull(sysAdminSession.revokedAt),
      ),
    );

  return revokeResult[0]?.affectedRows ?? 0;
}

async function main() {
  const opts = parseArgs();
  validate(opts);

  const pool = mysql.createPool({ uri: env.DATABASE_URL });
  const db = drizzle(pool, { mode: "default" });

  try {
    const admin = await fetchSuperAdmin(db);

    // WHY: 修改用户名时必须检查唯一性约束，避免与其他管理员冲突
    if (opts.username && opts.username !== admin.username) {
      await checkUsernameConflict(db, opts.username);
    }

    const revokedCount = await updateCredentials(db, {
      password: opts.password!,
      username: opts.username,
    });

    console.log("✅ 超级管理员凭证已重置");
    console.log(`   账号: ${opts.username ?? admin.username}`);
    if (opts.username && opts.username !== admin.username) {
      console.log(
        `   用户名已从 "${admin.username}" 修改为 "${opts.username}"`,
      );
    }
    console.log(`   已吊销 ${revokedCount} 个活跃 Session`);
    console.log("   请使用新凭证重新登录");
  } catch (error) {
    console.error("❌ 重置失败:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

main()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
