'use client'

/**
 * 状态标签组件
 * @description 用于显示各种状态的标签
 */

import { Ban, Check, CircleFill } from '@gravity-ui/icons'
import { Chip } from '@heroui/react'
import type { ReactNode } from 'react'

type StatusType = 'success' | 'warning' | 'danger' | 'default'

interface StatusChipProps {
  /** 状态类型 */
  status: StatusType
  /** 显示文本 */
  children: ReactNode
  /** 是否显示图标 */
  showIcon?: boolean
  /** 变体 */
  variant?: 'primary' | 'soft'
}

const statusConfig: Record<
  StatusType,
  { color: 'success' | 'warning' | 'danger' | 'default'; icon: typeof Check }
> = {
  success: { color: 'success', icon: Check },
  warning: { color: 'warning', icon: CircleFill },
  danger: { color: 'danger', icon: Ban },
  default: { color: 'default', icon: CircleFill },
}

/**
 * 状态标签组件
 */
export function StatusChip({
  status,
  children,
  showIcon = true,
  variant = 'soft',
}: StatusChipProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <Chip color={config.color} variant={variant}>
      {showIcon && <Icon width={10} />}
      {children}
    </Chip>
  )
}

/**
 * 启用/禁用状态标签
 */
interface EnableStatusChipProps {
  /** 是否启用 (1=启用, 0=禁用) */
  status: number | boolean
  /** 启用文本 */
  enableText?: string
  /** 禁用文本 */
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

/**
 * 可见性状态标签
 */
interface VisibleStatusChipProps {
  /** 是否可见 (1=可见, 0=隐藏) */
  visible: number | boolean
  /** 可见文本 */
  visibleText?: string
  /** 隐藏文本 */
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
