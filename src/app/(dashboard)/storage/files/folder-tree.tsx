'use client'

import { ActionIcon, Group, NavLink, ScrollArea, Stack, Text, Tooltip } from '@mantine/core'
import { IconFolder, IconFolderOpen, IconHome, IconTrash } from '@tabler/icons-react'

import { PermissionGuard } from '@/components/permission-guard'

interface FolderInfo {
  name: string
  prefix: string
  fileCount: number
}

interface FolderTreeProps {
  folders: FolderInfo[]
  currentPrefix: string
  onSelect: (prefix: string) => void
  onDelete: (prefix: string, name: string) => void
  isLoading: boolean
}

export function FolderTree({
  folders,
  currentPrefix,
  onSelect,
  onDelete,
  isLoading,
}: FolderTreeProps) {
  if (isLoading) {
    return (
      <Text size="sm" c="dimmed" p="md">
        加载中...
      </Text>
    )
  }

  return (
    <ScrollArea h="calc(100vh - 200px)">
      <Stack gap={0}>
        <NavLink
          label="全部文件"
          leftSection={<IconHome size={16} />}
          active={currentPrefix === ''}
          onClick={() => onSelect('')}
        />
        {folders.map((folder) => {
          const isActive = currentPrefix === `${folder.prefix}/`
          return (
            <NavLink
              key={folder.prefix}
              label={
                <Group gap={4} wrap="nowrap" justify="space-between">
                  <Text size="sm" truncate>
                    {folder.name}{' '}
                    <Text component="span" size="xs" c="dimmed">
                      ({folder.fileCount})
                    </Text>
                  </Text>
                  <PermissionGuard permission="storage:file:delete">
                    <Tooltip label="删除目录">
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        size="xs"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDelete(folder.prefix, folder.name)
                        }}
                      >
                        <IconTrash size={12} />
                      </ActionIcon>
                    </Tooltip>
                  </PermissionGuard>
                </Group>
              }
              leftSection={
                isActive ? (
                  <IconFolderOpen size={16} />
                ) : (
                  <IconFolder size={16} />
                )
              }
              active={isActive}
              onClick={() => onSelect(`${folder.prefix}/`)}
            />
          )
        })}
      </Stack>
    </ScrollArea>
  )
}
