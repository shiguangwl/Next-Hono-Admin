"use client";

import {
  Group,
  Pagination as MantinePagination,
  Select,
  Text,
} from "@mantine/core";
import { useMemo } from "react";

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  showSizeChanger?: boolean;
  showTotal?: boolean;
}

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  showSizeChanger = true,
  showTotal = true,
}: PaginationProps) {
  const totalPages = useMemo(
    () => Math.ceil(total / pageSize),
    [total, pageSize],
  );

  if (total === 0) return null;

  return (
    <Group justify="space-between">
      <Group gap="md">
        {showTotal && (
          <Text size="sm" c="dimmed">
            共 {total} 条
          </Text>
        )}
        {showSizeChanger && onPageSizeChange && (
          <Select
            size="xs"
            w={90}
            value={String(pageSize)}
            onChange={(val) => val && onPageSizeChange(Number(val))}
            data={pageSizeOptions.map((s) => ({
              value: String(s),
              label: `${s} 条/页`,
            }))}
          />
        )}
      </Group>
      <MantinePagination
        total={totalPages}
        value={page}
        onChange={onPageChange}
        size="sm"
      />
    </Group>
  );
}
