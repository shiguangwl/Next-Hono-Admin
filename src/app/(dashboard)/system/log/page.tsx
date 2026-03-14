'use client'

import { ActionIcon, Button, Group, Paper, Select, SimpleGrid, TextInput } from '@mantine/core'
import { DateTimePicker } from '@mantine/dates'
import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import { IconRefresh, IconTrash } from '@tabler/icons-react'
import { DataTable, type DataTableColumn, type DataTableSortStatus } from 'mantine-datatable'
import { useState } from 'react'

import { PageContainer, PageHeader } from '@/components/ui/page-header'
import { StatusChip } from '@/components/ui/status-chip'
import { useDeleteOperationLog, useOperationLogs } from '@/hooks/queries'
import { LogDetailDialog, type OperationLog } from './log-detail-dialog'

const PAGE_SIZE = 20

export default function LogPage() {
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({
    adminName: '',
    module: '',
    operation: '',
    status: '' as '' | '0' | '1',
    startTime: null as Date | null,
    endTime: null as Date | null,
  })
  const [appliedFilters, setAppliedFilters] = useState(filters)
  const [detailLog, setDetailLog] = useState<OperationLog | null>(null)
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus<OperationLog>>({
    columnAccessor: 'createdAt',
    direction: 'desc',
  })

  const { data, isLoading, refetch } = useOperationLogs({
    page,
    pageSize: PAGE_SIZE,
    adminName: appliedFilters.adminName || undefined,
    module: appliedFilters.module || undefined,
    operation: appliedFilters.operation || undefined,
    status: appliedFilters.status ? Number(appliedFilters.status) : undefined,
    startTime: appliedFilters.startTime?.toISOString() || undefined,
    endTime: appliedFilters.endTime?.toISOString() || undefined,
    sortBy: sortStatus.columnAccessor,
    sortOrder: sortStatus.direction,
  })
  const deleteLog = useDeleteOperationLog()

  const handleSearch = () => {
    setAppliedFilters(filters)
    setPage(1)
  }

  const handleReset = () => {
    const resetFilters = {
      adminName: '',
      module: '',
      operation: '',
      status: '' as const,
      startTime: null as Date | null,
      endTime: null as Date | null,
    }
    setFilters(resetFilters)
    setAppliedFilters(resetFilters)
    setPage(1)
  }

  const openDeleteConfirm = (log: OperationLog) => {
    modals.openConfirmModal({
      title: '删除日志',
      children: '确定要删除这条日志吗？此操作不可恢复。',
      labels: { confirm: '删除', cancel: '取消' },
      confirmProps: { color: 'red' },
      centered: true,
      onConfirm: async () => {
        try {
          await deleteLog.mutateAsync(log.id)
          notifications.show({ message: '删除成功', color: 'green' })
        } catch (err) {
          notifications.show({
            message: err instanceof Error ? err.message : '删除失败',
            color: 'red',
          })
        }
      },
    })
  }

  const columns: DataTableColumn<OperationLog>[] = [
    { accessor: 'id', title: 'ID', width: 80, sortable: true },
    {
      accessor: 'adminName',
      title: '管理员',
      sortable: true,
      render: (r) => r.adminName || '-',
    },
    { accessor: 'module', title: '模块', render: (r) => r.module || '-' },
    { accessor: 'operation', title: '操作', render: (r) => r.operation || '-' },
    { accessor: 'requestMethod', title: '请求方法', width: 100 },
    { accessor: 'ip', title: 'IP', render: (r) => r.ip || '-' },
    {
      accessor: 'executionTime',
      title: '耗时',
      width: 80,
      sortable: true,
      render: (r) => (r.executionTime !== null ? `${r.executionTime}ms` : '-'),
    },
    {
      accessor: 'status',
      title: '状态',
      width: 150,
      sortable: true,
      render: (r) => (
        <StatusChip status={r.status === 1 ? 'success' : 'danger'}>
          {r.status === 1 ? '成功' : '失败'}
        </StatusChip>
      ),
    },
    {
      accessor: 'createdAt',
      title: '时间',
      sortable: true,
      render: (r) => r.createdAt || '-',
    },
    {
      accessor: 'actions',
      title: '操作',
      width: 120,
      render: (record) => (
        <Group gap={4}>
          <Button variant="subtle" size="compact-sm" onClick={() => setDetailLog(record)}>
            详情
          </Button>
          <ActionIcon
            variant="subtle"
            color="red"
            size="sm"
            onClick={() => openDeleteConfirm(record)}
          >
            <IconTrash size={14} />
          </ActionIcon>
        </Group>
      ),
    },
  ]

  return (
    <PageContainer>
      <PageHeader
        title="操作日志"
        breadcrumbs={[{ label: '系统管理' }, { label: '操作日志' }]}
        actions={
          <Button
            variant="subtle"
            leftSection={<IconRefresh size={14} />}
            onClick={() => refetch()}
          >
            刷新
          </Button>
        }
      />

      <Paper withBorder p="md" radius="md" mb="md">
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
          <TextInput
            label="管理员"
            placeholder="请输入管理员名称"
            value={filters.adminName}
            onChange={(e) => setFilters({ ...filters, adminName: e.currentTarget.value })}
          />
          <TextInput
            label="模块"
            placeholder="请输入模块名称"
            value={filters.module}
            onChange={(e) => setFilters({ ...filters, module: e.currentTarget.value })}
          />
          <TextInput
            label="操作类型"
            placeholder="请输入操作类型"
            value={filters.operation}
            onChange={(e) => setFilters({ ...filters, operation: e.currentTarget.value })}
          />
          <Select
            label="状态"
            placeholder="全部"
            data={[
              { value: '', label: '全部' },
              { value: '1', label: '成功' },
              { value: '0', label: '失败' },
            ]}
            value={filters.status}
            onChange={(v) => setFilters({ ...filters, status: (v ?? '') as '' | '0' | '1' })}
          />
          <DateTimePicker
            label="开始时间"
            placeholder="选择开始时间"
            clearable
            value={filters.startTime}
            onChange={(v) =>
              setFilters({
                ...filters,
                startTime: (v ?? null) as Date | null,
              })
            }
          />
          <DateTimePicker
            label="结束时间"
            placeholder="选择结束时间"
            clearable
            value={filters.endTime}
            onChange={(v) => setFilters({ ...filters, endTime: (v ?? null) as Date | null })}
          />
          <Group align="flex-end" gap="sm" style={{ gridColumn: 'span 2' }}>
            <Button variant="filled" onClick={handleSearch}>
              搜索
            </Button>
            <Button variant="default" onClick={handleReset}>
              重置
            </Button>
          </Group>
        </SimpleGrid>
      </Paper>

      <DataTable
        withTableBorder
        borderRadius="md"
        striped
        highlightOnHover
        minHeight={200}
        columns={columns}
        records={data?.items ?? []}
        fetching={isLoading}
        noRecordsText="暂无日志数据"
        totalRecords={data?.total ?? 0}
        recordsPerPage={PAGE_SIZE}
        page={page}
        onPageChange={setPage}
        sortStatus={sortStatus}
        onSortStatusChange={setSortStatus}
        paginationText={({ from, to, totalRecords }) => `${from}-${to} / 共 ${totalRecords} 条`}
      />

      {detailLog && <LogDetailDialog log={detailLog} onClose={() => setDetailLog(null)} />}
    </PageContainer>
  )
}
