import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getApiClient, unwrapApiData } from '@/lib/client'
import { createQueryKeys } from '../create-resource'

const getClient = () => getApiClient().storage

export const storageKeys = {
  ...createQueryKeys('storage'),
  config: () => ['storage', 'config'] as const,
  folders: (prefix: string) => ['storage', 'folders', prefix] as const,
}

export function useStorageConfig() {
  return useQuery({
    queryKey: storageKeys.config(),
    queryFn: async () => {
      const response = await getClient().config.$get({})
      return unwrapApiData(response, '获取存储配置失败')
    },
  })
}

export function useUpdateStorageConfig() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: {
      endpoint: string
      region?: string
      bucket: string
      accessKeyId: string
      secretAccessKey?: string
      publicUrl?: string
      forcePathStyle?: boolean
      maxFileSize?: number
      allowedExtensions?: string[]
    }) => {
      const response = await getClient().config.$put({ json: input })
      return unwrapApiData(response, '更新存储配置失败')
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: storageKeys.config() })
    },
  })
}

export function useTestStorageConnection() {
  return useMutation({
    mutationFn: async (input: {
      endpoint: string
      region?: string
      bucket: string
      accessKeyId: string
      secretAccessKey?: string
      forcePathStyle?: boolean
    }) => {
      const response = await getClient().config.test.$post({ json: input })
      return unwrapApiData<{ success: boolean; message: string }>(response, '测试连接失败')
    },
  })
}

export function useStorageFiles(params: {
  prefix?: string
  page?: number
  pageSize?: number
  mimeType?: string
}) {
  return useQuery({
    queryKey: storageKeys.list(params as Record<string, unknown>),
    queryFn: async () => {
      const query: Record<string, string> = {}
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== null) query[k] = String(v)
      }
      const response = await getClient().files.$get({ query })
      return unwrapApiData(response, '获取文件列表失败')
    },
  })
}

export function useStorageFolders(prefix: string) {
  return useQuery({
    queryKey: storageKeys.folders(prefix),
    queryFn: async () => {
      const response = await getClient().files.folders.$get({
        query: { prefix },
      })
      return unwrapApiData(response, '获取目录列表失败')
    },
  })
}

export function useCreateFolder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: { prefix: string; folderName: string }) => {
      const response = await getClient().files.folder.$post({
        json: input,
      })
      return unwrapApiData(response, '创建目录失败')
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: storageKeys.all })
    },
  })
}

export function usePresignUpload() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: {
      prefix: string
      fileName: string
      fileSize: number
      contentType: string
    }) => {
      const response = await getClient().files.presign.$post({
        json: input,
      })
      return unwrapApiData<{ uploadUrl: string; fileKey: string }>(response, '获取上传链接失败')
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: storageKeys.all })
    },
  })
}

export function useConfirmUpload() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: {
      fileKey: string
      fileName: string
      fileSize: number
      mimeType: string
      isPublic?: number
    }) => {
      const response = await getClient().files.confirm.$post({
        json: input,
      })
      return unwrapApiData(response, '确认上传失败')
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: storageKeys.all })
    },
  })
}

export function useGetFileUrl() {
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await getClient().files[':id'].url.$get({
        param: { id: String(id) },
      })
      return unwrapApiData<{ url: string; isPublic: boolean }>(response, '获取文件链接失败')
    },
  })
}

export function useDeleteFile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await getClient().files[':id'].$delete({
        param: { id: String(id) },
      })
      return unwrapApiData(response, '删除文件失败')
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: storageKeys.all })
    },
  })
}

export function useUpdateFile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (args: { id: number; input: { fileName?: string; isPublic?: number } }) => {
      const response = await getClient().files[':id'].$patch({
        param: { id: String(args.id) },
        json: args.input,
      })
      return unwrapApiData(response, '更新文件失败')
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: storageKeys.all })
    },
  })
}

export function useDeleteFolder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (prefix: string) => {
      const response = await getClient().files.folder.$delete({
        json: { prefix },
      })
      return unwrapApiData(response, '删除目录失败')
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: storageKeys.all })
    },
  })
}
