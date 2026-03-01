'use client'

import { Center, Loader, ScrollArea, Stack, Table, Text } from '@mantine/core'
import type { ReactNode } from 'react'

export interface ColumnDef<T> {
  key: string
  title: ReactNode
  width?: string | number
  align?: 'left' | 'center' | 'right'
  render?: (value: unknown, record: T, index: number) => ReactNode
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[]
  data: T[]
  rowKey: keyof T | ((record: T) => string | number)
  loading?: boolean
  emptyText?: string
}

function getRowKey<T>(
  record: T,
  rowKey: keyof T | ((record: T) => string | number)
): string | number {
  return typeof rowKey === 'function' ? rowKey(record) : (record[rowKey] as string | number)
}

function getCellValue<T>(record: T, key: string): unknown {
  const keys = key.split('.')
  let value: unknown = record
  for (const k of keys) {
    if (value == null) return undefined
    value = (value as Record<string, unknown>)[k]
  }
  return value
}

export function DataTable<T>({
  columns,
  data,
  rowKey,
  loading = false,
  emptyText = '暂无数据',
}: DataTableProps<T>) {
  return (
    <ScrollArea>
      <Table striped highlightOnHover withTableBorder withColumnBorders={false}>
        <Table.Thead>
          <Table.Tr>
            {columns.map((col) => (
              <Table.Th key={col.key} w={col.width} ta={col.align}>
                {col.title}
              </Table.Th>
            ))}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {loading ? (
            <Table.Tr>
              <Table.Td colSpan={columns.length}>
                <Center py="xl">
                  <Stack align="center" gap="xs">
                    <Loader size="sm" />
                    <Text size="sm" c="dimmed">
                      正在加载数据...
                    </Text>
                  </Stack>
                </Center>
              </Table.Td>
            </Table.Tr>
          ) : data.length === 0 ? (
            <Table.Tr>
              <Table.Td colSpan={columns.length}>
                <Center py="xl">
                  <Text size="sm" c="dimmed">
                    {emptyText}
                  </Text>
                </Center>
              </Table.Td>
            </Table.Tr>
          ) : (
            data.map((record, index) => (
              <Table.Tr key={getRowKey(record, rowKey)}>
                {columns.map((col) => {
                  const value = getCellValue(record, col.key)
                  return (
                    <Table.Td key={col.key} ta={col.align}>
                      {col.render ? col.render(value, record, index) : String(value ?? '-')}
                    </Table.Td>
                  )
                })}
              </Table.Tr>
            ))
          )}
        </Table.Tbody>
      </Table>
    </ScrollArea>
  )
}
