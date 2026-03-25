'use client'

import { ActionIcon, Badge, Group, Text, Tooltip } from '@mantine/core'
import {
  IconCopy,
  IconDownload,
  IconEye,
  IconFile,
  IconFileText,
  IconFolder,
  IconMovie,
  IconPhoto,
  IconTrash,
} from '@tabler/icons-react'
import type { DataTableColumn } from 'mantine-datatable'

import { PermissionGuard } from '@/components/permission-guard'
import type { StorageItem } from './file-list'

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`
}

function getMimeIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return <IconPhoto size={16} />
  if (mimeType.startsWith('video/')) return <IconMovie size={16} />
  if (mimeType.startsWith('text/')) return <IconFileText size={16} />
  return <IconFile size={16} />
}

interface ColumnCallbacks {
  onNavigate: (prefix: string) => void
  onDeleteFolder: (prefix: string, name: string) => void
  onPreview: (record: StorageItem) => void
  onCopyUrl: (record: StorageItem) => void
  onDownload: (record: StorageItem) => void
  onDeleteFile: (record: StorageItem) => void
}

export function createColumns(cb: ColumnCallbacks): DataTableColumn<StorageItem>[] {
  return [
    {
      accessor: 'name',
      title: '名称',
      render: (record) => {
        if (record.type === 'folder') {
          return (
            <Group
              gap="xs"
              wrap="nowrap"
              style={{ cursor: 'pointer' }}
              onClick={() => cb.onNavigate(record.prefix)}
            >
              <IconFolder size={18} color="var(--mantine-color-blue-5)" />
              <Text size="sm" fw={500} truncate="end" maw={300}>
                {record.name}
              </Text>
            </Group>
          )
        }
        return (
          <Group
            gap="xs"
            wrap="nowrap"
            style={{ cursor: 'pointer' }}
            onClick={() => cb.onPreview(record)}
          >
            <div style={{ color: 'var(--mantine-color-gray-6)', display: 'flex' }}>
              {getMimeIcon(record.mimeType)}
            </div>
            <Text size="sm" truncate="end" maw={300}>
              {record.fileName}
            </Text>
          </Group>
        )
      },
    },
    {
      accessor: 'size',
      title: '大小',
      width: 100,
      render: (record) => {
        if (record.type === 'folder')
          return (
            <Text size="sm" c="dimmed">
              -
            </Text>
          )
        return <Text size="sm">{formatFileSize(record.fileSize)}</Text>
      },
    },
    {
      accessor: 'type',
      title: '类型',
      width: 140,
      render: (record) => {
        if (record.type === 'folder')
          return (
            <Text size="sm" c="dimmed">
              文件夹
            </Text>
          )
        return (
          <Text size="sm" truncate="end" c="dimmed">
            {record.mimeType}
          </Text>
        )
      },
    },
    {
      accessor: 'isPublic',
      title: '访问权限',
      width: 90,
      render: (record) => {
        if (record.type === 'folder') return null
        return (
          <Badge size="sm" variant="light" color={record.isPublic === 1 ? 'green' : 'gray'}>
            {record.isPublic === 1 ? '公开' : '私有'}
          </Badge>
        )
      },
    },
    {
      accessor: 'createdAt',
      title: '上传时间',
      width: 170,
      render: (record) => {
        if (record.type === 'folder')
          return (
            <Text size="sm" c="dimmed">
              -
            </Text>
          )
        return <Text size="sm">{record.createdAt}</Text>
      },
    },
    {
      accessor: 'actions',
      title: '操作',
      width: 140,
      render: (record) => {
        if (record.type === 'folder') {
          return (
            <PermissionGuard permission="storage:file:delete">
              <Tooltip label="删除目录">
                <ActionIcon
                  variant="subtle"
                  color="red"
                  size="sm"
                  onClick={() => cb.onDeleteFolder(record.prefix, record.name)}
                >
                  <IconTrash size={14} />
                </ActionIcon>
              </Tooltip>
            </PermissionGuard>
          )
        }

        return (
          <Group gap={4} wrap="nowrap">
            <Tooltip label="预览">
              <ActionIcon variant="subtle" size="sm" onClick={() => cb.onPreview(record)}>
                <IconEye size={14} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="复制链接">
              <ActionIcon variant="subtle" size="sm" onClick={() => cb.onCopyUrl(record)}>
                <IconCopy size={14} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="下载">
              <ActionIcon variant="subtle" size="sm" onClick={() => cb.onDownload(record)}>
                <IconDownload size={14} />
              </ActionIcon>
            </Tooltip>
            <PermissionGuard permission="storage:file:delete">
              <Tooltip label="删除">
                <ActionIcon
                  variant="subtle"
                  color="red"
                  size="sm"
                  onClick={() => cb.onDeleteFile(record)}
                >
                  <IconTrash size={14} />
                </ActionIcon>
              </Tooltip>
            </PermissionGuard>
          </Group>
        )
      },
    },
  ]
}
