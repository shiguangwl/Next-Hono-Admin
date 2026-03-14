import { ActionIcon, Code, Group } from '@mantine/core'
import { IconPencil, IconTrash } from '@tabler/icons-react'
import type { DataTableColumn } from 'mantine-datatable'

import { PermissionGuard } from '@/components/permission-guard'
import { EnableStatusChip } from '@/components/ui/status-chip'
import type { ConfigType } from './config-value-preview'

export type Config = {
  id: number
  configKey: string
  configValue: string | null
  configType: ConfigType
  configGroup: string
  configName: string
  remark: string | null
  isSystem: number
  status: number
  createdAt: string
  updatedAt: string
}

interface ColumnActions {
  onEdit: (record: Config) => void
  onDelete: (record: Config) => void
}

export function buildColumns({ onEdit, onDelete }: ColumnActions): DataTableColumn<Config>[] {
  return [
    { accessor: 'id', title: 'ID', width: 60, sortable: true },
    { accessor: 'configGroup', title: '分组', sortable: true },
    {
      accessor: 'configKey',
      title: 'Key',
      sortable: true,
      render: (record) => <Code fz="xs">{record.configKey}</Code>,
    },
    { accessor: 'configName', title: '名称' },
    { accessor: 'configType', title: '类型', width: 80 },
    {
      accessor: 'status',
      title: '状态',
      width: 100,
      sortable: true,
      render: (record) => <EnableStatusChip status={record.status} />,
    },
    {
      accessor: 'isSystem',
      title: '系统',
      width: 60,
      render: (record) => (record.isSystem === 1 ? '是' : '否'),
    },
    {
      accessor: 'actions',
      title: '操作',
      width: 120,
      render: (record) => (
        <Group gap={4}>
          <PermissionGuard permission="system:config:update">
            <ActionIcon
              variant="subtle"
              size="sm"
              onClick={() => onEdit(record)}
              aria-label="编辑值"
            >
              <IconPencil size={14} />
            </ActionIcon>
          </PermissionGuard>
          <PermissionGuard permission="system:config:delete">
            <ActionIcon
              variant="subtle"
              color="red"
              size="sm"
              disabled={record.isSystem === 1}
              onClick={() => onDelete(record)}
              aria-label="删除"
            >
              <IconTrash size={14} />
            </ActionIcon>
          </PermissionGuard>
        </Group>
      ),
    },
  ]
}
