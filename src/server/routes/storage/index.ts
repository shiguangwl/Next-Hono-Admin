import { Hono } from 'hono'
import { STORAGE_DEFAULTS } from '@/lib/constants'
import type { Env } from '@/server/context'
import { auditLog } from '@/server/middleware/audit-log'
import { requirePermission } from '@/server/middleware/rbac'
import { requireAuth } from '@/server/middleware/session-auth'
import {
  confirmUpload,
  createFolder,
  deleteFile,
  deleteFolder,
  getFileUrl,
  getStorageConfig,
  listFiles,
  listFolders,
  requestPresignUpload,
  testStorageConnection,
  updateFile,
  updateStorageConfig,
  uploadViaServer,
} from '@/server/services'
import { R } from '@/server/utils/response'
import { zValidator } from '@/server/utils/validator'
import { IdParamSchema } from '../shared'
import {
  ConfirmUploadSchema,
  FileQuerySchema,
  FolderCreateSchema,
  FolderDeleteQuerySchema,
  FolderPrefixSchema,
  PresignRequestSchema,
  TestConnectionSchema,
  UpdateFileSchema,
  UpdateStorageConfigSchema,
} from './dtos'

export const storage = new Hono<Env>()
  .use('/*', requireAuth)

  .get('/config', requirePermission('storage:config:query'), async (c) => {
    const config = await getStorageConfig()
    return R.ok(c, config)
  })
  .put(
    '/config',
    requirePermission('storage:config:update'),
    auditLog({
      module: '存储配置',
      operation: '更新',
      description: '更新S3配置',
    }),
    zValidator('json', UpdateStorageConfigSchema),
    async (c) => {
      const input = c.req.valid('json')
      const config = await updateStorageConfig(input)
      return R.ok(c, config)
    }
  )
  .post(
    '/config/test',
    requirePermission('storage:config:update'),
    zValidator('json', TestConnectionSchema),
    async (c) => {
      const input = c.req.valid('json')
      const result = await testStorageConnection(input)
      return R.ok(c, result)
    }
  )

  .get(
    '/files',
    requirePermission('storage:file:list'),
    zValidator('query', FileQuerySchema),
    async (c) => {
      const query = c.req.valid('query')
      const result = await listFiles(query)
      return R.ok(c, result)
    }
  )
  .get(
    '/files/folders',
    requirePermission('storage:file:list'),
    zValidator('query', FolderPrefixSchema),
    async (c) => {
      const { prefix } = c.req.valid('query')
      const folders = await listFolders(prefix)
      return R.ok(c, folders)
    }
  )
  .post(
    '/files/folders',
    requirePermission('storage:file:upload'),
    auditLog({
      module: '文件管理',
      operation: '创建目录',
      description: '创建新目录',
    }),
    zValidator('json', FolderCreateSchema),
    async (c) => {
      const { prefix, folderName } = c.req.valid('json')
      const admin = c.get('admin')
      const result = await createFolder(
        prefix,
        folderName,
        admin?.adminId ?? null,
        admin?.username ?? null
      )
      return R.ok(c, result)
    }
  )
  .post(
    '/files/presign',
    requirePermission('storage:file:upload'),
    zValidator('json', PresignRequestSchema),
    async (c) => {
      const input = c.req.valid('json')
      const result = await requestPresignUpload(
        input.prefix,
        input.fileName,
        input.fileSize,
        input.contentType
      )
      return R.ok(c, result)
    }
  )
  .post(
    '/files/confirm',
    requirePermission('storage:file:upload'),
    zValidator('json', ConfirmUploadSchema),
    async (c) => {
      const input = c.req.valid('json')
      const admin = c.get('admin')
      const file = await confirmUpload(input, admin?.adminId ?? null, admin?.username ?? null)
      return R.ok(c, file)
    }
  )
  .post(
    '/files/upload',
    requirePermission('storage:file:upload'),
    auditLog({
      module: '文件管理',
      operation: '上传',
      description: '上传文件',
    }),
    async (c) => {
      const formData = await c.req.formData()
      const file = formData.get('file') as File | null
      const rawPrefix = (formData.get('prefix') as string) ?? ''
      const rawIsPublic = Number(formData.get('isPublic') ?? 0)

      if (!file) return R.fail(c, '请选择文件')

      // WHY: 与其他路由保持一致的输入校验标准
      const PREFIX_MAX_LENGTH = 500
      if (rawPrefix.length > PREFIX_MAX_LENGTH) {
        return R.fail(c, `路径前缀过长 (最大 ${PREFIX_MAX_LENGTH} 字符)`)
      }
      if (rawIsPublic !== 0 && rawIsPublic !== 1) {
        return R.fail(c, 'isPublic 参数无效')
      }

      // WHY: 在分配 Buffer 前检查大小，避免大文件耗尽内存
      if (file.size > STORAGE_DEFAULTS.MAX_UPLOAD_MEMORY) {
        const maxMb = STORAGE_DEFAULTS.MAX_UPLOAD_MEMORY / 1024 / 1024
        return R.fail(c, `文件过大，最大支持 ${maxMb}MB`)
      }

      const buffer = Buffer.from(await file.arrayBuffer())
      const admin = c.get('admin')
      const result = await uploadViaServer({
        prefix: rawPrefix,
        fileName: file.name,
        fileBuffer: buffer,
        contentType: file.type,
        isPublic: rawIsPublic,
        uploaderId: admin?.adminId ?? null,
        uploaderName: admin?.username ?? null,
      })
      return R.ok(c, result)
    }
  )
  .get(
    '/files/:id/url',
    requirePermission('storage:file:list'),
    zValidator('param', IdParamSchema),
    async (c) => {
      const { id } = c.req.valid('param')
      const result = await getFileUrl(id)
      return R.ok(c, result)
    }
  )
  .patch(
    '/files/:id',
    requirePermission('storage:file:update'),
    auditLog({
      module: '文件管理',
      operation: '更新',
      description: '更新文件属性',
    }),
    zValidator('param', IdParamSchema),
    zValidator('json', UpdateFileSchema),
    async (c) => {
      const { id } = c.req.valid('param')
      const input = c.req.valid('json')
      const file = await updateFile(id, input)
      return R.ok(c, file)
    }
  )
  .delete(
    '/files/folders',
    requirePermission('storage:file:delete'),
    auditLog({
      module: '文件管理',
      operation: '删除目录',
      description: '删除虚拟目录',
    }),
    zValidator('query', FolderDeleteQuerySchema),
    async (c) => {
      const { prefix } = c.req.valid('query')
      const result = await deleteFolder(prefix)
      return R.ok(c, result)
    }
  )
  .delete(
    '/files/:id',
    requirePermission('storage:file:delete'),
    auditLog({
      module: '文件管理',
      operation: '删除',
      description: '删除文件',
    }),
    zValidator('param', IdParamSchema),
    async (c) => {
      const { id } = c.req.valid('param')
      await deleteFile(id)
      return R.success(c, '删除成功')
    }
  )
