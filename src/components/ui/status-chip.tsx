'use client'

import { Badge } from '@mantine/core'
import type { ReactNode } from 'react'

type StatusType = 'success' | 'warning' | 'danger' | 'default'

const STATUS_COLOR: Record<StatusType, string> = {
  success: 'green',
  warning: 'yellow',
  danger: 'red',
  default: 'gray',
}

interface StatusChipProps {
  status: StatusType
  children: ReactNode
}

export function StatusChip({ status, children }: StatusChipProps) {
  return (
    <Badge variant="light" color={STATUS_COLOR[status]} size="sm">
      {children}
    </Badge>
  )
}

interface EnableStatusChipProps {
  status: number | boolean
  enableText?: string
  disableText?: string
}

export function EnableStatusChip({
  status,
  enableText = '正常',
  disableText = '禁用',
}: EnableStatusChipProps) {
  const isEnabled = status === 1 || status === true
  return (
    <StatusChip status={isEnabled ? 'success' : 'danger'}>
      {isEnabled ? enableText : disableText}
    </StatusChip>
  )
}

interface VisibleStatusChipProps {
  visible: number | boolean
  visibleText?: string
  hiddenText?: string
}

export function VisibleStatusChip({
  visible,
  visibleText = '显示',
  hiddenText = '隐藏',
}: VisibleStatusChipProps) {
  const isVisible = visible === 1 || visible === true
  return (
    <StatusChip status={isVisible ? 'success' : 'default'}>
      {isVisible ? visibleText : hiddenText}
    </StatusChip>
  )
}
