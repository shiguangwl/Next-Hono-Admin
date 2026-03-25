import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { sysConfig } from '@/db/schema'
import { STORAGE_CONFIG_GROUP, STORAGE_CONFIG_KEYS, STORAGE_DEFAULTS } from '@/lib/constants'
import { getConfigValue, removeConfigCache } from '../system/config/config.utils'
import { decryptSecret, encryptSecret, maskSecret } from './crypto'
import { invalidateS3Client, testConnection, testConnectionWithParams } from './s3-client'
import type { StorageConfigVo, UpdateStorageConfigInput } from './types'

// WHY: executor 参数允许在事务/非事务环境下共用同一逻辑
async function upsertConfigItem(
  executor: Pick<typeof db, 'select' | 'insert' | 'update'>,
  key: string,
  value: string | null,
  name: string,
  type = 'string'
): Promise<void> {
  const existing = await executor
    .select({ id: sysConfig.id })
    .from(sysConfig)
    .where(eq(sysConfig.configKey, key))
    .limit(1)
    .then((rows) => rows[0])

  if (existing) {
    await executor
      .update(sysConfig)
      .set({ configValue: value, configType: type })
      .where(eq(sysConfig.id, existing.id))
  } else {
    await executor.insert(sysConfig).values({
      configKey: key,
      configValue: value,
      configType: type,
      configGroup: STORAGE_CONFIG_GROUP,
      configName: name,
      isSystem: 1,
      status: 1,
    })
  }
  removeConfigCache(key)
}

export async function getStorageConfig(): Promise<StorageConfigVo> {
  const K = STORAGE_CONFIG_KEYS

  const [
    endpoint,
    region,
    bucket,
    accessKeyId,
    encryptedSecret,
    publicUrl,
    forcePathStyle,
    maxFileSize,
    extensions,
  ] = await Promise.all([
    getConfigValue<string>(K.ENDPOINT),
    getConfigValue<string>(K.REGION),
    getConfigValue<string>(K.BUCKET),
    getConfigValue<string>(K.ACCESS_KEY_ID),
    getConfigValue<string>(K.SECRET_ACCESS_KEY),
    getConfigValue<string>(K.PUBLIC_URL),
    getConfigValue<boolean>(K.FORCE_PATH_STYLE),
    getConfigValue<number>(K.MAX_FILE_SIZE),
    getConfigValue<string[]>(K.ALLOWED_EXTENSIONS),
  ])

  const isConfigured = Boolean(endpoint && bucket && accessKeyId && encryptedSecret)

  return {
    endpoint: endpoint ?? null,
    region: region ?? null,
    bucket: bucket ?? null,
    accessKeyId: accessKeyId ?? null,
    secretAccessKeyMasked: encryptedSecret ? maskSecret('configured') : null,
    publicUrl: publicUrl ?? null,
    forcePathStyle: forcePathStyle ?? false,
    maxFileSize: maxFileSize ?? STORAGE_DEFAULTS.MAX_FILE_SIZE,
    allowedExtensions: extensions ?? [...STORAGE_DEFAULTS.ALLOWED_EXTENSIONS],
    isConfigured,
  }
}

export async function updateStorageConfig(
  input: UpdateStorageConfigInput
): Promise<StorageConfigVo> {
  const K = STORAGE_CONFIG_KEYS

  // WHY: 事务保证配置原子更新，中途失败时自动回滚
  await db.transaction(async (tx) => {
    await upsertConfigItem(tx, K.ENDPOINT, input.endpoint, 'S3端点')
    await upsertConfigItem(tx, K.REGION, input.region ?? 'auto', 'S3区域')
    await upsertConfigItem(tx, K.BUCKET, input.bucket, 'S3桶名')
    await upsertConfigItem(tx, K.ACCESS_KEY_ID, input.accessKeyId, 'S3访问密钥ID')

    if (input.secretAccessKey) {
      const encrypted = encryptSecret(input.secretAccessKey)
      await upsertConfigItem(tx, K.SECRET_ACCESS_KEY, encrypted, 'S3密钥')
    }

    await upsertConfigItem(tx, K.PUBLIC_URL, input.publicUrl ?? '', 'S3公开URL前缀')
    await upsertConfigItem(
      tx,
      K.FORCE_PATH_STYLE,
      String(input.forcePathStyle ?? false),
      'S3路径风格',
      'boolean'
    )
    await upsertConfigItem(
      tx,
      K.MAX_FILE_SIZE,
      String(input.maxFileSize ?? STORAGE_DEFAULTS.MAX_FILE_SIZE),
      '最大文件大小',
      'number'
    )
    await upsertConfigItem(
      tx,
      K.ALLOWED_EXTENSIONS,
      JSON.stringify(input.allowedExtensions ?? STORAGE_DEFAULTS.ALLOWED_EXTENSIONS),
      '允许的扩展名',
      'array'
    )
  })

  invalidateS3Client()
  return getStorageConfig()
}

export interface TestConnectionInput {
  endpoint: string
  region?: string
  bucket: string
  accessKeyId: string
  secretAccessKey?: string
  forcePathStyle?: boolean
}

export async function testStorageConnection(
  input?: TestConnectionInput
): Promise<{ success: boolean; message: string }> {
  try {
    if (input) {
      let secret = input.secretAccessKey ?? ''
      if (!secret) {
        // WHY: 表单未填新密钥时，使用数据库中已加密存储的密钥
        const encrypted = await getConfigValue<string>(STORAGE_CONFIG_KEYS.SECRET_ACCESS_KEY)
        if (!encrypted) {
          return { success: false, message: '请提供 Secret Access Key' }
        }
        secret = decryptSecret(encrypted)
      }
      await testConnectionWithParams({
        ...input,
        secretAccessKey: secret,
      })
    } else {
      await testConnection()
    }
    return { success: true, message: '连接成功' }
  } catch (error: unknown) {
    return { success: false, message: `连接失败: ${extractS3Error(error)}` }
  }
}

function extractS3Error(error: unknown): string {
  // WHY: AWS SDK 错误包含 name/$metadata 等结构化信息，需逐级提取
  const parts: string[] = []

  if (error && typeof error === 'object') {
    const err = error as Record<string, unknown>

    if (err.name && err.name !== 'Error') parts.push(`[${err.name}]`)
    if (err.Code) parts.push(String(err.Code))

    if (typeof err.message === 'string' && err.message) {
      parts.push(err.message)
    }

    const meta = err.$metadata as Record<string, unknown> | undefined
    if (meta?.httpStatusCode) {
      parts.push(`HTTP ${meta.httpStatusCode}`)
    }
  }

  return parts.length > 0 ? parts.join(' ') : '未知错误'
}
