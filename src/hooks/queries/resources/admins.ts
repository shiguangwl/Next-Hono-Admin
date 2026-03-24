import { useMutation, useQueryClient } from '@tanstack/react-query'
import { getApiClient, unwrapApiData } from '@/lib/client'
import type {
  Admin,
  AdminQuery,
  CreateAdminInput,
  PaginatedAdmin,
  ResetPasswordInput,
  UpdateAdminInput,
  UpdateAdminRolesInput,
} from '@/server/routes/admins/dtos'
import { createResource } from '../create-resource'

const getClient = () => getApiClient().admins

const adminResource = createResource<
  PaginatedAdmin,
  Admin,
  CreateAdminInput,
  UpdateAdminInput,
  AdminQuery
>({
  resourceName: 'admins',
  getClient: getClient,
  messages: {
    list: '获取管理员列表失败',
    detail: '获取管理员详情失败',
    create: '创建管理员失败',
    update: '更新管理员失败',
    delete: '删除管理员失败',
  },
})

export const adminKeys = adminResource.keys
export const useAdmins = adminResource.useList
export const useAdmin = adminResource.useDetail
export const useCreateAdmin = adminResource.useCreate
export const useUpdateAdmin = adminResource.useUpdate
export const useDeleteAdmin = adminResource.useDelete

export function useResetPassword() {
  return useMutation({
    mutationFn: async ({ id, input }: { id: number; input: ResetPasswordInput }) => {
      const response = await getClient()[':id']['reset-password'].$put({
        param: { id: String(id) },
        json: input,
      })
      return unwrapApiData<null>(response, '重置密码失败')
    },
  })
}

export function useUpdateAdminRoles() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, input }: { id: number; input: UpdateAdminRolesInput }) => {
      const response = await getClient()[':id'].roles.$put({
        param: { id: String(id) },
        json: input,
      })
      return unwrapApiData<null>(response, '更新管理员角色失败')
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.lists() })
      queryClient.invalidateQueries({ queryKey: adminKeys.detail(id) })
    },
  })
}
