'use client'

import { Group, rem, Stack, Text } from '@mantine/core'
import { Dropzone, type FileWithPath } from '@mantine/dropzone'
import { notifications } from '@mantine/notifications'
import { IconFileUpload, IconUpload, IconX } from '@tabler/icons-react'

interface FileDropzoneProps {
  onFilesAccepted: (files: FileWithPath[]) => void
  accept?: string[]
  maxSize?: number
}

const DEFAULT_ACCEPT = ['application/json', 'text/csv', 'text/plain']
const DEFAULT_MAX_SIZE = 5 * 1024 * 1024

export function FileDropzone({
  onFilesAccepted,
  accept = DEFAULT_ACCEPT,
  maxSize = DEFAULT_MAX_SIZE,
}: FileDropzoneProps) {
  return (
    <Dropzone
      onDrop={onFilesAccepted}
      onReject={(fileRejections) => {
        const message = fileRejections[0]?.errors[0]?.message || '文件上传失败'
        notifications.show({ message, color: 'red' })
      }}
      maxSize={maxSize}
      accept={accept}
    >
      <Group justify="center" gap="xl" mih={120} style={{ pointerEvents: 'none' }}>
        <Dropzone.Accept>
          <IconUpload
            style={{
              width: rem(52),
              height: rem(52),
              color: 'var(--mantine-color-blue-6)',
            }}
          />
        </Dropzone.Accept>
        <Dropzone.Reject>
          <IconX
            style={{
              width: rem(52),
              height: rem(52),
              color: 'var(--mantine-color-red-6)',
            }}
          />
        </Dropzone.Reject>
        <Dropzone.Idle>
          <IconFileUpload
            style={{
              width: rem(52),
              height: rem(52),
              color: 'var(--mantine-color-dimmed)',
            }}
          />
        </Dropzone.Idle>

        <Stack gap={4}>
          <Text size="lg" fw={600}>
            拖拽文件到此处或点击上传
          </Text>
          <Text size="sm" c="dimmed">
            支持 JSON、CSV、TXT 格式，单文件不超过 {Math.round(maxSize / 1024 / 1024)}MB
          </Text>
        </Stack>
      </Group>
    </Dropzone>
  )
}
