# NextAdminHono

> 基于 Next.js + Hono 的企业级后台管理系统脚手架（类型安全、可扩展、生产可用）

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![Hono](https://img.shields.io/badge/Hono-orange?logo=hono)](https://hono.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-blue?logo=typescript)](https://www.typescriptlang.org/)

## 项目简介

NextAdminHono 以「前后端一体 + 端到端类型安全」为核心目标，提供后台系统常见能力：认证、权限、审计、日志，以及可复用的 CRUD 中间件与 React Query Hooks 模式，方便快速扩展业务模块。

## 功能概览

- 服务端会话认证、RBAC 权限（菜单/按钮）
- 请求级上下文、结构化日志、审计日志
- 共享 CRUD 中间件 + React Query Hooks 工厂
- MySQL + Drizzle ORM（类型安全 Schema）
- Docker 生产部署

## 技术栈

- Frontend: Next.js App Router、React 19、Mantine 8、@tanstack/react-query、Zustand
- Backend: Hono、Drizzle ORM、MySQL2、Zod
- 工具链: Biome、pnpm、Docker

## 快速开始

### 1) 安装依赖

```bash
pnpm install
```

### 2) 配置环境变量

项目使用 `src/env.ts` 做运行时校验，常用变量：

- `DATABASE_URL`
- `DATABASE_MAX_CONNECTIONS`
- `DATABASE_IDLE_TIMEOUT`
- `DATABASE_CONNECT_TIMEOUT`
- `AUTO_DB_MIGRATE`
- `AUTO_DB_SEED`
- `SESSION_COOKIE_NAME`
- `SESSION_TTL_DAYS`
- `NODE_ENV`

建议：

- 开发环境使用 `.env.development`（可提交，但不要放真实密钥）
- 生产环境使用 `.env.production.local` 覆盖 `.env.production`（不提交）

### 3) 数据库初始化

```bash
# 同步 Schema（开发环境）
pnpm db:push

# 初始化种子数据
pnpm db:seed
```

### 4) 启动开发环境

```bash
pnpm dev
```

### 默认账号（种子数据）

| 账号  | 密码     | 角色       |
| ----- | -------- | ---------- |
| admin | admin123 | 超级管理员 |

## 内置路由与模块

- 认证：`/api/auth`（login / logout / info）
- 管理员：`/api/admins`
- 角色：`/api/roles`
- 菜单：`/api/menus`
- 操作日志：`/api/operation-logs`
- 系统配置：`/api/configs`
- 存储：`/api/storage`

> 当前版本未集成 OpenAPI 自动文档生成。如需要，可通过 `@hono/zod-openapi` 扩展。

## 项目结构

```
src/
├── app/                 # Next.js 页面
├── server/              # Hono API 与服务端逻辑
├── db/                  # Drizzle Schema 与 DB 初始化
├── lib/                 # 共享工具（auth/errors/logging/client）
├── hooks/               # React Hooks
└── components/          # UI 组件
```

## 常用命令

```bash
# 开发
pnpm dev

# 构建/启动
pnpm build
pnpm start

# 代码质量
pnpm lint
pnpm lint:fix

# 数据库
pnpm db:generate
pnpm db:push
pnpm db:migrate
pnpm db:studio
pnpm db:seed
```

## Docker 部署

```bash
# 构建镜像
docker build -t nextadminhono:latest .

# 运行
docker compose up -d

# 查看日志
docker compose logs -f app
```

## 文档索引

- [01-01-项目概览](./docs/01-01-项目概览.md)
- [01-02-AI开发指引](./docs/01-02-AI开发指引.md)
- [01-03-新增模块指南](./docs/01-03-新增模块指南.md)
- [02-01-目录结构](./docs/02-01-目录结构.md)
- [02-02-架构设计](./docs/02-02-架构设计.md)
- [02-03-数据库设计](./docs/02-03-数据库设计.md)
- [02-04-工程标准](./docs/02-04-工程标准.md)
- [03-01-服务端开发](./docs/03-01-服务端开发.md)
- [03-02-客户端开发](./docs/03-02-客户端开发.md)
- [03-03-认证与权限](./docs/03-03-认证与权限.md)
- [03-04-错误处理](./docs/03-04-错误处理.md)
- [03-05-安全白皮书](./docs/03-05-安全白皮书.md)
- [04-01-测试指南](./docs/04-01-测试指南.md)
- [04-02-可观测性](./docs/04-02-可观测性.md)
- [05-01-部署与运维](./docs/05-01-部署与运维.md)
- [05-02-配置管理](./docs/05-02-配置管理.md)
