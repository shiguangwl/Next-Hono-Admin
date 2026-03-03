'use client'

import { Center, Paper, ScrollArea, Skeleton, Stack, Table, Text, ThemeIcon } from '@mantine/core'
import { DatabaseZap } from 'lucide-react'
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
  minWidth?: number
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

/** 加载态骨架行 */
function LoadingRows({ columns, rows = 5 }: { columns: ColumnDef<unknown>[]; rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }, (_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: 骨架行是固定占位符，不会重排
        <Table.Tr key={`skeleton-${i}`}>
          {columns.map((col) => (
            <Table.Td key={col.key}>
              <Skeleton height={16} radius="sm" />
            </Table.Td>
          ))}
        </Table.Tr>
      ))}
    </>
  )
}

/** 空数据状态 */
function EmptyState({ text, colSpan }: { text: string; colSpan: number }) {
  return (
    <Table.Tr>
      <Table.Td colSpan={colSpan}>
        <Center py="xl">
          <Stack align="center" gap="sm">
            <ThemeIcon size={48} radius="xl" variant="light" color="gray">
              <DatabaseZap size={24} />
            </ThemeIcon>
            <Text size="sm" c="dimmed" fw={500}>
              {text}
            </Text>
          </Stack>
        </Center>
      </Table.Td>
    </Table.Tr>
  )
}

export function DataTable<T>({
  columns,
  data,
  rowKey,
  loading = false,
  emptyText = '暂无数据',
  minWidth,
}: DataTableProps<T>) {
  return (
    <Paper withBorder radius="lg" style={{ overflow: 'hidden' }}>
      <ScrollArea>
        <Table
          striped
          highlightOnHover
          stickyHeader
          withTableBorder={false}
          withColumnBorders={false}
          miw={minWidth}
          styles={{
            thead: {
              backgroundColor: 'var(--mantine-color-default)',
              borderBottom: '2px solid var(--mantine-color-default-border)',
            },
            th: {
              fontWeight: 700,
              fontSize: 'var(--mantine-font-size-xs)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: 'var(--mantine-color-dimmed)',
              padding: 'var(--mantine-spacing-sm) var(--mantine-spacing-md)',
              whiteSpace: 'nowrap',
            },
            td: {
              padding: 'var(--mantine-spacing-sm) var(--mantine-spacing-md)',
              fontSize: 'var(--mantine-font-size-sm)',
            },
          }}
        >
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
              <LoadingRows columns={columns as ColumnDef<unknown>[]} />
            ) : data.length === 0 ? (
              <EmptyState text={emptyText} colSpan={columns.length} />
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
    </Paper>
  )
}
