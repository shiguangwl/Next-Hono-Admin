'use client'

import { Button, Modal, Stack, TextInput } from '@mantine/core'
import { useState } from 'react'

interface FolderCreateDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (folderName: string) => void
}

export function FolderCreateDialog({
  isOpen,
  onClose,
  onConfirm,
}: FolderCreateDialogProps) {
  const [name, setName] = useState('')

  const handleSubmit = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    onConfirm(trimmed)
    setName('')
    onClose()
  }

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title="新建目录"
      centered
      size="sm"
    >
      <Stack gap="md">
        <TextInput
          label="目录名称"
          placeholder="输入目录名称"
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />
        <Button onClick={handleSubmit} disabled={!name.trim()}>
          创建
        </Button>
      </Stack>
    </Modal>
  )
}
