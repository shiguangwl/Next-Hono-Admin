import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getApiClient, unwrapApiData } from '@/lib/client'
import type {
  CreateRoleInput,
  PaginatedRole,
  Role,
  RoleQuery,
  UpdateRoleInput,
  UpdateRoleMenusInput,
} from '@/server/routes/roles/dtos'
import { createResource } from '../create-resource'

const getClient = () => getApiClient().roles

const roleResource = createResource<
  PaginatedRole,
  Role,
  CreateRoleInput,
  UpdateRoleInput,
  RoleQuery
>({
  resourceName: 'roles',
  getClient: getClient as never,
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

export function useAllRoles() {
  return useQuery<Role[], Error>({
    queryKey: [...roleKeys.all, 'all'],
    queryFn: async () => {
      const response = await getClient().all.$get()
      return unwrapApiData<Role[]>(response, '获取角色列表失败')
    },
  })
}

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
