'use client'

import {
  Image,
  Modal,
  Stack,
  Table,
  Text,
} from '@mantine/core'

import type { FileRecord } from './file-columns'

interface FilePreviewDialogProps {
  file: FileRecord | null
  fileUrl: string | null
  onClose: () => void
}

export function FilePreviewDialog({
  file,
  fileUrl,
  onClose,
}: FilePreviewDialogProps) {
  if (!file) return null

  const isImage = file.mimeType.startsWith('image/')
  const isVideo = file.mimeType.startsWith('video/')

  return (
    <Modal
      opened={!!file}
      onClose={onClose}
      title={file.fileName}
      size="lg"
      centered
    >
      <Stack gap="md">
        {isImage && fileUrl && (
          <Image src={fileUrl} alt={file.fileName} radius="md" fit="contain" mah={400} />
        )}

        {isVideo && fileUrl && (
          <video
            src={fileUrl}
            controls
            style={{ maxHeight: 400, borderRadius: 8, width: '100%' }}
          />
        )}

        {!isImage && !isVideo && (
          <Text c="dimmed" ta="center" py="xl">
            该文件类型不支持预览
          </Text>
        )}

        <Table>
          <Table.Tbody>
            <Table.Tr>
              <Table.Td fw={500} w={100}>文件名</Table.Td>
              <Table.Td>{file.fileName}</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td fw={500}>路径</Table.Td>
              <Table.Td>
                <Text size="sm" style={{ wordBreak: 'break-all' }}>
                  {file.fileKey}
                </Text>
              </Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td fw={500}>类型</Table.Td>
              <Table.Td>{file.mimeType}</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td fw={500}>上传者</Table.Td>
              <Table.Td>{file.uploaderName ?? '-'}</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td fw={500}>上传时间</Table.Td>
              <Table.Td>{file.createdAt}</Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
      </Stack>
    </Modal>
  )
}
