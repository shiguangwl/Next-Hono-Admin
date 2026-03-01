import { ActionIcon, Code, Group } from '@mantine/core'
import { Pencil, Trash2 } from 'lucide-react'

import { PermissionGuard } from '@/components/permission-guard'
import type { ColumnDef } from '@/components/ui/data-table'
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

export function buildColumns({ onEdit, onDelete }: ColumnActions): ColumnDef<Config>[] {
  return [
    { key: 'id', title: 'ID', width: 60 },
    { key: 'configGroup', title: '分组' },
    {
      key: 'configKey',
      title: 'Key',
      render: (v) => <Code fz="xs">{v as string}</Code>,
    },
    { key: 'configName', title: '名称' },
    { key: 'configType', title: '类型', width: 80 },
    {
      key: 'status',
      title: '状态',
      width: 100,
      render: (v) => <EnableStatusChip status={v as number} />,
    },
    {
      key: 'isSystem',
      title: '系统',
      width: 60,
      render: (v) => ((v as number) === 1 ? '是' : '否'),
    },
    {
      key: 'actions',
      title: '操作',
      width: 120,
      render: (_, record) => (
        <Group gap={4}>
          <PermissionGuard permission="system:config:update">
            <ActionIcon
              variant="subtle"
              size="sm"
              onClick={() => onEdit(record)}
              aria-label="编辑值"
            >
              <Pencil size={14} />
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
              <Trash2 size={14} />
            </ActionIcon>
          </PermissionGuard>
        </Group>
      ),
    },
  ]
}
