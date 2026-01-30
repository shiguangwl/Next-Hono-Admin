/**
 * 通用分页类型定义
 */

/** 分页查询参数 */
export interface PaginationQuery {
  page?: number
  pageSize?: number
  keyword?: string
  status?: number
}

/** 分页结果 */
export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
