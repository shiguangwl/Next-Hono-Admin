import { and, count, desc, eq, like, not } from 'drizzle-orm'
import { db } from '@/db'
import { storageFile } from '@/db/schema'
import { STORAGE_CONFIG_KEYS } from '@/lib/constants'
import { formatDateToLocal } from '@/lib/date'
import { NotFoundError } from '@/lib/errors'
import {
  buildPaginatedResult,
  normalizePagination,
  type PaginatedResult,
} from '@/server/utils/pagination'
import { getConfigValue } from '../system/config/config.utils'
import { presignDownloadUrl } from './s3-client'
import type { FileQuery, FileVo, FolderInfo } from './types'
import { escapeLikePattern, FOLDER_PLACEHOLDER_MIME } from './types'

export function toFileVo(row: typeof storageFile.$inferSelect): FileVo {
  return {
    id: row.id,
    fileKey: row.fileKey,
    fileName: row.fileName,
    fileSize: row.fileSize,
    mimeType: row.mimeType,
    isPublic: row.isPublic,
    uploaderId: row.uploaderId,
    uploaderName: row.uploaderName,
    createdAt: formatDateToLocal(row.createdAt) ?? '',
    updatedAt: formatDateToLocal(row.updatedAt) ?? '',
  }
}

export async function listFiles(query: FileQuery): Promise<PaginatedResult<FileVo>> {
  const { page, pageSize, offset } = normalizePagination(query)
  const whereClauses = [not(eq(storageFile.mimeType, FOLDER_PLACEHOLDER_MIME))]

  if (query.prefix) {
    const escaped = escapeLikePattern(query.prefix)
    whereClauses.push(like(storageFile.fileKey, `${escaped}%`))
  }
  if (query.mimeType) {
    const escaped = escapeLikePattern(query.mimeType)
    whereClauses.push(like(storageFile.mimeType, `${escaped}%`))
  }

  const where = and(...whereClauses)

  const [items, totalResult] = await Promise.all([
    db
      .select()
      .from(storageFile)
      .where(where as never)
      .orderBy(desc(storageFile.createdAt))
      .limit(pageSize)
      .offset(offset),
    db
      .select({ count: count() })
      .from(storageFile)
      .where(where as never)
      .then((rows) => rows[0]),
  ])

  return buildPaginatedResult(items.map(toFileVo), Number(totalResult?.count ?? 0), page, pageSize)
}

export async function listFolders(prefix: string): Promise<FolderInfo[]> {
  const normalizedPrefix = prefix.replace(/\/+$/, '')
  const escaped = escapeLikePattern(normalizedPrefix)
  const likePattern = normalizedPrefix ? `${escaped}/%` : '%'
  const prefixDepth = normalizedPrefix ? normalizedPrefix.split('/').length : 0

  const rows = await db
    .select({
      fileKey: storageFile.fileKey,
      mimeType: storageFile.mimeType,
    })
    .from(storageFile)
    .where(like(storageFile.fileKey, likePattern))

  const folderMap = new Map<string, number>()
  for (const row of rows) {
    const parts = row.fileKey.split('/')
    if (parts.length > prefixDepth + 1) {
      const folderName = parts[prefixDepth]
      const isPlaceholder = row.mimeType === FOLDER_PLACEHOLDER_MIME
      const prev = folderMap.get(folderName) ?? 0
      folderMap.set(folderName, prev + (isPlaceholder ? 0 : 1))
    }
  }

  return Array.from(folderMap.entries())
    .map(([name, fileCount]) => ({
      name,
      prefix: normalizedPrefix ? `${normalizedPrefix}/${name}` : name,
      fileCount,
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

export async function getFileUrl(id: number): Promise<{ url: string; isPublic: boolean }> {
  const row = await db
    .select()
    .from(storageFile)
    .where(eq(storageFile.id, id))
    .limit(1)
    .then((r) => r[0])

  if (!row) throw new NotFoundError('StorageFile', id)

  if (row.isPublic === 1) {
    const publicUrl = await getConfigValue<string>(STORAGE_CONFIG_KEYS.PUBLIC_URL)
    if (publicUrl) {
      const base = publicUrl.replace(/\/+$/, '')
      return { url: `${base}/${row.fileKey}`, isPublic: true }
    }
  }

  const url = await presignDownloadUrl(row.fileKey)
  return { url, isPublic: row.isPublic === 1 }
}

export async function getFolderFileCount(prefix: string): Promise<number> {
  const normalized = prefix.replace(/\/+$/, '')
  if (!normalized) return 0

  const escaped = escapeLikePattern(normalized)
  const result = await db
    .select({ count: count() })
    .from(storageFile)
    .where(like(storageFile.fileKey, `${escaped}/%`))
    .then((r) => r[0])

  return Number(result?.count ?? 0)
}
