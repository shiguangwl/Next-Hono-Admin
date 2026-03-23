import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getApiClient, unwrapApiData } from '@/lib/client'
import type {
  BatchSortInput,
  CreateMenuInput,
  Menu,
  MenuQuery,
  MenuTreeNodeDto,
  UpdateMenuInput,
} from '@/server/routes/menus/dtos'
import { createQueryKeys } from '../create-resource'

const getClient = () => getApiClient().menus

export const menuKeys = {
  ...createQueryKeys('menus'),
  tree: () => ['menus', 'tree'] as const,
}

export function useMenus(params?: MenuQuery) {
  return useQuery<Menu[], Error>({
    queryKey: menuKeys.list(params),
    queryFn: async () => {
      const response = await getClient().$get({
        query: {
          ...(params?.menuType && { menuType: params.menuType }),
          ...(params?.status !== undefined && {
            status: String(params.status),
          }),
        },
      })
      return unwrapApiData<Menu[]>(response, '获取菜单列表失败')
    },
  })
}

export function useMenuTree() {
  return useQuery<MenuTreeNodeDto[], Error>({
    queryKey: menuKeys.tree(),
    queryFn: async () => {
      const response = await getClient().tree.$get({ query: {} })
      return unwrapApiData<MenuTreeNodeDto[]>(response, '获取菜单树失败')
    },
  })
}

export function useMenu(id: number) {
  return useQuery<Menu, Error>({
    queryKey: menuKeys.detail(id),
    queryFn: async () => {
      const response = await getClient()[':id'].$get({
        param: { id: String(id) },
      })
      return unwrapApiData<Menu>(response, '获取菜单详情失败')
    },
    enabled: id > 0,
  })
}

export function useCreateMenu() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateMenuInput) => {
      const response = await getClient().$post({ json: input })
      return unwrapApiData<Menu>(response, '创建菜单失败')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: menuKeys.all })
    },
  })
}

export function useUpdateMenu() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, input }: { id: number; input: UpdateMenuInput }) => {
      const response = await getClient()[':id'].$put({
        param: { id: String(id) },
        json: input,
      })
      return unwrapApiData<Menu>(response, '更新菜单失败')
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: menuKeys.all })
      queryClient.invalidateQueries({ queryKey: menuKeys.detail(id) })
    },
  })
}

export function useDeleteMenu() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await getClient()[':id'].$delete({
        param: { id: String(id) },
      })
      return unwrapApiData<null>(response, '删除菜单失败')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: menuKeys.all })
    },
  })
}

export function useBatchSortMenu() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (items: BatchSortInput) => {
      const response = await getClient().sort.$put({ json: items })
      return unwrapApiData<null>(response, '更新排序失败')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: menuKeys.all })
    },
  })
}
