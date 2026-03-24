// WHY: 超级管理员不可删除、不可修改角色
export const SUPER_ADMIN_ID = 1

export const DEFAULT_SESSION_COOKIE_NAME = 'auth_session'

export const HEALTH_CHECK_PATH = '/api/health'

export const STORAGE_CONFIG_GROUP = 'storage'

export const STORAGE_DEFAULTS = {
  MAX_FILE_SIZE: 50 * 1024 * 1024,
  MAX_UPLOAD_MEMORY: 200 * 1024 * 1024,
  PRESIGN_UPLOAD_EXPIRES: 15 * 60,
  PRESIGN_DOWNLOAD_EXPIRES: 60 * 60,
  BATCH_DELETE_LIMIT: 100,
  ALLOWED_EXTENSIONS: [
    'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'ico',
    'mp4', 'webm', 'mov',
    'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
    'zip', 'rar', '7z', 'tar', 'gz',
    'txt', 'csv', 'json', 'xml', 'md',
  ],
} as const

export const STORAGE_CONFIG_KEYS = {
  ENDPOINT: 'storage.endpoint',
  REGION: 'storage.region',
  BUCKET: 'storage.bucket',
  ACCESS_KEY_ID: 'storage.access_key_id',
  SECRET_ACCESS_KEY: 'storage.secret_access_key',
  PUBLIC_URL: 'storage.public_url',
  FORCE_PATH_STYLE: 'storage.force_path_style',
  MAX_FILE_SIZE: 'storage.max_file_size',
  ALLOWED_EXTENSIONS: 'storage.allowed_extensions',
} as const
