'use client'

import { Badge, Group, Text } from '@mantine/core'
import {
  IconFile,
  IconFileText,
  IconMovie,
  IconPhoto,
} from '@tabler/icons-react'
import type { DataTableColumn } from 'mantine-datatable'

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`
}

function getMimeIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return <IconPhoto size={16} />
  if (mimeType.startsWith('video/')) return <IconMovie size={16} />
  if (mimeType.startsWith('text/')) return <IconFileText size={16} />
  return <IconFile size={16} />
}

export interface FileRecord {
  id: number
  fileKey: string
  fileName: string
  fileSize: number
  mimeType: string
  isPublic: number
  uploaderId: number | null
  uploaderName: string | null
  createdAt: string
  updatedAt: string
}

interface ColumnActions {
  onPreview: (file: FileRecord) => void
  onCopyUrl: (file: FileRecord) => void
  onDelete: (file: FileRecord) => void
}

export function buildFileColumns(
  actions: ColumnActions
): DataTableColumn<FileRecord>[] {
  return [
    {
      accessor: 'fileName',
      title: '文件名',
      render: (record) => (
        <Group gap="xs" wrap="nowrap">
          {getMimeIcon(record.mimeType)}
          <Text
            size="sm"
            truncate="end"
            maw={220}
            style={{ cursor: 'pointer' }}
            onClick={() => actions.onPreview(record)}
          >
            {record.fileName}
          </Text>
        </Group>
      ),
    },
    {
      accessor: 'fileSize',
      title: '大小',
      width: 100,
      render: (record) => (
        <Text size="sm">{formatFileSize(record.fileSize)}</Text>
      ),
    },
    {
      accessor: 'mimeType',
      title: '类型',
      width: 140,
      render: (record) => (
        <Text size="sm" truncate="end">
          {record.mimeType}
        </Text>
      ),
    },
    {
      accessor: 'isPublic',
      title: '访问',
      width: 80,
      render: (record) => (
        <Badge
          size="sm"
          variant="light"
          color={record.isPublic === 1 ? 'green' : 'gray'}
        >
          {record.isPublic === 1 ? '公开' : '私有'}
        </Badge>
      ),
    },
    {
      accessor: 'uploaderName',
      title: '上传者',
      width: 100,
      render: (record) => (
        <Text size="sm">{record.uploaderName ?? '-'}</Text>
      ),
    },
    {
      accessor: 'createdAt',
      title: '上传时间',
      width: 170,
    },
  ]
}
