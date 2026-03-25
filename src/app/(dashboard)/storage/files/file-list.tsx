'use client'

import { TextInput } from '@mantine/core'
import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import { DataTable } from 'mantine-datatable'
import { useState } from 'react'

import { useDeleteFile, useGetFileUrl, useStorageFiles } from '@/hooks/queries'
import { copyToClipboard } from '@/lib/clipboard'
import { createColumns } from './file-list-columns'
import { FilePreviewDialog } from './file-preview-dialog'

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

export interface FolderInfo {
  name: string
  prefix: string
  fileCount: number
}

export type StorageItem =
  | ({ type: 'folder'; id: string } & FolderInfo)
  | ({ type: 'file' } & FileRecord)

interface FileListProps {
  currentPrefix: string
  folders: FolderInfo[]
  foldersLoading: boolean
  onNavigate: (prefix: string) => void
  onDeleteFolder: (prefix: string, name: string) => void
}

const PAGE_SIZE = 20

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

export function FileList({
  currentPrefix,
  folders,
  foldersLoading,
  onNavigate,
  onDeleteFolder,
}: FileListProps) {
  const [page, setPage] = useState(1)
  const [previewFile, setPreviewFile] = useState<FileRecord | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const { data, isLoading: filesLoading } = useStorageFiles({
    prefix: currentPrefix || undefined,
    page,
    pageSize: PAGE_SIZE,
  })

  const deleteFile = useDeleteFile()
  const getFileUrl = useGetFileUrl()

  const handlePreview = async (item: StorageItem) => {
    if (item.type === 'folder') return
    try {
      const result = await getFileUrl.mutateAsync(item.id)
      setPreviewFile(item)
      setPreviewUrl(result.url)
    } catch (err) {
      notifications.show({
        message: err instanceof Error ? err.message : '获取链接失败',
        color: 'red',
      })
    }
  }

  const handleCopyUrl = async (item: StorageItem) => {
    if (item.type === 'folder') return
    try {
      const result = await getFileUrl.mutateAsync(item.id)
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

  const handleDownload = async (item: StorageItem) => {
    if (item.type === 'folder') return
    try {
      const result = await getFileUrl.mutateAsync(item.id)
      window.open(result.url, '_blank')
    } catch (err) {
      notifications.show({
        message: err instanceof Error ? err.message : '获取下载链接失败',
        color: 'red',
      })
    }
  }

  const handleDeleteFile = (item: StorageItem) => {
    if (item.type === 'folder') return
    modals.openConfirmModal({
      title: '删除文件',
      children: `确定要删除文件 "${item.fileName}" 吗？此操作不可恢复。`,
      labels: { confirm: '删除', cancel: '取消' },
      confirmProps: { color: 'red' },
      centered: true,
      onConfirm: async () => {
        try {
          await deleteFile.mutateAsync(item.id)
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

  const columns = createColumns({
    onNavigate,
    onDeleteFolder,
    onPreview: handlePreview,
    onCopyUrl: handleCopyUrl,
    onDownload: handleDownload,
    onDeleteFile: handleDeleteFile,
  })

  const items = ((data as Record<string, unknown>)?.items ?? []) as FileRecord[]
  const total = ((data as Record<string, unknown>)?.total ?? 0) as number

  // WHY: 文件夹仅在第 1 页置顶显示，totalRecords 需包含文件夹数以保持分页一致
  const folderCount = page === 1 ? folders.length : 0
  const records: StorageItem[] = [
    ...(page === 1
      ? folders.map((f) => ({ type: 'folder' as const, id: `dir-${f.prefix}`, ...f }))
      : []),
    ...items.map((f) => ({ type: 'file' as const, ...f })),
  ]

  return (
    <>
      <DataTable
        withTableBorder
        borderRadius="md"
        striped
        highlightOnHover
        minHeight={150}
        columns={columns}
        records={records}
        fetching={filesLoading || foldersLoading}
        noRecordsText="暂无文件或目录"
        totalRecords={total + folderCount}
        recordsPerPage={PAGE_SIZE + folderCount}
        page={page}
        onPageChange={setPage}
        paginationText={({ totalRecords }) => `共 ${totalRecords} 项`}
      />

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
