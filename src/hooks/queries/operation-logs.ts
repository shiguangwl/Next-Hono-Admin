/**
 * 操作日志 React Query Hooks
 */

import type { ClientResponse } from 'hono/client'
import { getApiClient } from '@/lib/client'
import type { LogQuery, OperationLog } from '@/server/routes/operation-logs/dtos'
import type { PaginatedResponse } from './core'
import { createReadonlyResource } from './core'

/**
 * 操作日志 API Client 类型
 */
type OperationLogsClient = {
  $get: (args: { query: Record<string, string> }) => Promise<ClientResponse<unknown>>
  ':id': {
    $delete: (args: { param: { id: string } }) => Promise<ClientResponse<unknown>>
  }
}

const getClient = () =>
  (getApiClient() as unknown as { 'operation-logs': OperationLogsClient })['operation-logs']

type OperationLogPage = PaginatedResponse<OperationLog>

/**
 * 只读资源 Hooks（list + delete）
 */
const operationLogResource = createReadonlyResource<OperationLogPage, LogQuery>({
  resourceName: 'operation-logs',
  getClient: getClient as any,
  messages: {
    list: '获取操作日志列表失败',
    delete: '删除操作日志失败',
  },
})

export const operationLogKeys = operationLogResource.keys
export const useOperationLogs = operationLogResource.useList
export const useDeleteOperationLog = operationLogResource.useDelete
