'use client'

import { Button, Group, Modal, Stack, Text } from '@mantine/core'
import type { ReactNode } from 'react'

interface FormDialogProps {
  title: string
  description?: string
  isOpen: boolean
  onClose: () => void
  onSubmit: () => void | Promise<void>
  isSubmitting?: boolean
  submitText?: string
  cancelText?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  children: ReactNode
}

export function FormDialog({
  title,
  description,
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  submitText = '确定',
  cancelText = '取消',
  size = 'md',
  children,
}: FormDialogProps) {
  return (
    <Modal opened={isOpen} onClose={onClose} title={title} size={size} centered>
      {description && (
        <Text size="sm" c="dimmed" mb="md">
          {description}
        </Text>
      )}
      <Stack gap="md">
        {children}
        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={onClose} disabled={isSubmitting}>
            {cancelText}
          </Button>
          <Button onClick={onSubmit} loading={isSubmitting}>
            {submitText}
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}
