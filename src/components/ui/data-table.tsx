"use client";

/**
 * 数据表格组件
 * @description 通用数据表格，支持分页、排序、选择等功能
 */

import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "@gravity-ui/icons";
import { Button, Spinner } from "@heroui/react";
import type { ReactNode } from "react";

/**
 * 列定义
 */
export interface ColumnDef<T> {
  /** 列标识 */
  key: string;
  /** 列标题 */
  title: ReactNode;
  /** 列宽度 */
  width?: string | number;
  /** 对齐方式 */
  align?: "left" | "center" | "right";
  /** 渲染函数 */
  render?: (value: unknown, record: T, index: number) => ReactNode;
  /** 是否可排序 */
  sortable?: boolean;
}

/**
 * 表格属性
 */
interface DataTableProps<T> {
  /** 列定义 */
  columns: ColumnDef<T>[];
  /** 数据源 */
  data: T[];
  /** 行键 */
  rowKey: keyof T | ((record: T) => string | number);
  /** 是否加载中 */
  loading?: boolean;
  /** 空状态文本 */
  emptyText?: string;
  /** 自定义类名 */
  className?: string;
}

/**
 * 分页属性
 */
interface PaginationProps {
  /** 当前页 */
  current: number;
  /** 每页条数 */
  pageSize: number;
  /** 总条数 */
  total: number;
  /** 页码变化回调 */
  onChange: (page: number) => void;
  /** 是否显示总数 */
  showTotal?: boolean;
}

/**
 * 获取行键
 */
function getRowKey<T>(
  record: T,
  rowKey: keyof T | ((record: T) => string | number)
): string | number {
  if (typeof rowKey === "function") {
    return rowKey(record);
  }
  return record[rowKey] as string | number;
}

/**
 * 获取单元格值
 */
function getCellValue<T>(record: T, key: string): unknown {
  const keys = key.split(".");
  let value: unknown = record;
  for (const k of keys) {
    if (value == null) return undefined;
    value = (value as Record<string, unknown>)[k];
  }
  return value;
}

/**
 * 数据表格组件
 */
export function DataTable<T>({
  columns,
  data,
  rowKey,
  loading = false,
  emptyText = "暂无数据",
  className,
}: DataTableProps<T>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-separator",
        className
      )}
    >
      <div className="overflow-x-auto">
        <table
          className="w-full border-collapse"
          style={{ tableLayout: "fixed" }}
        >
          {/* 列宽定义 */}
          <colgroup>
            {columns.map((column) => (
              <col key={column.key} style={{ width: column.width }} />
            ))}
          </colgroup>

          {/* 表头 */}
          <thead>
            <tr className="border-b border-separator bg-default/50">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    "px-4 py-3 text-sm font-medium text-foreground text-left",
                    column.align === "center" && "text-center",
                    column.align === "right" && "text-right"
                  )}
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>

          {/* 表体 */}
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <Spinner size="md" />
                    <span className="text-sm text-muted">正在加载数据...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-2xl text-muted">📭</span>
                    <span className="text-sm text-muted">{emptyText}</span>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((record, index) => (
                <tr
                  key={getRowKey(record, rowKey)}
                  className="group border-b border-separator transition-colors last:border-b-0 hover:bg-default/50"
                >
                  {columns.map((column) => {
                    const value = getCellValue(record, column.key);
                    return (
                      <td
                        key={column.key}
                        className={cn(
                          "px-4 py-3 text-left text-sm",
                          column.align === "center" && "text-center",
                          column.align === "right" && "text-right"
                        )}
                      >
                        {column.render
                          ? column.render(value, record, index)
                          : String(value ?? "-")}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * 分页组件
 */
export function Pagination({
  current,
  pageSize,
  total,
  onChange,
  showTotal = true,
}: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize);
  const hasPrev = current > 1;
  const hasNext = current < totalPages;

  if (total === 0) return null;

  return (
    <div className="flex items-center justify-between gap-4">
      {showTotal && (
        <span className="text-sm text-muted">共 {total} 条记录</span>
      )}
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          isDisabled={!hasPrev}
          onPress={() => onChange(current - 1)}
        >
          <ChevronLeft className="size-4" />
          上一页
        </Button>
        <span className="px-2 text-sm">
          {current} / {totalPages}
        </span>
        <Button
          variant="secondary"
          size="sm"
          isDisabled={!hasNext}
          onPress={() => onChange(current + 1)}
        >
          下一页
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
