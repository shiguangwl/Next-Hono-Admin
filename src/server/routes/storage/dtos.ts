import { z } from 'zod'
import { SortablePaginationQuerySchema } from '../shared'

export const UpdateStorageConfigSchema = z.object({
  endpoint: z.string().url().min(1),
  region: z.string().optional().default('auto'),
  bucket: z.string().min(1).max(100),
  accessKeyId: z.string().min(1).max(200),
  secretAccessKey: z.string().min(1).max(200).optional(),
  publicUrl: z.string().url().optional().or(z.literal('')),
  forcePathStyle: z.boolean().optional().default(false),
  maxFileSize: z.number().int().positive().optional(),
  allowedExtensions: z
    .union([
      z.array(z.string().max(10)),
      // WHY: Hono client 序列化数组时可能变成 {"0":"jpg","1":"jpeg",...} 对象
      z.record(z.string(), z.string().max(10)).transform((obj) => Object.values(obj)),
    ])
    .optional(),
})

export const TestConnectionSchema = z.object({
  endpoint: z.string().url().min(1),
  region: z.string().optional().default('auto'),
  bucket: z.string().min(1).max(100),
  accessKeyId: z.string().min(1).max(200),
  secretAccessKey: z.string().max(200).optional(),
  forcePathStyle: z.boolean().optional().default(false),
})

export const FileQuerySchema = SortablePaginationQuerySchema.extend({
  prefix: z.string().max(500).optional(),
  mimeType: z.string().max(100).optional(),
})

export const PresignRequestSchema = z.object({
  prefix: z.string().max(500).default(''),
  fileName: z.string().min(1).max(255),
  fileSize: z.number().int().positive(),
  contentType: z.string().min(1).max(100),
})

export const ConfirmUploadSchema = z.object({
  fileKey: z.string().min(1).max(500),
  fileName: z.string().min(1).max(255),
  fileSize: z.number().int().positive(),
  mimeType: z.string().min(1).max(100),
  isPublic: z.number().int().min(0).max(1).optional().default(0),
})

export const UpdateFileSchema = z.object({
  fileName: z.string().min(1).max(255).optional(),
  isPublic: z.number().int().min(0).max(1).optional(),
})

export const FolderPrefixSchema = z.object({
  prefix: z.string().max(500).optional().default(''),
})

export const FolderCreateSchema = z.object({
  prefix: z.string().max(500).default(''),
  folderName: z.string().min(1).max(100)
    .regex(/^[a-zA-Z0-9\u4e00-\u9fa5_-]+$/, '目录名仅支持中英文、数字、下划线和短横线'),
})

export const FolderDeleteSchema = z.object({
  prefix: z.string().min(1).max(500),
})
