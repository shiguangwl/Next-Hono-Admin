# S3 对象存储服务设计

## 需求概要

- S3 兼容端点：完全自定义，管理员可填写任意 S3 兼容 endpoint
- 带目录结构的完整文件管理器
- 单配置模式：系统全局只配一个存储
- 混合访问：上传时选择公开/私有
- 双上传模式：客户端直传（预签名）+ 后端中转
- 文件限制：硬编码默认值，配置可覆盖

## 数据模型

### S3 配置（复用 sys_config 表，storage 分组）

| configKey | configType | 说明 |
|---|---|---|
| storage.endpoint | string | S3 兼容端点 URL |
| storage.region | string | 区域 |
| storage.bucket | string | 存储桶名 |
| storage.access_key_id | string | 访问密钥 ID |
| storage.secret_access_key | string | 访问密钥（AES-256-GCM 加密） |
| storage.public_url | string | CDN/域名前缀（可选） |
| storage.force_path_style | boolean | Path Style（MinIO 需要） |
| storage.max_file_size | number | 最大文件大小(bytes)，默认 50MB |
| storage.allowed_extensions | json | 允许的扩展名列表 |

### storage_file 表（新建）

| 字段 | 类型 | 说明 |
|---|---|---|
| id | BIGINT PK | 自增主键 |
| file_key | VARCHAR(500) | S3 Object Key（含路径前缀） |
| file_name | VARCHAR(255) | 原始文件名 |
| file_size | BIGINT | 文件大小(bytes) |
| mime_type | VARCHAR(100) | MIME 类型 |
| is_public | TINYINT | 0=私有 1=公开 |
| uploader_id | BIGINT | 上传者 admin ID |
| uploader_name | VARCHAR(50) | 上传者名称 |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

索引：uk_file_key, idx_uploader_id, idx_mime_type

虚拟目录通过 file_key 路径前缀实现，无需独立目录表。

## 后端 API

路由挂载于 `/api/storage`

| 方法 | 路径 | 权限 | 说明 |
|---|---|---|---|
| GET | /config | storage:config:query | 获取 S3 配置 |
| PUT | /config | storage:config:update | 更新 S3 配置 |
| POST | /config/test | storage:config:update | 测试连接 |
| GET | /files | storage:file:list | 文件列表（前缀浏览、分页） |
| GET | /files/folders | storage:file:list | 虚拟目录列表 |
| POST | /files/upload | storage:file:upload | 后端中转上传 |
| POST | /files/presign | storage:file:upload | 预签名上传 URL |
| POST | /files/confirm | storage:file:upload | 确认预签名上传 |
| GET | /files/:id/url | storage:file:list | 获取访问 URL |
| DELETE | /files/:id | storage:file:delete | 删除文件 |
| PATCH | /files/:id | storage:file:update | 更新文件属性 |
| POST | /files/folder | storage:file:upload | 创建虚拟目录 |
| DELETE | /files/folder | storage:file:delete | 删除虚拟目录 |

## 服务层结构

```
src/server/services/storage/
├── index.ts
├── types.ts
├── s3-client.ts                  — 懒初始化 + 配置变更时重建
├── storage-config.service.ts     — 配置 CRUD
└── storage-file.service.ts       — 文件管理
```

## S3 客户端策略

- 懒初始化：首次调用时根据 sys_config 创建 S3Client 并缓存
- 配置变更时自动清除缓存，下次调用重新创建
- 统一通过 getS3Client() 获取

## 安全设计

- secret_access_key：AES-256-GCM 加密存储，密钥通过 STORAGE_ENCRYPTION_KEY 环境变量注入
- API 返回时脱敏（仅显示末尾 4 位）
- 预签名 URL 过期：上传 15min、下载 1h
- 所有 API 通过 RBAC requirePermission 保护
- 文件大小和扩展名前后端双重校验

## 错误处理

- S3 未配置 → 400「请先配置存储服务」
- S3 连接失败 → 502「存储服务不可用」
- 文件超大 → 后端 body limit 拦截 + 前端配置校验
- 非法扩展名 → 上传前拒绝
- 文件 Key 冲突 → 追加时间戳后缀
- 删除顺序：先删 S3，再删 DB（S3 失败中止，无损）

## 目录批量删除安全

- 先查询前缀下文件数量返回前端
- 前端二次确认
- 单次上限 100 文件，超出分批

## 前端 UI

左右分栏：左侧目录树 + 右侧文件列表（表格/网格双模式）

```
src/app/(dashboard)/storage/
├── config/page.tsx
└── files/
    ├── page.tsx
    ├── folder-tree.tsx
    ├── file-list.tsx
    ├── file-columns.tsx
    ├── file-upload-dialog.tsx
    ├── file-preview-dialog.tsx
    └── folder-create-dialog.tsx
```

## 依赖新增

- @aws-sdk/client-s3
- @aws-sdk/s3-request-presigner

## 集成变更

| 文件 | 变更 |
|---|---|
| src/db/schema/index.ts | export storage-file |
| src/server/route-defs.ts | .route('/storage', storage) |
| src/server/services/index.ts | export storage |
| src/lib/constants.ts | 存储常量 |
| src/env.ts | STORAGE_ENCRYPTION_KEY |
| 菜单 seed | 存储管理菜单 + 权限标识 |
