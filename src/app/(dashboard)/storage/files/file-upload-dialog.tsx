'use client'

import { Button, Group, Modal, Stack, Switch, Text } from '@mantine/core'
import { Dropzone } from '@mantine/dropzone'
import { notifications } from '@mantine/notifications'
import { IconUpload, IconX } from '@tabler/icons-react'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import { storageKeys } from '@/hooks/queries'

interface FileUploadDialogProps {
  isOpen: boolean
  onClose: () => void
  currentPrefix: string
}

async function uploadFile(file: File, prefix: string, isPublic: boolean): Promise<void> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('prefix', prefix)
  formData.append('isPublic', isPublic ? '1' : '0')

  const response = await fetch('/api/storage/files/upload', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    const msg =
      body && typeof body === 'object' && 'message' in body
        ? String(body.message)
        : `HTTP ${response.status}`
    throw new Error(msg)
  }
}

export function FileUploadDialog({ isOpen, onClose, currentPrefix }: FileUploadDialogProps) {
  const [isPublic, setIsPublic] = useState(false)
  const [uploading, setUploading] = useState(false)
  const qc = useQueryClient()

  const handleDrop = async (files: File[]) => {
    setUploading(true)
    let successCount = 0

    for (const file of files) {
      try {
        await uploadFile(file, currentPrefix, isPublic)
        successCount++
      } catch (err) {
        notifications.show({
          message: `上传失败: ${file.name} - ${err instanceof Error ? err.message : '未知错误'}`,
          color: 'red',
        })
      }
    }

    setUploading(false)

    if (successCount > 0) {
      notifications.show({
        message: `成功上传 ${successCount}/${files.length} 个文件`,
        color: 'green',
      })
      qc.invalidateQueries({ queryKey: storageKeys.all })
      onClose()
    }
  }

  return (
    <Modal opened={isOpen} onClose={onClose} title="上传文件" size="lg" centered>
      <Stack gap="md">
        <Dropzone
          onDrop={handleDrop}
          loading={uploading}
          disabled={uploading}
          maxSize={200 * 1024 * 1024}
        >
          <Group justify="center" gap="xl" mih={180} style={{ pointerEvents: 'none' }}>
            <Dropzone.Accept>
              <IconUpload size={48} stroke={1.5} />
            </Dropzone.Accept>
            <Dropzone.Reject>
              <IconX size={48} stroke={1.5} />
            </Dropzone.Reject>
            <Dropzone.Idle>
              <IconUpload size={48} stroke={1.5} opacity={0.4} />
            </Dropzone.Idle>

            <div>
              <Text size="lg" inline>
                拖拽文件到此处，或点击选择文件
              </Text>
              <Text size="sm" c="dimmed" inline mt={7}>
                支持多文件同时上传
              </Text>
            </div>
          </Group>
        </Dropzone>

        <Group justify="space-between">
          <Switch
            label="设为公开文件"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.currentTarget.checked)}
          />
          <Button variant="subtle" onClick={onClose}>
            关闭
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}
