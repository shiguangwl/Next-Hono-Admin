import { useMutation, useQueryClient } from '@tanstack/react-query'
import { getApiClient, unwrapApiData } from '@/lib/client'
import type {
  Config,
  ConfigQuery,
  CreateConfigInput,
  PaginatedConfig,
  UpdateConfigInput,
  UpdateConfigValueInput,
} from '@/server/routes/configs/dtos'
import { createResource } from './core'

const getClient = () => getApiClient().configs

const configResource = createResource<
  PaginatedConfig,
  Config,
  CreateConfigInput,
  UpdateConfigInput,
  ConfigQuery
>({
  resourceName: 'configs',
  getClient: getClient as never,
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
