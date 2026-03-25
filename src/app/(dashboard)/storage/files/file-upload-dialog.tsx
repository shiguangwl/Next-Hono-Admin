'use client'

import { Button, Group, Modal, Progress, Stack, Switch, Text } from '@mantine/core'
import { Dropzone } from '@mantine/dropzone'
import { notifications } from '@mantine/notifications'
import { IconUpload, IconX } from '@tabler/icons-react'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import { storageKeys, useStorageConfig } from '@/hooks/queries'

interface FileUploadDialogProps {
  isOpen: boolean
  onClose: () => void
  currentPrefix: string
}

interface UploadProgress {
  total: number
  completed: number
  currentName: string
}

function isExtensionAllowed(fileName: string, allowed: string[]): boolean {
  if (!allowed.length) return true
  const ext = fileName.split('.').pop()?.toLowerCase()
  return !ext || allowed.includes(ext)
}

async function uploadFileViaServer(file: File, prefix: string, isPublic: boolean): Promise<void> {
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
  const [progress, setProgress] = useState<UploadProgress | null>(null)
  const qc = useQueryClient()

  const { data: config } = useStorageConfig()
  const configData = config as Record<string, unknown> | undefined
  const allowedExts = (configData?.allowedExtensions as string[]) ?? []
  const maxFileSize = (configData?.maxFileSize as number) || 50 * 1024 * 1024

  const handleDrop = async (files: File[]) => {
    const rejected = files.filter((f) => !isExtensionAllowed(f.name, allowedExts))
    const accepted = files.filter((f) => isExtensionAllowed(f.name, allowedExts))

    if (rejected.length > 0) {
      const names = rejected.map((f) => f.name).join(', ')
      notifications.show({ message: `不支持的文件类型: ${names}`, color: 'red' })
    }
    if (accepted.length === 0) return

    let successCount = 0
    setProgress({ total: accepted.length, completed: 0, currentName: accepted[0].name })

    for (let i = 0; i < accepted.length; i++) {
      const file = accepted[i]
      setProgress({ total: accepted.length, completed: i, currentName: file.name })
      try {
        await uploadFileViaServer(file, currentPrefix.replace(/\/+$/, ''), isPublic)
        successCount++
      } catch (err) {
        notifications.show({
          message: `上传失败: ${file.name} - ${err instanceof Error ? err.message : '未知错误'}`,
          color: 'red',
        })
      }
    }

    setProgress(null)
    if (successCount > 0) {
      notifications.show({
        message: `成功上传 ${successCount}/${accepted.length} 个文件`,
        color: 'green',
      })
      qc.invalidateQueries({ queryKey: storageKeys.all })
      onClose()
    }
  }

  const uploading = progress !== null
  const maxSizeMb = Math.round(maxFileSize / 1024 / 1024)
  const extHint = allowedExts.length > 0 ? allowedExts.map((e) => `.${e}`).join(', ') : '所有类型'

  return (
    <Modal opened={isOpen} onClose={onClose} title="上传文件" size="lg" centered>
      <Stack gap="md">
        <Dropzone
          onDrop={handleDrop}
          loading={uploading}
          disabled={uploading}
          maxSize={maxFileSize}
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
                支持格式: {extHint} · 单文件最大 {maxSizeMb}MB
              </Text>
            </div>
          </Group>
        </Dropzone>

        {progress && (
          <Stack gap="xs">
            <Text size="sm">
              正在上传 ({progress.completed + 1}/{progress.total}): {progress.currentName}
            </Text>
            <Progress value={(progress.completed / progress.total) * 100} animated size="sm" />
          </Stack>
        )}

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
