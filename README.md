# NextAdminHono

> 基于 Next.js + Hono 的企业级后台管理系统脚手架（类型安全、可扩展、生产可用）

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![Hono](https://img.shields.io/badge/Hono-orange?logo=hono)](https://hono.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-blue?logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green)](./LICENSE)

## 项目简介

NextAdminHono 以「前后端一体 + 端到端类型安全」为核心目标，提供后台系统常见能力：认证、权限、审计、日志、CRUD、OpenAPI 文档与可复用的 Hooks/路由工厂，方便快速扩展业务模块。

## 功能概览

- JWT 认证、RBAC 权限（菜单/按钮）
- OpenAPI 文档与 Swagger UI
- 请求级上下文、结构化日志、审计日志
- CRUD 路由工厂 + React Query Hooks 工厂
- MySQL + Drizzle ORM（类型安全 Schema）
- Docker 生产部署

## 技术栈

- Frontend: Next.js App Router、React 19、@tanstack/react-query、Zustand、TailwindCSS 4、HeroUI 3
- Backend: Hono、@hono/zod-openapi、Drizzle ORM、MySQL2、Zod
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
- `JWT_SECRET`（至少 32 字符）
- `JWT_EXPIRES_IN`（如 7d / 1h / 30m）
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

OpenAPI/Swagger：

- OpenAPI JSON: `/api/doc`
- Swagger UI: `/api/swagger`

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

- [01-架构设计](./docs/01-架构设计.md)
- [02-服务端分层](./docs/02-服务端分层.md)
- [03-数据库配置](./docs/03-数据库配置.md)
- [04-认证与权限](./docs/04-认证与权限.md)
- [05-客户端集成](./docs/05-客户端集成.md)
- [06-错误处理](./docs/06-错误处理.md)
- [07-日志系统](./docs/07-日志系统.md)
- [08-部署指南](./docs/08-部署指南.md)
- [09-最佳实践](./docs/09-最佳实践.md)
- [10-前端开发规范](./docs/10-前端开发规范.md)

## 开源协议

[MIT License](./LICENSE)
