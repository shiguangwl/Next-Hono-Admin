import { ActionIcon, Group, Tooltip } from '@mantine/core'
import { IconKey, IconPencil, IconTrash } from '@tabler/icons-react'
import type { DataTableColumn } from 'mantine-datatable'

import { PermissionGuard } from '@/components/permission-guard'
import { EnableStatusChip } from '@/components/ui/status-chip'
import { SUPER_ADMIN_ID } from '@/lib/constants'
import type { Admin } from '@/server/routes/admins/dtos'

export type { Admin }

interface ColumnActions {
  onEdit: (admin: Admin) => void
  onDelete: (admin: Admin) => void
  onResetPassword: (admin: Admin) => void
}

export function buildAdminColumns({
  onEdit,
  onDelete,
  onResetPassword,
}: ColumnActions): DataTableColumn<Admin>[] {
  return [
    { accessor: 'id', title: 'ID', width: 80, sortable: true },
    { accessor: 'username', title: '用户名', sortable: true },
    {
      accessor: 'nickname',
      title: '昵称',
      render: (record) => record.nickname || '-',
    },
    {
      accessor: 'roles',
      title: '角色',
      render: (record) => record.roles?.map((r) => r.roleName).join(', ') || '-',
    },
    {
      accessor: 'status',
      title: '状态',
      sortable: true,
      render: (record) => <EnableStatusChip status={record.status} />,
    },
    {
      accessor: 'loginTime',
      title: '最后登录',
      sortable: true,
      render: (record) => record.loginTime || '-',
    },
    {
      accessor: 'actions',
      title: '操作',
      width: 150,
      render: (record) => (
        <Group gap={4}>
          {record.id !== SUPER_ADMIN_ID && (
            <>
              <PermissionGuard permission="system:admin:update">
                <Tooltip label="编辑">
                  <ActionIcon variant="subtle" size="sm" onClick={() => onEdit(record)}>
                    <IconPencil size={14} />
                  </ActionIcon>
                </Tooltip>
              </PermissionGuard>
              <PermissionGuard permission="system:admin:delete">
                <Tooltip label="删除">
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    size="sm"
                    onClick={() => onDelete(record)}
                  >
                    <IconTrash size={14} />
                  </ActionIcon>
                </Tooltip>
              </PermissionGuard>
            </>
          )}
          <PermissionGuard permission="system:admin:resetPwd">
            <Tooltip label="重置密码">
              <ActionIcon variant="subtle" size="sm" onClick={() => onResetPassword(record)}>
                <IconKey size={14} />
              </ActionIcon>
            </Tooltip>
          </PermissionGuard>
        </Group>
      ),
    },
  ]
}
