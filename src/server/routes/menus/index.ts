import type { Env } from "@/server/context";
import { auditLog } from "@/server/middleware/audit-log";
import { requirePermission } from "@/server/middleware/rbac";
import { requireAuth } from "@/server/middleware/session-auth";
import {
  batchUpdateMenuSort,
  createMenu,
  deleteMenu,
  getMenuById,
  getMenuList,
  getMenuTree,
  updateMenu,
} from "@/server/services";
import { R } from "@/server/utils/response";
import { zValidator } from "@/server/utils/validator";
import { Hono } from "hono";
import { IdParamSchema } from "../shared";
import {
  BatchSortSchema,
  CreateMenuInputSchema,
  MenuQuerySchema,
  UpdateMenuInputSchema,
} from "./dtos";

const menus = new Hono<Env>()
  .use("/*", requireAuth)
  .get(
    "/",
    requirePermission("system:menu:list"),
    zValidator("query", MenuQuerySchema),
    async (c) => {
      const query = c.req.valid("query");
      const result = await getMenuList({
        menuType: query.menuType,
        status: query.status,
      });
      return R.ok(c, result);
    },
  )
  .get(
    "/tree",
    requirePermission("system:menu:list"),
    zValidator("query", MenuQuerySchema),
    async (c) => {
      const query = c.req.valid("query");
      const result = await getMenuTree({
        menuType: query.menuType,
        status: query.status,
      });
      return R.ok(c, result);
    },
  )
  .get(
    "/:id",
    requirePermission("system:menu:query"),
    zValidator("param", IdParamSchema),
    async (c) => {
      const { id } = c.req.valid("param");
      const menu = await getMenuById(id);
      return R.ok(c, menu);
    },
  )
  .post(
    "/",
    requirePermission("system:menu:create"),
    auditLog({
      module: "菜单管理",
      operation: "创建",
      description: "创建菜单",
    }),
    zValidator("json", CreateMenuInputSchema),
    async (c) => {
      const body = c.req.valid("json");
      const menu = await createMenu(body);
      return R.ok(c, menu);
    },
  )
  .put(
    "/sort",
    requirePermission("system:menu:update"),
    auditLog({
      module: "菜单管理",
      operation: "排序",
      description: "批量更新菜单排序",
    }),
    zValidator("json", BatchSortSchema),
    async (c) => {
      const items = c.req.valid("json");
      await batchUpdateMenuSort(items);
      return R.success(c, "排序更新成功");
    },
  )
  .put(
    "/:id",
    requirePermission("system:menu:update"),
    auditLog({
      module: "菜单管理",
      operation: "更新",
      description: "更新菜单信息",
    }),
    zValidator("param", IdParamSchema),
    zValidator("json", UpdateMenuInputSchema),
    async (c) => {
      const { id } = c.req.valid("param");
      const body = c.req.valid("json");
      const menu = await updateMenu(id, body);
      return R.ok(c, menu);
    },
  )
  .delete(
    "/:id",
    requirePermission("system:menu:delete"),
    auditLog({
      module: "菜单管理",
      operation: "删除",
      description: "删除菜单",
    }),
    zValidator("param", IdParamSchema),
    async (c) => {
      const { id } = c.req.valid("param");
      await deleteMenu(id);
      return R.success(c, "删除成功");
    },
  );

export { menus };
