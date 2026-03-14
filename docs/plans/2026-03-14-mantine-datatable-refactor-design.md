# mantine-datatable 替换 + 全链路排序设计

## 目标

用 `mantine-datatable` 替换自定义 `DataTable` + `Pagination` 组件，同时实现全链路服务端排序。

## 决策记录

| 决策点         | 选项                              | 决定                     |
| -------------- | --------------------------------- | ------------------------ |
| 分页 UI        | 内置 vs 独立组件                  | 内置                     |
| 排序范围       | 纯前端 vs 全链路服务端            | 全链路服务端             |
| 排序优先级     | 覆盖默认 vs 用户优先+默认兜底     | 用户优先+默认兜底        |
| 可排序字段控制 | 白名单映射 vs 动态取列+VO字段限制 | 动态取列+SORTABLE_FIELDS |

## 后端设计

### 排序参数 Schema

`PaginationQuerySchema` 扩展 `sortBy?: string` + `sortOrder?: 'asc' | 'desc'`。

### 通用排序工具 `buildSortOrder`

位置：`server/utils/pagination.ts`

```ts
function buildSortOrder(
  table: DrizzleTable,
  sortBy: string | undefined,
  sortOrder: "asc" | "desc" | undefined,
  sortableFields: string[],
  defaultOrder: SQL[],
): SQL[];
```

逻辑：

1. sortBy 为空或不在 sortableFields → 返回 defaultOrder
2. table[sortBy] 列不存在 → 返回 defaultOrder（双重保护）
3. 构建 `[userSort, ...defaultOrder]`

### Service 层改造

每个 service 定义 `SORTABLE_FIELDS` 数组（VO 字段子集），调用 `buildSortOrder`。
不从路由层 Zod schema 派生，避免层级依赖倒转。

各实体默认排序保持不变：

- admin: `id DESC`
- role: `sort ASC`
- config: `configGroup, configKey`
- audit: `createdAt DESC`

## 前端设计

### 删除组件

- `components/ui/data-table.tsx`（151行）
- `components/ui/pagination.tsx`（56行）
- `components/ui/index.ts` 移除对应导出

### 列定义迁移

ColumnDef → DataTableColumn：`key` → `accessor`，`render(value,record,index)` → `render(record)`。

### 排序状态管理

使用 mantine-datatable 的 `sortStatus` + `onSortStatusChange`，传入 query hooks。

### 内置分页

使用 `totalRecords` + `recordsPerPage` + `page` + `onPageChange`。

### Query 层

`BasePaginationQuery` 新增 `sortBy/sortOrder`，`buildQueryParams` 天然支持序列化。

## 影响范围

| 文件                                         | 变更类型                                   |
| -------------------------------------------- | ------------------------------------------ |
| `server/utils/pagination.ts`                 | 新增 buildSortOrder + 扩展类型             |
| `server/routes/shared/schemas/pagination.ts` | 新增 SortQuerySchema                       |
| 4 个 service                                 | 新增 SORTABLE_FIELDS + 调用 buildSortOrder |
| `hooks/queries/create-resource.ts`           | BasePaginationQuery 增字段                 |
| 4 个页面                                     | 列定义迁移 + 排序/分页集成                 |
| `components/ui/data-table.tsx`               | 删除                                       |
| `components/ui/pagination.tsx`               | 删除                                       |
| `components/ui/index.ts`                     | 移除导出                                   |

## 安全考量

- SORTABLE_FIELDS 白名单 + table column 存在性双重校验
- VO 不含 password 等敏感字段 → SORTABLE_FIELDS 天然安全
- VO 关联字段（roles/menuIds）在 table 中不存在 → 自动回退默认排序
