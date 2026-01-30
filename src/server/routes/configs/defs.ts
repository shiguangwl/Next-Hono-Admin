/**
 * 系统配置路由定义
 */

import {
  createCrudRoutes,
  createDataResponseSchema,
  createRoute,
  IdParamSchema,
  mutationResponses,
} from '../shared'
import {
  ConfigQuerySchema,
  ConfigSchema,
  CreateConfigInputSchema,
  PaginatedConfigSchema,
  UpdateConfigInputSchema,
  UpdateConfigValueInputSchema,
} from './dtos'

// ========== 系统配置 CRUD 路由（使用工厂） ==========

export const configRoutes = createCrudRoutes({
  resourceName: '系统配置',
  tag: '系统配置',
  schemas: {
    entity: ConfigSchema,
    create: CreateConfigInputSchema,
    update: UpdateConfigInputSchema,
    query: ConfigQuerySchema,
    paginated: PaginatedConfigSchema,
  },
  conflictMessage: '配置键已存在',
})

// 解构导出
export const {
  listRoute: listConfigsRoute,
  detailRoute: getConfigRoute,
  createRoute: createConfigRoute,
  updateRoute: updateConfigRoute,
  deleteRoute: deleteConfigRoute,
} = configRoutes

// ========== 扩展路由：仅更新配置值 ==========

export const updateConfigValueRoute = createRoute({
  method: 'patch',
  path: '/key/{id}',
  tags: ['系统配置'],
  summary: '更新配置值',
  description: '仅更新配置值与类型，方便在超级面板中编辑',
  security: [{ bearerAuth: [] }],
  request: {
    params: IdParamSchema,
    body: {
      content: {
        'application/json': {
          schema: UpdateConfigValueInputSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      description: '更新成功',
      content: {
        'application/json': {
          schema: createDataResponseSchema(ConfigSchema, 'UpdateConfigValueResponse'),
        },
      },
    },
    ...mutationResponses('配置'),
  },
})
