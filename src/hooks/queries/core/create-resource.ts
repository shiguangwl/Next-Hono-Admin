/**
 * CRUD Hooks 工厂
 * @description 创建标准 CRUD 操作的 React Query Hooks
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getApiClient, unwrapApiData } from '@/lib/client'
import { createQueryKeys } from './query-keys'
import type { BasePaginationQuery, ResourceConfig } from './types'

/**
 * 标准 CRUD Client 接口约束
 */
interface StandardCrudClient {
  $get: (args: { query: Record<string, string> }) => Promise<unknown>
  $post: (args: { json: unknown }) => Promise<unknown>
  ':id': {
    $get: (args: { param: { id: string } }) => Promise<unknown>
    $put: (args: { param: { id: string }; json: unknown }) => Promise<unknown>
    $delete: (args: { param: { id: string } }) => Promise<unknown>
  }
}

/**
 * 构建查询参数字符串
 */
function buildQueryParams<T extends BasePaginationQuery>(
  params: T,
  defaultPageSize: number
): Record<string, string> {
  const query: Record<string, string> = {
    page: String(params.page || 1),
    pageSize: String(params.pageSize || defaultPageSize),
  }

  for (const [key, value] of Object.entries(params)) {
    if (key !== 'page' && key !== 'pageSize' && value !== undefined && value !== null) {
      query[key] = String(value)
    }
  }

  return query
}

/**
 * 创建标准 CRUD Hooks
 */
export function createResource<
  TList,
  TDetail,
  TCreateInput,
  TUpdateInput,
  TQuery extends BasePaginationQuery = BasePaginationQuery,
>(
  config: ResourceConfig<TQuery> & {
    getClient: () => StandardCrudClient
  }
) {
  const { resourceName, getClient, defaultPageSize = 20, messages = {} } = config

  const {
    list: listMsg = `获取${resourceName}列表失败`,
    detail: detailMsg = `获取${resourceName}详情失败`,
    create: createMsg = `创建${resourceName}失败`,
    update: updateMsg = `更新${resourceName}失败`,
    delete: deleteMsg = `删除${resourceName}失败`,
  } = messages

  const keys = createQueryKeys(resourceName)

  /**
   * 列表查询 Hook
   */
  function useList(params: TQuery = {} as TQuery) {
    return useQuery<TList, Error>({
      queryKey: keys.list(params as Record<string, unknown>),
      queryFn: async () => {
        const client = getClient()
        const query = buildQueryParams(params, defaultPageSize)
        const response = await client.$get({ query })
        return unwrapApiData<TList>(response as any, listMsg)
      },
    })
  }

  /**
   * 详情查询 Hook
   */
  function useDetail(id: number) {
    return useQuery<TDetail, Error>({
      queryKey: keys.detail(id),
      queryFn: async () => {
        const client = getClient()
        const response = await client[':id'].$get({ param: { id: String(id) } })
        return unwrapApiData<TDetail>(response as any, detailMsg)
      },
      enabled: id > 0,
    })
  }

  /**
   * 创建 Mutation Hook
   */
  function useCreate() {
    const queryClient = useQueryClient()

    return useMutation({
      mutationFn: async (input: TCreateInput) => {
        const client = getClient()
        const response = await client.$post({ json: input })
        return unwrapApiData<TDetail>(response as any, createMsg)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: keys.all })
      },
    })
  }

  /**
   * 更新 Mutation Hook
   */
  function useUpdate() {
    const queryClient = useQueryClient()

    return useMutation({
      mutationFn: async ({ id, input }: { id: number; input: TUpdateInput }) => {
        const client = getClient()
        const response = await client[':id'].$put({
          param: { id: String(id) },
          json: input,
        })
        return unwrapApiData<TDetail>(response as any, updateMsg)
      },
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries({ queryKey: keys.all })
        queryClient.invalidateQueries({ queryKey: keys.detail(id) })
      },
    })
  }

  /**
   * 删除 Mutation Hook
   */
  function useDelete() {
    const queryClient = useQueryClient()

    return useMutation({
      mutationFn: async (id: number) => {
        const client = getClient()
        const response = await client[':id'].$delete({ param: { id: String(id) } })
        return unwrapApiData<null>(response as any, deleteMsg)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: keys.all })
      },
    })
  }

  return {
    keys,
    useList,
    useDetail,
    useCreate,
    useUpdate,
    useDelete,
  }
}

/**
 * 创建只读资源 Hooks（仅 list + delete）
 */
export function createReadonlyResource<
  TList,
  TQuery extends BasePaginationQuery = BasePaginationQuery,
>(
  config: ResourceConfig<TQuery> & {
    getClient: () => Pick<StandardCrudClient, '$get'> & {
      ':id': Pick<StandardCrudClient[':id'], '$delete'>
    }
  }
) {
  const { resourceName, getClient, defaultPageSize = 20, messages = {} } = config

  const {
    list: listMsg = `获取${resourceName}列表失败`,
    delete: deleteMsg = `删除${resourceName}失败`,
  } = messages

  const keys = createQueryKeys(resourceName)

  function useList(params: TQuery = {} as TQuery) {
    return useQuery<TList, Error>({
      queryKey: keys.list(params as Record<string, unknown>),
      queryFn: async () => {
        const client = getClient()
        const query = buildQueryParams(params, defaultPageSize)
        const response = await client.$get({ query })
        return unwrapApiData<TList>(response as any, listMsg)
      },
    })
  }

  function useDelete() {
    const queryClient = useQueryClient()

    return useMutation({
      mutationFn: async (id: number) => {
        const client = getClient()
        const response = await client[':id'].$delete({ param: { id: String(id) } })
        return unwrapApiData<null>(response as any, deleteMsg)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: keys.all })
      },
    })
  }

  return {
    keys,
    useList,
    useDelete,
  }
}
