/**
 * 管理员 React Query Hooks
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ClientResponse } from 'hono/client'
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
import { createResource } from './core'

/**
 * 管理员 API Client 类型
 * 由于 @hono/zod-openapi 与 hono/client 类型推导不兼容，需手动定义
 */
type AdminsClient = {
  $get: (args: { query: Record<string, string> }) => Promise<ClientResponse<unknown>>
  $post: (args: { json: CreateAdminInput }) => Promise<ClientResponse<unknown>>
  ':id': {
    $get: (args: { param: { id: string } }) => Promise<ClientResponse<unknown>>
    $put: (args: {
      param: { id: string }
      json: UpdateAdminInput
    }) => Promise<ClientResponse<unknown>>
    $delete: (args: { param: { id: string } }) => Promise<ClientResponse<unknown>>
    roles: {
      $put: (args: {
        param: { id: string }
        json: UpdateAdminRolesInput
      }) => Promise<ClientResponse<unknown>>
    }
    'reset-password': {
      $put: (args: {
        param: { id: string }
        json: ResetPasswordInput
      }) => Promise<ClientResponse<unknown>>
    }
  }
}

const getClient = () => (getApiClient() as unknown as { admins: AdminsClient }).admins

/**
 * 标准 CRUD Hooks
 */
const adminResource = createResource<
  PaginatedAdmin,
  Admin,
  CreateAdminInput,
  UpdateAdminInput,
  AdminQuery
>({
  resourceName: 'admins',
  getClient: getClient as any,
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

/**
 * 重置密码
 */
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

/**
 * 更新管理员角色
 */
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
