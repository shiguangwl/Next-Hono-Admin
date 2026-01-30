/**
 * 路由拼装
 * @description 拼装所有路由模块，导出 AppType 类型
 */

import { OpenAPIHono } from "@hono/zod-openapi";
import type { Env } from "./context";
import { admins } from "./routes/admins";
import { auth } from "./routes/auth";
import { configs } from "./routes/configs";
import { menus } from "./routes/menus";
import { operationLogs } from "./routes/operation-logs";
import { roles } from "./routes/roles";

/**
 * 创建路由实例并挂载模块
 */
export const routes = new OpenAPIHono<Env>()
  .route("/auth", auth)
  .route("/admins", admins)
  .route("/roles", roles)
  .route("/menus", menus)
  .route("/operation-logs", operationLogs)
  .route("/configs", configs);

/**
 * 导出 AppType 类型（用于 Hono RPC Client）
 */
export type AppType = typeof routes;
