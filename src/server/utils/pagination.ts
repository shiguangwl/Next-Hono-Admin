import { asc, type Column, desc, getTableColumns, type SQL, type Table } from 'drizzle-orm'

/** 分页结果 */
export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

interface PaginationInput {
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

const DEFAULT_PAGE = 1
const DEFAULT_PAGE_SIZE = 20
const MAX_PAGE_SIZE = 100

/** 标准化分页参数，统一处理默认值和边界 */
export function normalizePagination(params: PaginationInput) {
  const page = Math.max(1, params.page ?? DEFAULT_PAGE)
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, params.pageSize ?? DEFAULT_PAGE_SIZE))
  return {
    page,
    pageSize,
    offset: (page - 1) * pageSize,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
  }
}

/** 组装标准分页结果 */
export function buildPaginatedResult<T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number
): PaginatedResult<T> {
  return {
    items,
    total,
    page,
    pageSize,
    totalPages: total === 0 ? 0 : Math.ceil(total / pageSize),
  }
}

/** 构建排序条件：用户排序优先 + 默认排序兜底 */
export function buildSortOrder(
  table: Table,
  sortBy: string | undefined,
  sortOrder: 'asc' | 'desc' | undefined,
  sortableFields: readonly string[],
  defaultOrder: SQL[]
): SQL[] {
  if (!sortBy || !sortableFields.includes(sortBy)) {
    return defaultOrder
  }
  const columns = getTableColumns(table) as Record<string, Column>
  const column = columns[sortBy]
  if (!column) {
    return defaultOrder
  }
  const userSort = sortOrder === 'desc' ? desc(column) : asc(column)
  return [userSort, ...defaultOrder]
}
