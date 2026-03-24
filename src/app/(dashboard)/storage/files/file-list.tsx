'use client'

import {
  ActionIcon,
  Breadcrumbs,
  Button,
  Group,
  Paper,
  Text,
  TextInput,
  Tooltip,
} from '@mantine/core'
import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import {
  IconCopy,
  IconDownload,
  IconEye,
  IconFolderPlus,
  IconTrash,
  IconUpload,
} from '@tabler/icons-react'
import { DataTable } from 'mantine-datatable'
import { useState } from 'react'

import { PermissionGuard } from '@/components/permission-guard'
import { useDeleteFile, useGetFileUrl, useStorageFiles } from '@/hooks/queries'
import { copyToClipboard } from '@/lib/clipboard'
import { buildFileColumns, type FileRecord } from './file-columns'
import { FilePreviewDialog } from './file-preview-dialog'

function showManualCopyModal(url: string) {
  modals.open({
    title: '请手动复制链接',
    centered: true,
    children: (
      <TextInput
        value={url}
        readOnly
        onFocus={(e) => e.currentTarget.select()}
        description="自动复制失败，请手动选择并复制以下链接"
      />
    ),
  })
}

const PAGE_SIZE = 20

interface FileListProps {
  currentPrefix: string
  onUploadClick: () => void
  onCreateFolderClick: () => void
}

export function FileList({ currentPrefix, onUploadClick, onCreateFolderClick }: FileListProps) {
  const [page, setPage] = useState(1)
  const [previewFile, setPreviewFile] = useState<FileRecord | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const { data, isLoading } = useStorageFiles({
    prefix: currentPrefix || undefined,
    page,
    pageSize: PAGE_SIZE,
  })

  const deleteFile = useDeleteFile()
  const getFileUrl = useGetFileUrl()

  const handlePreview = async (file: FileRecord) => {
    try {
      const result = await getFileUrl.mutateAsync(file.id)
      setPreviewFile(file)
      setPreviewUrl(result.url)
    } catch (err) {
      notifications.show({
        message: err instanceof Error ? err.message : '获取链接失败',
        color: 'red',
      })
    }
  }

  const handleCopyUrl = async (file: FileRecord) => {
    try {
      const result = await getFileUrl.mutateAsync(file.id)
      const copied = await copyToClipboard(result.url)
      if (copied) {
        notifications.show({ message: '链接已复制', color: 'green' })
      } else {
        showManualCopyModal(result.url)
      }
    } catch (err) {
      notifications.show({
        message: err instanceof Error ? err.message : '获取链接失败',
        color: 'red',
      })
    }
  }

  const handleDelete = (file: FileRecord) => {
    modals.openConfirmModal({
      title: '删除文件',
      children: `确定要删除文件 "${file.fileName}" 吗？此操作不可恢复。`,
      labels: { confirm: '删除', cancel: '取消' },
      confirmProps: { color: 'red' },
      centered: true,
      onConfirm: async () => {
        try {
          await deleteFile.mutateAsync(file.id)
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

  const breadcrumbParts = currentPrefix.split('/').filter(Boolean)

  const columns = [
    ...buildFileColumns({
      onPreview: handlePreview,
      onCopyUrl: handleCopyUrl,
      onDelete: handleDelete,
    }),
    {
      accessor: 'actions',
      title: '操作',
      width: 140,
      render: (record: FileRecord) => (
        <Group gap={4} wrap="nowrap">
          <Tooltip label="预览">
            <ActionIcon variant="subtle" size="sm" onClick={() => handlePreview(record)}>
              <IconEye size={14} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="复制链接">
            <ActionIcon variant="subtle" size="sm" onClick={() => handleCopyUrl(record)}>
              <IconCopy size={14} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="下载">
            <ActionIcon
              variant="subtle"
              size="sm"
              onClick={async () => {
                const result = await getFileUrl.mutateAsync(record.id)
                window.open(result.url, '_blank')
              }}
            >
              <IconDownload size={14} />
            </ActionIcon>
          </Tooltip>
          <PermissionGuard permission="storage:file:delete">
            <Tooltip label="删除">
              <ActionIcon
                variant="subtle"
                color="red"
                size="sm"
                onClick={() => handleDelete(record)}
              >
                <IconTrash size={14} />
              </ActionIcon>
            </Tooltip>
          </PermissionGuard>
        </Group>
      ),
    },
  ]

  const items = ((data as Record<string, unknown>)?.items ?? []) as FileRecord[]
  const total = ((data as Record<string, unknown>)?.total ?? 0) as number

  return (
    <>
      <Paper withBorder p="md" radius="md">
        <Group justify="space-between" mb="md">
          <Breadcrumbs>
            <Text size="sm" style={{ cursor: 'pointer' }} fw={currentPrefix === '' ? 700 : 400}>
              根目录
            </Text>
            {breadcrumbParts.map((part) => (
              <Text size="sm" key={part}>
                {part}
              </Text>
            ))}
          </Breadcrumbs>

          <Group gap="sm">
            <PermissionGuard permission="storage:file:upload">
              <Button
                size="xs"
                variant="light"
                leftSection={<IconFolderPlus size={14} />}
                onClick={onCreateFolderClick}
              >
                新建目录
              </Button>
              <Button size="xs" leftSection={<IconUpload size={14} />} onClick={onUploadClick}>
                上传文件
              </Button>
            </PermissionGuard>
          </Group>
        </Group>

        <DataTable
          withTableBorder
          borderRadius="md"
          striped
          highlightOnHover
          minHeight={200}
          columns={columns}
          records={items}
          fetching={isLoading}
          noRecordsText="暂无文件"
          totalRecords={total}
          recordsPerPage={PAGE_SIZE}
          page={page}
          onPageChange={setPage}
          paginationText={({ from, to, totalRecords }) => `${from}-${to} / 共 ${totalRecords} 条`}
        />
      </Paper>

      <FilePreviewDialog
        file={previewFile}
        fileUrl={previewUrl}
        onClose={() => {
          setPreviewFile(null)
          setPreviewUrl(null)
        }}
      />
    </>
  )
}
