'use client'

import { Breadcrumbs, Button, Group, Paper, Stack, Text, UnstyledButton } from '@mantine/core'
import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import { IconFolderPlus, IconUpload } from '@tabler/icons-react'
import { useState } from 'react'

import { PermissionGuard } from '@/components/permission-guard'
import { PageContainer, PageHeader } from '@/components/ui/page-header'
import { useCreateFolder, useDeleteFolder, useStorageFolders } from '@/hooks/queries'
import { FileList, type FolderInfo } from './file-list'
import { FileUploadDialog } from './file-upload-dialog'
import { FolderCreateDialog } from './folder-create-dialog'

export default function StorageFilesPage() {
  const [currentPrefix, setCurrentPrefix] = useState('')
  const [uploadOpen, setUploadOpen] = useState(false)
  const [folderCreateOpen, setFolderCreateOpen] = useState(false)

  const { data: folders, isLoading: foldersLoading } = useStorageFolders(currentPrefix)
  const createFolder = useCreateFolder()
  const deleteFolder = useDeleteFolder()

  const breadcrumbParts = currentPrefix.split('/').filter(Boolean)

  const handleCreateFolder = async (folderName: string) => {
    try {
      await createFolder.mutateAsync({
        prefix: currentPrefix.replace(/\/+$/, ''),
        folderName,
      })
      notifications.show({ message: `目录 "${folderName}" 已创建`, color: 'green' })
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
          if (currentPrefix.startsWith(prefix)) setCurrentPrefix('')
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

  const folderList = (folders ?? []) as FolderInfo[]

  return (
    <PageContainer>
      <PageHeader
        title="文件管理"
        breadcrumbs={[{ label: '存储管理' }, { label: '文件管理' }]}
        actions={
          <PermissionGuard permission="storage:file:upload">
            <Group gap="sm">
              <Button
                size="xs"
                variant="light"
                leftSection={<IconFolderPlus size={14} />}
                onClick={() => setFolderCreateOpen(true)}
              >
                新建目录
              </Button>
              <Button
                size="xs"
                leftSection={<IconUpload size={14} />}
                onClick={() => setUploadOpen(true)}
              >
                上传文件
              </Button>
            </Group>
          </PermissionGuard>
        }
      />

      <Paper withBorder p="md" radius="md">
        <Stack gap="md">
          <Breadcrumbs>
            <UnstyledButton onClick={() => setCurrentPrefix('')}>
              <Text size="sm" fw={currentPrefix === '' ? 700 : 400}>
                根目录
              </Text>
            </UnstyledButton>
            {breadcrumbParts.map((part, index) => {
              const targetPrefix = `${breadcrumbParts.slice(0, index + 1).join('/')}/`
              const isLast = index === breadcrumbParts.length - 1
              return (
                <UnstyledButton key={targetPrefix} onClick={() => setCurrentPrefix(targetPrefix)}>
                  <Text size="sm" fw={isLast ? 700 : 400}>
                    {part}
                  </Text>
                </UnstyledButton>
              )
            })}
          </Breadcrumbs>

          <FileList
            currentPrefix={currentPrefix}
            folders={folderList}
            foldersLoading={foldersLoading}
            onNavigate={(prefix) => setCurrentPrefix(`${prefix}/`)}
            onDeleteFolder={handleDeleteFolder}
          />
        </Stack>
      </Paper>

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
