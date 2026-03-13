# 后台 UI 全面重构 + Mantine 模块引入（模式 A - 2.0 版）

## Goal

以**模式 A**（先引入模块基础设施，再重构布局）对后台系统进行全面重构。侧边栏视觉风格完全参考用户提供的参考图（极简、实用、具有清晰的类别分组）。

## Assumptions

1. Mantine 已升级至 v8.3.16（已完成）
2. **移除** `@mantine/spotlight` 的引入计划（用户明确不需要）
3. 所有引入的模块都必须有具体使用场景，不做"预安装"

## Plan

### Phase 1: 依赖安装与基础设施 (Step 1~2)

#### Step 1 — 安装所需依赖

- **Files**: `package.json`
- **Change**:
  - Mantine 模块: `@mantine/form` `@mantine/modals` `@mantine/notifications` `@mantine/nprogress` `@mantine/dates` `@mantine/tiptap` `@mantine/charts` `@mantine/dropzone`
  - 数据表格: `mantine-datatable`
  - URL 状态: `nuqs`
  - 对等依赖: `dayjs` `recharts` `@tiptap/react` `@tiptap/starter-kit` `@tiptap/extension-link` `@tiptap/extension-placeholder`
- **Verify**: `pnpm install` 成功

#### Step 2 — 配置 Providers + 样式导入（全面分析并移除冗余实现）

- **Files**: `src/app/providers.tsx`, `src/app/globals.css`
- **Change**:
  - `globals.css`: 导入新模块样式（通知、日期、富文本、图表、进度条、Dropzone、数据表格）
  - `providers.tsx`: 添加 `ModalsProvider`, `Notifications` 组件; 包裹 `NuqsAdapter`; **移除** `sonner` 的 `Toaster`
  - **Cleanup**: 检查是否有重复的 Overlay 或 Portal 配置并精简
- **Verify**: `pnpm build` 成功

### Phase 2: 通知系统迁移 (Step 3)

#### Step 3 — 彻底替换 sonner 为 @mantine/notifications

- **Files**: `admin/page.tsx`, `role/page.tsx`, `menu/page.tsx`, `config/page.tsx`, `log/page.tsx`, `package.json`
- **Change**: 统一使用 `notifications.show`; 移除 `sonner` 依赖
- **Verify**: 全局 `grep` 无 `sonner` 引用

### Phase 3: 表单重构 @mantine/form (Step 4~8)

#### Step 4~8 — 重构所有核心表单

- **Files**: `login/page.tsx`, 管理员/角色/菜单/配置等 Dialog 文件
- **Change**: 使用 `useForm` 接管状态与校验; 消除手动 `useState` 样板代码
- **Verify**: `pnpm build` 正常

### Phase 4: 弹窗系统重构 @mantine/modals (Step 9~10)

#### Step 9~10 — 函数式弹窗重构与 cleanup

- **Files**: 各 page.tsx, `src/components/ui/form-dialog.tsx`
- **Change**: `modals.openConfirmModal()` 替换 `<ConfirmDialog>`; 清理不再使用的 UI 组件
- **Verify**: 弹窗逻辑正常运行

### Phase 5: 表格系统重构 mantine-datatable (Step 11~12)

#### Step 11~12 — 引入高性能数据表格

- **Files**: `admin/page.tsx`, `role/page.tsx`, `log/page.tsx`, `config/page.tsx`
- **Change**: 替换自封装 DataTable; 启用排序、行展开、内置分页
- **Verify**: 移除 `src/components/ui/data-table.tsx` 后无报错

### Phase 6: URL 状态同步 nuqs (Step 13)

#### Step 13 — 筛选状态持久化

- **Files**: 所有列表页 `page.tsx`
- **Change**: 使用 `useQueryStates` 同步搜索关键词、页码等
- **Verify**: 刷新页面后搜索条件不丢失

### Phase 7: 侧边栏视觉重构（对齐 One API 风格）(Step 14)

#### Step 14 — 侧边栏高级实用化重构

- **Files**: `src/components/layout/app-sidebar.tsx`, `src/app/globals.css`
- **Change**:
  - **分组设计**: `menuType === 'D'` 的菜单项渲染为灰色小字、加粗的 Label 分组标题（如 Dashboard / Setting），不可点击
  - **扁平菜单**: 常规菜单项背景透明; 激活项使用淡蓝色圆角背景 (`bg="blue.0"`, `c="blue.7"`)
  - **Logo 区域**: 对齐参考图，简洁品牌展示
  - **布局比例**: 优化 Padding 和 Gap，提高信息密度
- **Verify**: 视觉效果与参考图一致

### Phase 8: 顶栏与全局反馈 (Step 15~16)

#### Step 15~16 — Header 升级与路由进度条

- **Files**: `app-header.tsx`, `route-progress.tsx`
- **Change**: 完善用户下拉菜单; 挂载 `@mantine/nprogress`
- **Verify**: 路由切换有进度指示

### Phase 9: 功能补完 (Step 17~20)

#### Step 17 — 日期选择器 (@mantine/dates)

- **Files**: `log/page.tsx`
- **Change**: 使用 `DateTimePicker` 替换原生输入框

#### Step 18 — 富文本编辑器 (@mantine/tiptap)

- **Files**: `src/components/ui/rich-text-editor.tsx`, 配置页
- **Change**: 为备注字段提供富文本编辑能力

#### Step 19 — 数据可视化 (@mantine/charts)

- **Files**: `dashboard/page.tsx`
- **Change**: 添加业务统计折线图/面积图

#### Step 20 — 快捷导入 (@mantine/dropzone)

- **Files**: Dashboard 页面
- **Change**: 实现一个配置导入的拖拽区域 Demo

### Phase 10: 最终清理与审计 (Step 21)

#### Step 21 — 全局清理

- **Files**: `src/components/ui/`
- **Change**: 移除所有被新模块替代的冗余代码; 最终 build 检查
- **Verify**: 零技术债务

## 模块落地对照表

| 模块                     | 使用场景                           |  落地步骤  |
| :----------------------- | :--------------------------------- | :--------: |
| `@mantine/form`          | 全局表单（登录 + 所有 CRUD）       |  Step 4~8  |
| `@mantine/modals`        | 删除确认、重置密码等函数式弹窗     | Step 9~10  |
| `@mantine/notifications` | 替换 sonner 全局通知               |   Step 3   |
| `@mantine/nprogress`     | 路由切换顶部进度条                 |  Step 16   |
| `@mantine/dates`         | 日志页高级日期筛选器               |  Step 17   |
| `@mantine/tiptap`        | 通用富文本编辑组件 (备注/公告场景) |  Step 18   |
| `@mantine/charts`        | Dashboard 数据分析图表             |  Step 19   |
| `@mantine/dropzone`      | 拖拽文件导入示例                   |  Step 20   |
| `mantine-datatable`      | 替换自封装表格，支持高级排序/选择  | Step 11~12 |
| `nuqs`                   | 列表筛选条件 URL 持久化            |  Step 13   |

## Risks & Mitigations

- **视觉冲突**: 确保全局 CSS 变量与 Mantine 主题配置一致。
- **性能**: `recharts` 和 `tiptap` 可能增加包体积，需按需引入样式。
- **逻辑兼容**: `@mantine/form` 的 `getInputProps` 在复杂自定义组件中可能需要手动处理。

## Rollback Plan

- 细粒度 Git Commit。
- 依赖版本锁定在 `pnpm-lock.yaml`。
