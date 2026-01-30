/**
 * 角色 React Query Hooks
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ClientResponse } from 'hono/client'
import { getApiClient, unwrapApiData } from '@/lib/client'
import type {
  CreateRoleInput,
  PaginatedRole,
  Role,
  RoleQuery,
  UpdateRoleInput,
  UpdateRoleMenusInput,
} from '@/server/routes/roles/dtos'
import { createResource } from './core'

/**
 * 角色 API Client 类型
 */
type RolesClient = {
  $get: (args: { query: Record<string, string> }) => Promise<ClientResponse<unknown>>
  $post: (args: { json: CreateRoleInput }) => Promise<ClientResponse<unknown>>
  all: {
    $get: () => Promise<ClientResponse<unknown>>
  }
  ':id': {
    $get: (args: { param: { id: string } }) => Promise<ClientResponse<unknown>>
    $put: (args: {
      param: { id: string }
      json: UpdateRoleInput
    }) => Promise<ClientResponse<unknown>>
    $delete: (args: { param: { id: string } }) => Promise<ClientResponse<unknown>>
    menus: {
      $put: (args: {
        param: { id: string }
        json: UpdateRoleMenusInput
      }) => Promise<ClientResponse<unknown>>
    }
  }
}

const getClient = () => (getApiClient() as unknown as { roles: RolesClient }).roles

/**
 * 标准 CRUD Hooks
 */
const roleResource = createResource<
  PaginatedRole,
  Role,
  CreateRoleInput,
  UpdateRoleInput,
  RoleQuery
>({
  resourceName: 'roles',
  getClient: getClient as any,
  messages: {
    list: '获取角色列表失败',
    detail: '获取角色详情失败',
    create: '创建角色失败',
    update: '更新角色失败',
    delete: '删除角色失败',
  },
})

export const roleKeys = roleResource.keys
export const useRoles = roleResource.useList
export const useRole = roleResource.useDetail
export const useCreateRole = roleResource.useCreate
export const useUpdateRole = roleResource.useUpdate
export const useDeleteRole = roleResource.useDelete

/**
 * 获取所有角色（不分页，用于下拉选择）
 */
export function useAllRoles() {
  return useQuery<Role[], Error>({
    queryKey: [...roleKeys.all, 'all'],
    queryFn: async () => {
      const response = await getClient().all.$get()
      return unwrapApiData<Role[]>(response, '获取角色列表失败')
    },
  })
}

/**
 * 更新角色菜单权限
 */
export function useUpdateRoleMenus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, input }: { id: number; input: UpdateRoleMenusInput }) => {
      const response = await getClient()[':id'].menus.$put({
        param: { id: String(id) },
        json: input,
      })
      return unwrapApiData<null>(response, '更新角色菜单权限失败')
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: roleKeys.detail(id) })
    },
  })
}
