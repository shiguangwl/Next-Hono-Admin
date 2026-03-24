'use client'

import { Button, Group, Paper, Select, SimpleGrid, TextInput } from '@mantine/core'
import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import { IconPlus, IconRefresh } from '@tabler/icons-react'
import { DataTable, type DataTableSortStatus } from 'mantine-datatable'
import { useState } from 'react'

import { PermissionGuard } from '@/components/permission-guard'
import { PageContainer, PageHeader } from '@/components/ui/page-header'
import { useConfigs, useCreateConfig, useDeleteConfig, useUpdateConfigValue } from '@/hooks/queries'
import { buildColumns, type Config } from './config-columns'
import { ConfigCreateDialog, type CreateFormData, defaultCreateForm } from './config-create-dialog'
import { ConfigEditDialog } from './config-edit-dialog'

const PAGE_SIZE = 20

export default function ConfigPage() {
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({
    group: '',
    status: '' as '' | '0' | '1',
  })
  const [appliedFilters, setAppliedFilters] = useState(filters)

  const [editingConfig, setEditingConfig] = useState<Config | null>(null)
  const [editingValue, setEditingValue] = useState('')

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [createForm, setCreateForm] = useState<CreateFormData>(defaultCreateForm)
  const [createErrors, setCreateErrors] = useState<Partial<Record<keyof CreateFormData, string>>>(
    {}
  )

  const [sortStatus, setSortStatus] = useState<DataTableSortStatus<Config>>({
    columnAccessor: 'configGroup',
    direction: 'asc',
  })

  const { data, isLoading, refetch } = useConfigs({
    page,
    pageSize: PAGE_SIZE,
    group: appliedFilters.group || undefined,
    status: appliedFilters.status ? Number(appliedFilters.status) : undefined,
    sortBy: sortStatus.columnAccessor,
    sortOrder: sortStatus.direction,
  })

  const createConfig = useCreateConfig()
  const updateValue = useUpdateConfigValue()
  const deleteConfig = useDeleteConfig()

  const handleSearch = () => {
    setAppliedFilters(filters)
    setPage(1)
  }

  const handleReset = () => {
    const reset = { group: '', status: '' as const }
    setFilters(reset)
    setAppliedFilters(reset)
    setPage(1)
  }

  const openEditDialog = (config: Config) => {
    setEditingConfig(config)
    setEditingValue(config.configValue ?? '')
  }

  const openCreateDialog = () => {
    setCreateForm(defaultCreateForm)
    setCreateErrors({})
    setCreateDialogOpen(true)
  }

  const handleSaveValue = async () => {
    if (!editingConfig) return
    try {
      await updateValue.mutateAsync({
        id: editingConfig.id,
        input: {
          configValue: editingValue,
          configType: editingConfig.configType,
          status: editingConfig.status,
        },
      })
      setEditingConfig(null)
      notifications.show({ message: '配置已保存', color: 'green' })
    } catch (err) {
      notifications.show({
        message: err instanceof Error ? err.message : '保存失败',
        color: 'red',
      })
    }
  }

  const validateCreateForm = (): boolean => {
    const errors: Partial<Record<keyof CreateFormData, string>> = {}
    if (!createForm.configKey.trim()) errors.configKey = '请输入配置键'
    if (!createForm.configName.trim()) errors.configName = '请输入配置名称'
    setCreateErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleCreateSave = async () => {
    if (!validateCreateForm()) return
    try {
      await createConfig.mutateAsync({
        configKey: createForm.configKey.trim(),
        configGroup: createForm.configGroup.trim() || 'general',
        configName: createForm.configName.trim(),
        configType: createForm.configType,
        configValue: createForm.configValue === '' ? null : createForm.configValue,
        remark: createForm.remark.trim() || null,
        status: createForm.status,
      })
      setCreateDialogOpen(false)
      notifications.show({ message: '配置已创建', color: 'green' })
    } catch (err) {
      notifications.show({
        message: err instanceof Error ? err.message : '创建失败',
        color: 'red',
      })
    }
  }

  const openDeleteConfirm = (config: Config) => {
    if (config.isSystem === 1) {
      notifications.show({ message: '系统配置不允许删除', color: 'red' })
      return
    }
    modals.openConfirmModal({
      title: '删除配置',
      children: `确定要删除配置 "${config.configKey}" 吗？此操作不可恢复。`,
      labels: { confirm: '删除', cancel: '取消' },
      confirmProps: { color: 'red' },
      centered: true,
      onConfirm: async () => {
        try {
          await deleteConfig.mutateAsync(config.id)
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

  const columns = buildColumns({
    onEdit: openEditDialog,
    onDelete: openDeleteConfirm,
  })

  return (
    <PageContainer>
      <PageHeader
        title="系统配置"
        breadcrumbs={[{ label: '系统管理' }, { label: '系统配置' }]}
        actions={
          <Group gap="sm">
            <PermissionGuard permission="system:config:create">
              <Button leftSection={<IconPlus size={14} />} onClick={openCreateDialog}>
                新增配置
              </Button>
            </PermissionGuard>
            <Button
              variant="subtle"
              leftSection={<IconRefresh size={14} />}
              onClick={() => refetch()}
            >
              刷新
            </Button>
          </Group>
        }
      />

      <Paper withBorder p="md" radius="md" mb="md">
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
          <TextInput
            label="分组"
            placeholder="如 security / upload / marketing"
            value={filters.group}
            onChange={(e) => setFilters({ ...filters, group: e.currentTarget.value })}
          />
          <Select
            label="状态"
            placeholder="全部"
            data={[
              { value: '', label: '全部' },
              { value: '1', label: '启用' },
              { value: '0', label: '停用' },
            ]}
            value={filters.status}
            onChange={(v) => setFilters({ ...filters, status: (v ?? '') as '' | '0' | '1' })}
          />
          <Group align="flex-end" gap="sm">
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
        noRecordsText="暂无配置"
        totalRecords={data?.total ?? 0}
        recordsPerPage={PAGE_SIZE}
        page={page}
        onPageChange={setPage}
        sortStatus={sortStatus}
        onSortStatusChange={setSortStatus}
        paginationText={({ from, to, totalRecords }) => `${from}-${to} / 共 ${totalRecords} 条`}
      />

      <ConfigCreateDialog
        isOpen={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={handleCreateSave}
        isSubmitting={createConfig.isPending}
        formData={createForm}
        onChange={setCreateForm}
        errors={createErrors}
      />

      <ConfigEditDialog
        config={editingConfig}
        editingValue={editingValue}
        onValueChange={setEditingValue}
        onClose={() => setEditingConfig(null)}
        onSubmit={handleSaveValue}
        isSubmitting={updateValue.isPending}
      />
    </PageContainer>
  )
}
