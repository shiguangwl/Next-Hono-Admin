import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { STORAGE_CONFIG_KEYS, STORAGE_DEFAULTS } from '@/lib/constants'
import { BusinessError } from '@/lib/errors'
import { getConfigValue } from '../system/config/config.utils'
import { decryptSecret } from './crypto'

let cachedClient: S3Client | null = null

export function invalidateS3Client(): void {
  cachedClient?.destroy()
  cachedClient = null
}

export async function getS3Client(): Promise<S3Client> {
  if (cachedClient) return cachedClient

  const endpoint = await getConfigValue<string>(STORAGE_CONFIG_KEYS.ENDPOINT)
  const region = await getConfigValue<string>(STORAGE_CONFIG_KEYS.REGION)
  const accessKeyId = await getConfigValue<string>(STORAGE_CONFIG_KEYS.ACCESS_KEY_ID)
  const encryptedSecret = await getConfigValue<string>(STORAGE_CONFIG_KEYS.SECRET_ACCESS_KEY)
  const forcePathStyle = await getConfigValue<boolean>(STORAGE_CONFIG_KEYS.FORCE_PATH_STYLE)

  if (!endpoint || !accessKeyId || !encryptedSecret) {
    throw new BusinessError('请先完成存储服务配置', 'STORAGE_NOT_CONFIGURED')
  }

  const secretAccessKey = decryptSecret(encryptedSecret)

  cachedClient = new S3Client({
    endpoint,
    region: region || 'auto',
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: forcePathStyle ?? false,
  })

  return cachedClient
}

export async function getBucket(): Promise<string> {
  const bucket = await getConfigValue<string>(STORAGE_CONFIG_KEYS.BUCKET)
  if (!bucket) {
    throw new BusinessError('请先配置存储桶名称', 'STORAGE_NOT_CONFIGURED')
  }
  return bucket
}

export async function testConnection(): Promise<void> {
  const client = await getS3Client()
  const bucket = await getBucket()
  await client.send(new HeadBucketCommand({ Bucket: bucket }))
}

export async function testConnectionWithParams(params: {
  endpoint: string
  region?: string
  bucket: string
  accessKeyId: string
  secretAccessKey: string
  forcePathStyle?: boolean
}): Promise<void> {
  const client = new S3Client({
    endpoint: params.endpoint,
    region: params.region || 'auto',
    credentials: {
      accessKeyId: params.accessKeyId,
      secretAccessKey: params.secretAccessKey,
    },
    forcePathStyle: params.forcePathStyle ?? false,
  })
  try {
    await client.send(new HeadBucketCommand({ Bucket: params.bucket }))
  } finally {
    client.destroy()
  }
}

export async function presignUploadUrl(key: string, contentType: string): Promise<string> {
  const client = await getS3Client()
  const bucket = await getBucket()
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  })
  return getSignedUrl(client, command, {
    expiresIn: STORAGE_DEFAULTS.PRESIGN_UPLOAD_EXPIRES,
  })
}

export async function presignDownloadUrl(key: string): Promise<string> {
  const client = await getS3Client()
  const bucket = await getBucket()
  const command = new GetObjectCommand({ Bucket: bucket, Key: key })
  return getSignedUrl(client, command, {
    expiresIn: STORAGE_DEFAULTS.PRESIGN_DOWNLOAD_EXPIRES,
  })
}

export { DeleteObjectCommand, GetObjectCommand, ListObjectsV2Command, PutObjectCommand }
