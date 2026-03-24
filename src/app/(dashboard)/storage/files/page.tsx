'use client'

import { Flex, Paper } from '@mantine/core'
import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import { useState } from 'react'

import { PageContainer, PageHeader } from '@/components/ui/page-header'
import { useCreateFolder, useDeleteFolder, useStorageFolders } from '@/hooks/queries'
import { FileList } from './file-list'
import { FileUploadDialog } from './file-upload-dialog'
import { FolderCreateDialog } from './folder-create-dialog'
import { FolderTree } from './folder-tree'

export default function StorageFilesPage() {
  const [currentPrefix, setCurrentPrefix] = useState('')
  const [uploadOpen, setUploadOpen] = useState(false)
  const [folderCreateOpen, setFolderCreateOpen] = useState(false)

  const { data: folders, isLoading: foldersLoading } =
    useStorageFolders('')

  const createFolder = useCreateFolder()
  const deleteFolder = useDeleteFolder()

  const handleCreateFolder = async (folderName: string) => {
    try {
      await createFolder.mutateAsync({
        prefix: currentPrefix.replace(/\/+$/, ''),
        folderName,
      })
      notifications.show({
        message: `目录 "${folderName}" 已创建`,
        color: 'green',
      })
    } catch (err) {
      notifications.show({
        message: err instanceof Error ? err.message : '创建目录失败',
        color: 'red',
      })
    }
  }

  const handleDeleteFolder = (prefix: string, name: string) => {
    modals.openConfirmModal({
      title: '删除目录',
      children: `确定要删除目录 "${name}" 吗？该目录下的所有文件也将被删除，此操作不可恢复。`,
      labels: { confirm: '删除', cancel: '取消' },
      confirmProps: { color: 'red' },
      centered: true,
      onConfirm: async () => {
        try {
          await deleteFolder.mutateAsync(prefix)
          // WHY: 如果当前正在浏览被删除的目录，需要回到根目录
          if (currentPrefix.startsWith(prefix)) {
            setCurrentPrefix('')
          }
          notifications.show({ message: '目录已删除', color: 'green' })
        } catch (err) {
          notifications.show({
            message: err instanceof Error ? err.message : '删除目录失败',
            color: 'red',
          })
        }
      },
    })
  }

  const folderList = (folders ?? []) as Array<{
    name: string
    prefix: string
    fileCount: number
  }>

  return (
    <PageContainer>
      <PageHeader
        title="文件管理"
        breadcrumbs={[
          { label: '存储管理' },
          { label: '文件管理' },
        ]}
      />

      <Flex gap="md" align="flex-start">
        <Paper
          withBorder
          radius="md"
          p="sm"
          w={250}
          mih="calc(100vh - 200px)"
          style={{ flexShrink: 0 }}
        >
          <FolderTree
            folders={folderList}
            currentPrefix={currentPrefix}
            onSelect={setCurrentPrefix}
            onDelete={handleDeleteFolder}
            isLoading={foldersLoading}
          />
        </Paper>

        <div style={{ flex: 1, minWidth: 0 }}>
          <FileList
            currentPrefix={currentPrefix}
            onUploadClick={() => setUploadOpen(true)}
            onCreateFolderClick={() => setFolderCreateOpen(true)}
          />
        </div>
      </Flex>

      <FileUploadDialog
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        currentPrefix={currentPrefix}
      />

      <FolderCreateDialog
        isOpen={folderCreateOpen}
        onClose={() => setFolderCreateOpen(false)}
        onConfirm={handleCreateFolder}
      />
    </PageContainer>
  )
}
