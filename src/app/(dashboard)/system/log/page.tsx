'use client'

import { ActionIcon, Button, Card, Group, Select, SimpleGrid, TextInput } from '@mantine/core'
import { RefreshCw, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { type ColumnDef, DataTable } from '@/components/ui/data-table'
import { ConfirmDialog } from '@/components/ui/form-dialog'
import { PageContainer, PageHeader } from '@/components/ui/page-header'
import { Pagination } from '@/components/ui/pagination'
import { StatusChip } from '@/components/ui/status-chip'
import { useDeleteOperationLog, useOperationLogs } from '@/hooks/queries'
import { LogDetailDialog, type OperationLog } from './log-detail-dialog'

export default function LogPage() {
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [filters, setFilters] = useState({
    adminName: '',
    module: '',
    operation: '',
    status: '' as '' | '0' | '1',
    startTime: '',
    endTime: '',
  })
  const [appliedFilters, setAppliedFilters] = useState(filters)
  const [detailLog, setDetailLog] = useState<OperationLog | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<OperationLog | null>(null)

  const { data, isLoading, refetch } = useOperationLogs({
    page,
    pageSize,
    adminName: appliedFilters.adminName || undefined,
    module: appliedFilters.module || undefined,
    operation: appliedFilters.operation || undefined,
    status: appliedFilters.status ? Number(appliedFilters.status) : undefined,
    startTime: appliedFilters.startTime || undefined,
    endTime: appliedFilters.endTime || undefined,
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
      startTime: '',
      endTime: '',
    }
    setFilters(resetFilters)
    setAppliedFilters(resetFilters)
    setPage(1)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteLog.mutateAsync(deleteTarget.id)
      setDeleteTarget(null)
      toast.success('删除成功')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '删除失败')
    }
  }

  const columns: ColumnDef<OperationLog>[] = [
    { key: 'id', title: 'ID', width: 80 },
    { key: 'adminName', title: '管理员', render: (v) => (v as string) || '-' },
    { key: 'module', title: '模块', render: (v) => (v as string) || '-' },
    { key: 'operation', title: '操作', render: (v) => (v as string) || '-' },
    { key: 'requestMethod', title: '请求方法', width: 100 },
    { key: 'ip', title: 'IP', render: (v) => (v as string) || '-' },
    {
      key: 'executionTime',
      title: '耗时',
      width: 80,
      render: (v) => (v !== null ? `${v}ms` : '-'),
    },
    {
      key: 'status',
      title: '状态',
      width: 150,
      render: (v) => (
        <StatusChip status={(v as number) === 1 ? 'success' : 'danger'}>
          {(v as number) === 1 ? '成功' : '失败'}
        </StatusChip>
      ),
    },
    {
      key: 'createdAt',
      title: '时间',
      render: (v) => (v as string) || '-',
    },
    {
      key: 'actions',
      title: '操作',
      width: 120,
      render: (_, record) => (
        <Group gap={4}>
          <Button variant="subtle" size="compact-sm" onClick={() => setDetailLog(record)}>
            详情
          </Button>
          <ActionIcon
            variant="subtle"
            color="red"
            size="sm"
            onClick={() => setDeleteTarget(record)}
          >
            <Trash2 size={14} />
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
          <Button variant="subtle" leftSection={<RefreshCw size={14} />} onClick={() => refetch()}>
            刷新
          </Button>
        }
      />

      <Card padding="md">
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
          <TextInput
            label="开始时间"
            type="datetime-local"
            value={filters.startTime}
            onChange={(e) => setFilters({ ...filters, startTime: e.currentTarget.value })}
          />
          <TextInput
            label="结束时间"
            type="datetime-local"
            value={filters.endTime}
            onChange={(e) => setFilters({ ...filters, endTime: e.currentTarget.value })}
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
      </Card>

      <DataTable
        columns={columns}
        data={data?.items || []}
        rowKey="id"
        loading={isLoading}
        emptyText="暂无日志数据"
      />

      {data && (
        <Pagination page={page} pageSize={pageSize} total={data.total} onPageChange={setPage} />
      )}

      {detailLog && <LogDetailDialog log={detailLog} onClose={() => setDetailLog(null)} />}

      <ConfirmDialog
        title="删除日志"
        content="确定要删除这条日志吗？此操作不可恢复。"
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isConfirming={deleteLog.isPending}
        confirmText="删除"
        isDanger
      />
    </PageContainer>
  )
}
