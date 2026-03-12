'use client'

import { Box, Code, Group, ScrollArea, Text, ThemeIcon } from '@mantine/core'
import type { ReactNode } from 'react'

export function Section({
  title,
  icon,
  children,
}: {
  title: string
  icon: ReactNode
  children: ReactNode
}) {
  return (
    <Box>
      <Group gap="xs" mb="sm">
        <ThemeIcon variant="light" size="sm" radius="sm">
          {icon}
        </ThemeIcon>
        <Text fw={600} size="sm">
          {title}
        </Text>
      </Group>
      <Box pl={32}>{children}</Box>
    </Box>
  )
}

export function InfoRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: ReactNode
}) {
  return (
    <Group gap="xs" wrap="nowrap">
      <Box c="dimmed" style={{ display: 'flex', alignItems: 'center' }}>
        {icon}
      </Box>
      <Text size="xs" c="dimmed" span>
        {label}:
      </Text>
      <Text size="xs" fw={500}>
        {value}
      </Text>
    </Group>
  )
}

export function DetailValue({
  label,
  value,
  isLongText,
  icon,
}: {
  label: string
  value: ReactNode
  isLongText?: boolean
  icon?: ReactNode
}) {
  return (
    <Box>
      <Text size="xs" c="dimmed" mb={2}>
        {label}
      </Text>
      <Group gap={4} wrap="wrap">
        {icon && (
          <Box c="dimmed" style={{ display: 'flex' }}>
            {icon}
          </Box>
        )}
        <Text
          size="sm"
          style={{
            wordBreak: isLongText ? 'break-all' : 'normal',
            overflowWrap: 'anywhere',
          }}
        >
          {value || '-'}
        </Text>
      </Group>
    </Box>
  )
}

export function CodeBlock({
  label,
  value,
  color,
  icon,
}: {
  label: string
  value: string
  color?: string
  icon?: ReactNode
}) {
  let displayValue = value
  try {
    const parsed = JSON.parse(value)
    displayValue = JSON.stringify(parsed, null, 2)
  } catch {
    // Keep as is
  }

  return (
    <Box>
      <Group gap="xs" mb={4}>
        {icon}
        <Text size="xs" c="dimmed" fw={500}>
          {label}
        </Text>
      </Group>
      <ScrollArea.Autosize mah={300} type="auto">
        <Code
          block
          style={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
            backgroundColor: color,
            fontSize: 'var(--mantine-font-size-xs)',
          }}
        >
          {displayValue}
        </Code>
      </ScrollArea.Autosize>
    </Box>
  )
}
