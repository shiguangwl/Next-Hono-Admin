export interface StorageConfigVo {
  endpoint: string | null
  region: string | null
  bucket: string | null
  accessKeyId: string | null
  secretAccessKeyMasked: string | null
  publicUrl: string | null
  forcePathStyle: boolean
  maxFileSize: number
  allowedExtensions: string[]
  isConfigured: boolean
}

export interface UpdateStorageConfigInput {
  endpoint: string
  region?: string
  bucket: string
  accessKeyId: string
  secretAccessKey?: string
  publicUrl?: string
  forcePathStyle?: boolean
  maxFileSize?: number
  allowedExtensions?: string[]
}

export interface FileQuery {
  prefix?: string
  page?: number
  pageSize?: number
  mimeType?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface FileVo {
  id: number
  fileKey: string
  fileName: string
  fileSize: number
  mimeType: string
  isPublic: number
  uploaderId: number | null
  uploaderName: string | null
  createdAt: string
  updatedAt: string
}

export interface PresignResult {
  uploadUrl: string
  fileKey: string
}

export interface ConfirmUploadInput {
  fileKey: string
  fileName: string
  fileSize: number
  mimeType: string
  isPublic?: number
}

export interface FolderInfo {
  name: string
  prefix: string
  fileCount: number
}

export interface UploadViaServerInput {
  prefix: string
  fileName: string
  fileBuffer: Buffer
  contentType: string
  isPublic: number
  uploaderId: number | null
  uploaderName: string | null
}

export const FOLDER_PLACEHOLDER_NAME = '.folder'
export const FOLDER_PLACEHOLDER_MIME = 'application/x-directory'

// WHY: Drizzle ORM 参数化查询防止 SQL 注入，但 LIKE 通配符 % 和 _ 未被参数化转义
export function escapeLikePattern(input: string): string {
  return input.replace(/[%_\\]/g, '\\$&')
}

