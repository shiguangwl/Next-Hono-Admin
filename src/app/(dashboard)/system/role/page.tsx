'use client'

import { ActionIcon, Button, Group, Paper, TextInput, Tooltip } from '@mantine/core'
import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import { IconPencil, IconPlus, IconRefresh, IconShieldCheck, IconTrash } from '@tabler/icons-react'
import { DataTable, type DataTableColumn, type DataTableSortStatus } from 'mantine-datatable'
import { useState } from 'react'

import { PermissionGuard } from '@/components/permission-guard'
import { PageContainer, PageHeader } from '@/components/ui/page-header'
import { EnableStatusChip } from '@/components/ui/status-chip'
import { useDeleteRole, useRoles } from '@/hooks/queries'
import { RoleFormDialog } from './role-form-dialog'
import { RoleMenuDialog } from './role-menu-dialog'

type Role = {
  id: number
  roleName: string
  sort: number
  status: number
  remark: string | null
  createdAt: string
  updatedAt: string
}

const PAGE_SIZE = 20

export default function RolePage() {
  const [page, setPage] = useState(1)
  const [keyword, setKeyword] = useState('')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [menuDialogRole, setMenuDialogRole] = useState<Role | null>(null)
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus<Role>>({
    columnAccessor: 'sort',
    direction: 'asc',
  })

  const { data, isLoading, refetch } = useRoles({
    page,
    pageSize: PAGE_SIZE,
    keyword: searchKeyword,
    sortBy: sortStatus.columnAccessor,
    sortOrder: sortStatus.direction,
  })
  const deleteRole = useDeleteRole()

  const handleSearch = () => {
    setSearchKeyword(keyword)
    setPage(1)
  }

  const handleCreate = () => {
    setEditingRole(null)
    setDialogOpen(true)
  }

  const handleEdit = (role: Role) => {
    setEditingRole(role)
    setDialogOpen(true)
  }

  const openDeleteConfirm = (role: Role) => {
    modals.openConfirmModal({
      title: '删除角色',
      children: `确定要删除角色 "${role.roleName}" 吗？此操作不可恢复。`,
      labels: { confirm: '删除', cancel: '取消' },
      confirmProps: { color: 'red' },
      centered: true,
      onConfirm: async () => {
        try {
          await deleteRole.mutateAsync(role.id)
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

  const columns: DataTableColumn<Role>[] = [
    { accessor: 'id', title: 'ID', width: 80, sortable: true },
    { accessor: 'roleName', title: '角色名称', sortable: true },
    { accessor: 'sort', title: '排序', width: 80, sortable: true },
    {
      accessor: 'status',
      title: '状态',
      sortable: true,
      render: (record) => <EnableStatusChip status={record.status} />,
    },
    {
      accessor: 'remark',
      title: '备注',
      render: (record) => record.remark || '-',
    },
    {
      accessor: 'createdAt',
      title: '创建时间',
      sortable: true,
      render: (record) => record.createdAt || '-',
    },
    {
      accessor: 'actions',
      title: '操作',
      width: 150,
      render: (record) => (
        <Group gap={4}>
          <PermissionGuard permission="system:role:update">
            <Tooltip label="编辑">
              <ActionIcon variant="subtle" size="sm" onClick={() => handleEdit(record)}>
                <IconPencil size={14} />
              </ActionIcon>
            </Tooltip>
          </PermissionGuard>
          <PermissionGuard permission="system:role:assignMenu">
            <Tooltip label="分配权限">
              <ActionIcon
                variant="subtle"
                color="blue"
                size="sm"
                onClick={() => setMenuDialogRole(record)}
              >
                <IconShieldCheck size={14} />
              </ActionIcon>
            </Tooltip>
          </PermissionGuard>
          <PermissionGuard permission="system:role:delete">
            <Tooltip label="删除">
              <ActionIcon
                variant="subtle"
                color="red"
                size="sm"
                onClick={() => openDeleteConfirm(record)}
              >
                <IconTrash size={14} />
              </ActionIcon>
            </Tooltip>
          </PermissionGuard>
        </Group>
      ),
    },
  ]

  return (
    <PageContainer>
      <PageHeader
        title="角色管理"
        breadcrumbs={[{ label: '系统管理' }, { label: '角色管理' }]}
        actions={
          <PermissionGuard permission="system:role:create">
            <Button leftSection={<IconPlus size={16} />} onClick={handleCreate}>
              新增角色
            </Button>
          </PermissionGuard>
        }
      />

      <Paper withBorder p="md" radius="md" mb="md">
        <Group>
          <TextInput
            flex={1}
            maw={300}
            label="关键词"
            placeholder="搜索角色名称"
            value={keyword}
            onChange={(e) => setKeyword(e.currentTarget.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button variant="default" onClick={handleSearch} mt="auto">
            搜索
          </Button>
          <Button
            variant="subtle"
            leftSection={<IconRefresh size={14} />}
            onClick={() => refetch()}
            mt="auto"
          >
            刷新
          </Button>
        </Group>
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
        noRecordsText="暂无角色数据"
        totalRecords={data?.total ?? 0}
        recordsPerPage={PAGE_SIZE}
        page={page}
        onPageChange={setPage}
        sortStatus={sortStatus}
        onSortStatusChange={setSortStatus}
        paginationText={({ from, to, totalRecords }) => `${from}-${to} / 共 ${totalRecords} 条`}
      />

      <RoleFormDialog
        open={dialogOpen}
        role={editingRole}
        onClose={() => setDialogOpen(false)}
        onSuccess={() => {
          setDialogOpen(false)
          refetch()
        }}
      />

      <RoleMenuDialog
        open={!!menuDialogRole}
        role={menuDialogRole}
        onClose={() => setMenuDialogRole(null)}
        onSuccess={() => setMenuDialogRole(null)}
      />
    </PageContainer>
  )
}
