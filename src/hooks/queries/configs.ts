/**
 * 配置 React Query Hooks
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ClientResponse } from 'hono/client'
import { getApiClient, unwrapApiData } from '@/lib/client'
import type {
  Config,
  ConfigQuery,
  PaginatedConfig,
  UpdateConfigValueInput,
} from '@/server/routes/configs/dtos'
import { createResource } from './core'

/**
 * 配置 API Client 类型
 */
type ConfigsClient = {
  $get: (args: { query: Record<string, string> }) => Promise<ClientResponse<unknown>>
  $post: (args: { json: unknown }) => Promise<ClientResponse<unknown>>
  ':id': {
    $get: (args: { param: { id: string } }) => Promise<ClientResponse<unknown>>
    $put: (args: { param: { id: string }; json: unknown }) => Promise<ClientResponse<unknown>>
    $delete: (args: { param: { id: string } }) => Promise<ClientResponse<unknown>>
  }
}

const getClient = () => (getApiClient() as unknown as { configs: ConfigsClient }).configs

/**
 * 标准 CRUD Hooks
 */
const configResource = createResource<
  PaginatedConfig,
  Config,
  {
    configKey: string
    configValue: string | null
    configType: string
    configGroup: string
    configName: string
    remark?: string | null
    isSystem?: number
    status?: number
  },
  Partial<Config>,
  ConfigQuery
>({
  resourceName: 'configs',
  getClient: getClient as any,
  messages: {
    list: '获取配置列表失败',
    detail: '获取配置详情失败',
    create: '创建配置失败',
    update: '更新配置失败',
    delete: '删除配置失败',
  },
})

export const configKeys = configResource.keys
export const useConfigs = configResource.useList
export const useConfig = configResource.useDetail
export const useCreateConfig = configResource.useCreate
export const useUpdateConfig = configResource.useUpdate
export const useDeleteConfig = configResource.useDelete

/**
 * 更新配置值（简化版）
 */
export function useUpdateConfigValue() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (args: { id: number; input: UpdateConfigValueInput }) => {
      const response = await getClient()[':id'].$put({
        param: { id: String(args.id) },
        json: args.input,
      })
      return unwrapApiData<Config>(response, '更新配置值失败')
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: configKeys.lists() })
      queryClient.invalidateQueries({ queryKey: configKeys.detail(id) })
    },
  })
}
