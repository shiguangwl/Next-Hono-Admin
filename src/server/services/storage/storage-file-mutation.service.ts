import { eq, inArray, like } from 'drizzle-orm'
import { db } from '@/db'
import { storageFile } from '@/db/schema'
import { STORAGE_CONFIG_KEYS, STORAGE_DEFAULTS } from '@/lib/constants'
import { BusinessError, NotFoundError, ValidationError } from '@/lib/errors'
import { handleDatabaseError } from '@/lib/errors'
import { getConfigValue } from '../system/config/config.utils'
import {
  DeleteObjectCommand,
  getBucket,
  getS3Client,
  presignUploadUrl,
  PutObjectCommand,
} from './s3-client'
import { toFileVo } from './storage-file-query.service'
import type {
  ConfirmUploadInput,
  FileVo,
  FolderInfo,
  PresignResult,
  UploadViaServerInput,
} from './types'
import {
  escapeLikePattern,
  FOLDER_PLACEHOLDER_MIME,
  FOLDER_PLACEHOLDER_NAME,
} from './types'

async function validateUpload(
  fileName: string,
  fileSize: number
): Promise<void> {
  const maxSize =
    (await getConfigValue<number>(STORAGE_CONFIG_KEYS.MAX_FILE_SIZE)) ??
    STORAGE_DEFAULTS.MAX_FILE_SIZE

  if (fileSize > maxSize) {
    const maxMb = Math.round(maxSize / 1024 / 1024)
    throw new ValidationError(`文件大小超出限制 (最大 ${maxMb}MB)`)
  }

  const allowed =
    (await getConfigValue<string[]>(STORAGE_CONFIG_KEYS.ALLOWED_EXTENSIONS)) ??
    ([...STORAGE_DEFAULTS.ALLOWED_EXTENSIONS] as string[])

  const ext = fileName.split('.').pop()?.toLowerCase()
  if (ext && allowed.length > 0 && !allowed.includes(ext)) {
    throw new ValidationError(`不允许的文件类型: .${ext}`)
  }
}

function buildUniqueKey(prefix: string, fileName: string): string {
  const timestamp = Date.now()
  const rand = Math.random().toString(36).substring(2, 8)
  const normalized = prefix.replace(/\/+$/, '')
  const uniqueName = `${timestamp}-${rand}-${fileName}`
  return normalized ? `${normalized}/${uniqueName}` : uniqueName
}

export async function createFolder(
  prefix: string,
  folderName: string,
  uploaderId: number | null,
  uploaderName: string | null
): Promise<FolderInfo> {
  const normalized = prefix.replace(/\/+$/, '')
  const folderPath = normalized
    ? `${normalized}/${folderName}`
    : folderName
  const fileKey = `${folderPath}/${FOLDER_PLACEHOLDER_NAME}`

  const client = await getS3Client()
  const bucket = await getBucket()
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: fileKey,
      Body: Buffer.alloc(0),
      ContentType: FOLDER_PLACEHOLDER_MIME,
    })
  )

  // WHY: fileKey 有 UNIQUE 索引，利用 DB 约束替代先查后写的 TOCTOU
  try {
    await db.insert(storageFile).values({
      fileKey,
      fileName: FOLDER_PLACEHOLDER_NAME,
      fileSize: 0,
      mimeType: FOLDER_PLACEHOLDER_MIME,
      isPublic: 0,
      uploaderId,
      uploaderName,
    })
  } catch (err) {
    throw handleDatabaseError(err)
  }

  return { name: folderName, prefix: folderPath, fileCount: 0 }
}

export async function requestPresignUpload(
  prefix: string,
  fileName: string,
  fileSize: number,
  contentType: string
): Promise<PresignResult> {
  await validateUpload(fileName, fileSize)
  const fileKey = buildUniqueKey(prefix, fileName)
  const uploadUrl = await presignUploadUrl(fileKey, contentType)
  return { uploadUrl, fileKey }
}

export async function confirmUpload(
  input: ConfirmUploadInput,
  uploaderId: number | null,
  uploaderName: string | null
): Promise<FileVo> {
  const [insertResult] = await db.insert(storageFile).values({
    fileKey: input.fileKey,
    fileName: input.fileName,
    fileSize: input.fileSize,
    mimeType: input.mimeType,
    isPublic: input.isPublic ?? 0,
    uploaderId,
    uploaderName,
  })

  const id = Number(insertResult.insertId)
  const row = await db
    .select()
    .from(storageFile)
    .where(eq(storageFile.id, id))
    .limit(1)
    .then((r) => r[0])

  if (!row) throw new NotFoundError('StorageFile', id)
  return toFileVo(row)
}

export async function uploadViaServer(
  input: UploadViaServerInput
): Promise<FileVo> {
  await validateUpload(input.fileName, input.fileBuffer.length)

  const fileKey = buildUniqueKey(input.prefix, input.fileName)
  const client = await getS3Client()
  const bucket = await getBucket()

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: fileKey,
      Body: input.fileBuffer,
      ContentType: input.contentType,
    })
  )

  return confirmUpload(
    {
      fileKey,
      fileName: input.fileName,
      fileSize: input.fileBuffer.length,
      mimeType: input.contentType,
      isPublic: input.isPublic,
    },
    input.uploaderId,
    input.uploaderName
  )
}

export async function deleteFile(id: number): Promise<void> {
  const row = await db
    .select()
    .from(storageFile)
    .where(eq(storageFile.id, id))
    .limit(1)
    .then((r) => r[0])

  if (!row) throw new NotFoundError('StorageFile', id)

  // WHY: 先删 S3 再删 DB，S3 失败时 DB 记录完好无损
  const client = await getS3Client()
  const bucket = await getBucket()
  await client.send(
    new DeleteObjectCommand({ Bucket: bucket, Key: row.fileKey })
  )
  await db.delete(storageFile).where(eq(storageFile.id, id))
}

export async function updateFile(
  id: number,
  input: { fileName?: string; isPublic?: number }
): Promise<FileVo> {
  const row = await db
    .select()
    .from(storageFile)
    .where(eq(storageFile.id, id))
    .limit(1)
    .then((r) => r[0])

  if (!row) throw new NotFoundError('StorageFile', id)

  await db
    .update(storageFile)
    .set({
      fileName: input.fileName ?? row.fileName,
      isPublic: input.isPublic ?? row.isPublic,
    })
    .where(eq(storageFile.id, id))

  const updated = await db
    .select()
    .from(storageFile)
    .where(eq(storageFile.id, id))
    .limit(1)
    .then((r) => r[0])

  if (!updated) throw new NotFoundError('StorageFile', id)
  return toFileVo(updated)
}

export async function deleteFolder(
  prefix: string
): Promise<{ deleted: number }> {
  const normalized = prefix.replace(/\/+$/, '')
  if (!normalized) throw new ValidationError('不能删除根目录')

  const escaped = escapeLikePattern(normalized)
  const files = await db
    .select()
    .from(storageFile)
    .where(like(storageFile.fileKey, `${escaped}/%`))
    .limit(STORAGE_DEFAULTS.BATCH_DELETE_LIMIT + 1)

  if (files.length > STORAGE_DEFAULTS.BATCH_DELETE_LIMIT) {
    throw new BusinessError(
      `目录下文件数量超过 ${STORAGE_DEFAULTS.BATCH_DELETE_LIMIT}，请先清理子目录`
    )
  }

  if (files.length === 0) return { deleted: 0 }

  const client = await getS3Client()
  const bucket = await getBucket()

  // WHY: 先全部删 S3，再事务批量删 DB，减少不一致窗口
  for (const file of files) {
    await client.send(
      new DeleteObjectCommand({ Bucket: bucket, Key: file.fileKey })
    )
  }

  const fileIds = files.map((f) => f.id)
  await db.transaction(async (tx) => {
    await tx.delete(storageFile).where(inArray(storageFile.id, fileIds))
  })

  return { deleted: files.length }
}
