# mantine-datatable 重构实施计划

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** 用 mantine-datatable 替换自定义 DataTable + Pagination，实现全链路服务端排序。

**Architecture:** 后端 pagination.ts 新增通用排序工具 buildSortOrder，各 service 传入 SORTABLE_FIELDS + 默认排序。前端删除自定义 DataTable/Pagination，迁移 4 个列表页到 mantine-datatable 的 DataTable（内置分页 + 排序），query 层 BasePaginationQuery 扩展 sortBy/sortOrder。

**Tech Stack:** mantine-datatable v8, Drizzle ORM, Zod, Hono, React Query, nuqs

**设计文档:** `docs/plans/2026-03-14-mantine-datatable-refactor-design.md`

---

### Task 1: 后端 — 排序基础设施

**Files:**

- Modify: `src/server/routes/shared/schemas/pagination.ts:1-27`
- Modify: `src/server/routes/shared/index.ts:32-38`
- Modify: `src/server/utils/pagination.ts:1-36`

**Step 1: 扩展排序 Schema**

在 `src/server/routes/shared/schemas/pagination.ts` 新增 `SortQuerySchema`，并创建 `SortablePaginationQuerySchema`：

```typescript
export const SortQuerySchema = z.object({
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("asc").optional(),
});

export const SortablePaginationQuerySchema =
  PaginationQuerySchema.merge(SortQuerySchema);
export type SortablePaginationQuery = z.infer<
  typeof SortablePaginationQuerySchema
>;
```

在 `src/server/routes/shared/index.ts` 导出新增的 schema 和类型。

**Step 2: 新增 buildSortOrder 工具**

在 `src/server/utils/pagination.ts` 新增：

```typescript
import { asc, desc, type Column, type SQL } from "drizzle-orm";

export function buildSortOrder(
  table: Record<string, Column>,
  sortBy: string | undefined,
  sortOrder: "asc" | "desc" | undefined,
  sortableFields: readonly string[],
  defaultOrder: SQL[],
): SQL[] {
  if (!sortBy || !sortableFields.includes(sortBy)) {
    return defaultOrder;
  }
  const column = table[sortBy];
  if (!column) {
    return defaultOrder;
  }
  const userSort = sortOrder === "desc" ? desc(column) : asc(column);
  return [userSort, ...defaultOrder];
}
```

同时扩展 `normalizePagination` 的入参和返回值，新增 `sortBy` 和 `sortOrder`。

**Step 3: 验证编译**

Run: `pnpm tsc --noEmit`
Expected: 无新增错误

**Step 4: Commit**

```bash
git add src/server/routes/shared/ src/server/utils/pagination.ts
git commit -m "feat: 新增通用排序基础设施 buildSortOrder"
```

---

### Task 2: 后端 — 4 个 QuerySchema 扩展排序参数

**Files:**

- Modify: `src/server/routes/admins/dtos.ts:17-20`
- Modify: `src/server/routes/roles/dtos.ts:15-18`
- Modify: `src/server/routes/configs/dtos.ts:20-23`
- Modify: `src/server/routes/operation-logs/dtos.ts:30-38`

**Step 1: 将 4 个 QuerySchema 从 PaginationQuerySchema 改为 SortablePaginationQuerySchema**

示例（AdminQuerySchema）：

```typescript
// 旧
export const AdminQuerySchema = PaginationQuerySchema.extend({ ... })
// 新
export const AdminQuerySchema = SortablePaginationQuerySchema.extend({ ... })
```

对 `RoleQuerySchema`、`ConfigQuerySchema`、`LogQuerySchema` 做同样修改。

**Step 2: 验证编译**

Run: `pnpm tsc --noEmit`
Expected: 无新增错误

**Step 3: Commit**

```bash
git add src/server/routes/admins/dtos.ts src/server/routes/roles/dtos.ts src/server/routes/configs/dtos.ts src/server/routes/operation-logs/dtos.ts
git commit -m "feat: 4个查询Schema扩展排序参数"
```

---

### Task 3: 后端 — 4 个 Service 接入排序

**Files:**

- Modify: `src/server/services/system/admin/admin.service.ts:35-57`
- Modify: `src/server/services/system/role/role.service.ts:26-50`
- Modify: `src/server/services/system/config/config.service.ts:167-204`
- Modify: `src/server/services/system/audit/audit.service.ts:40-83`

**Step 1: admin.service.ts**

```typescript
const SORTABLE_FIELDS = [
  "id",
  "username",
  "nickname",
  "status",
  "loginTime",
  "createdAt",
  "updatedAt",
] as const;

export async function getAdminList(
  options: AdminQuery = {},
): Promise<PaginatedResult<AdminVo>> {
  const { page, pageSize, offset, sortBy, sortOrder } =
    normalizePagination(options);
  // ...conditions 不变...
  const orderBy = buildSortOrder(sysAdmin, sortBy, sortOrder, SORTABLE_FIELDS, [
    desc(sysAdmin.id),
  ]);
  // 替换 .orderBy(sql`${sysAdmin.id} DESC`) 为 .orderBy(...orderBy)
}
```

**Step 2: role.service.ts**

```typescript
const SORTABLE_FIELDS = [
  "id",
  "roleName",
  "sort",
  "status",
  "createdAt",
  "updatedAt",
] as const;
// 默认排序: [asc(sysRole.sort)]
```

**Step 3: config.service.ts**

```typescript
const SORTABLE_FIELDS = [
  "id",
  "configKey",
  "configGroup",
  "configName",
  "configType",
  "status",
  "createdAt",
] as const;
// 默认排序: [asc(sysConfig.configGroup), asc(sysConfig.configKey)]
```

**Step 4: audit.service.ts**

```typescript
const SORTABLE_FIELDS = [
  "id",
  "adminName",
  "module",
  "operation",
  "status",
  "executionTime",
  "createdAt",
] as const;
// 默认排序: [desc(sysOperationLog.createdAt)]
```

**Step 5: 验证编译**

Run: `pnpm tsc --noEmit`
Expected: 无新增错误

**Step 6: Commit**

```bash
git add src/server/services/
git commit -m "feat: 4个Service接入通用排序"
```

---

### Task 4: 前端 — Query 层扩展排序参数

**Files:**

- Modify: `src/hooks/queries/create-resource.ts:13-16`

**Step 1: BasePaginationQuery 新增排序字段**

```typescript
export interface BasePaginationQuery {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
```

`buildQueryParams` 已有通用 key-value 序列化逻辑，会自动将 sortBy/sortOrder 加到 query string，无需额外修改。

**Step 2: 验证编译**

Run: `pnpm tsc --noEmit`
Expected: 无新增错误

**Step 3: Commit**

```bash
git add src/hooks/queries/create-resource.ts
git commit -m "feat: BasePaginationQuery扩展排序参数"
```

---

### Task 5: 前端 — 删除旧组件 + 清理导出

**Files:**

- Delete: `src/components/ui/data-table.tsx`
- Delete: `src/components/ui/pagination.tsx`
- Modify: `src/components/ui/index.ts:1,6`

**Step 1: 删除旧文件**

```bash
rm src/components/ui/data-table.tsx src/components/ui/pagination.tsx
```

**Step 2: 清理 index.ts 导出**

移除以下两行：

```typescript
export { type ColumnDef, DataTable } from "./data-table";
export { Pagination } from "./pagination";
```

**Step 3: Commit**

```bash
git add -A src/components/ui/
git commit -m "refactor: 删除自定义DataTable和Pagination组件"
```

注意：此 commit 后 4 个页面会编译报错，这是预期中的，将在后续 Task 修复。

---

### Task 6: 前端 — 迁移 role 页面

**Files:**

- Modify: `src/app/(dashboard)/system/role/page.tsx`

**Step 1: 迁移列定义和页面**

关键变更点：

1. 替换 `import { type ColumnDef, DataTable } from '@/components/ui/data-table'` → `import { DataTable, type DataTableColumn, type DataTableSortStatus } from 'mantine-datatable'`
2. 移除 `import { Pagination } from '@/components/ui/pagination'`
3. 列定义从 `ColumnDef<Role>` 改为 `DataTableColumn<Role>`：`key` → `accessor`，`render(v, record)` → `render(record)`
4. 对需要排序的列添加 `sortable: true`
5. 新增 `sortStatus` 状态管理
6. `<DataTable>` 使用 mantine-datatable API：`records`, `columns`, `fetching`, `noRecordsText`, `totalRecords`, `recordsPerPage`, `page`, `onPageChange`, `sortStatus`, `onSortStatusChange`
7. 移除独立的 `<Pagination>` 组件
8. 将 sortStatus 传入 useRoles：`sortBy: sortStatus.columnAccessor`, `sortOrder: sortStatus.direction`

**Step 2: 验证编译**

Run: `pnpm tsc --noEmit`
Expected: role 页面相关无错误

**Step 3: 浏览器验证**

打开 `http://localhost:3000/system/role`，验证：

- 表格正常渲染，数据加载
- 内置分页可用
- 点击表头可排序

**Step 4: Commit**

```bash
git add src/app/\(dashboard\)/system/role/page.tsx
git commit -m "refactor: role页面迁移到mantine-datatable"
```

---

### Task 7: 前端 — 迁移 admin 页面

**Files:**

- Modify: `src/app/(dashboard)/system/admin/page.tsx`

**Step 1: 迁移列定义和页面**

同 Task 6 模式：

1. 替换导入
2. 列定义迁移（`key` → `accessor`，`render` 签名调整）
3. 新增 sortStatus 状态
4. 使用 mantine-datatable DataTable（内置分页+排序）
5. 移除独立 Pagination
6. 将 sortStatus 传入 useAdmins

**Step 2: 验证编译 + 浏览器验证**

**Step 3: Commit**

```bash
git add src/app/\(dashboard\)/system/admin/page.tsx
git commit -m "refactor: admin页面迁移到mantine-datatable"
```

---

### Task 8: 前端 — 迁移 config 页面

**Files:**

- Modify: `src/app/(dashboard)/system/config/page.tsx`
- Modify: `src/app/(dashboard)/system/config/config-columns.tsx`

**Step 1: config-columns.tsx 迁移**

`buildColumns` 返回类型从 `ColumnDef<Config>[]` 改为 `DataTableColumn<Config>[]`。

**Step 2: page.tsx 迁移**

同 Task 6 模式。

**Step 3: 验证编译 + 浏览器验证**

**Step 4: Commit**

```bash
git add src/app/\(dashboard\)/system/config/
git commit -m "refactor: config页面迁移到mantine-datatable"
```

---

### Task 9: 前端 — 迁移 log 页面

**Files:**

- Modify: `src/app/(dashboard)/system/log/page.tsx`

**Step 1: 迁移列定义和页面**

同 Task 6 模式。

**Step 2: 验证编译 + 浏览器验证**

**Step 3: Commit**

```bash
git add src/app/\(dashboard\)/system/log/page.tsx
git commit -m "refactor: log页面迁移到mantine-datatable"
```

---

### Task 10: 全量验证

**Step 1: 完整编译检查**

Run: `pnpm tsc --noEmit`
Expected: 无任何错误

**Step 2: lint 检查**

Run: `pnpm lint`
Expected: 无新增错误或警告

**Step 3: 浏览器逐页验证**

依次打开以下页面，验证表格渲染、分页、排序功能：

- `http://localhost:3000/system/admin`
- `http://localhost:3000/system/role`
- `http://localhost:3000/system/config`
- `http://localhost:3000/system/log`

**Step 4: 确认无残留引用**

Run: `grep -rn "from '@/components/ui/data-table'" src/ && grep -rn "from '@/components/ui/pagination'" src/`
Expected: 无结果

**Step 5: Commit**

如有 lint fix 需要：

```bash
git add -A && git commit -m "chore: 全量验证通过，清理残留"
```
