/**
 * 动态图标组件
 * @description 根据图标名称动态渲染 lucide-react 图标
 */

import * as LucideIcons from 'lucide-react'

interface DynamicIconProps {
  name?: string | null
  className?: string
  size?: number
}

export function DynamicIcon({ name, className = 'h-5 w-5', size }: DynamicIconProps) {
  if (!name) {
    return (
      <LucideIcons.HelpCircle
        className={className}
        style={size ? { width: size, height: size } : undefined}
      />
    )
  }

  // 获取对应的图标组件
  const IconComponent = LucideIcons[name as keyof typeof LucideIcons] as React.ComponentType<{
    className?: string
    style?: React.CSSProperties
  }>

  // 如果图标不存在，使用默认图标
  if (!IconComponent) {
    return (
      <LucideIcons.HelpCircle
        className={className}
        style={size ? { width: size, height: size } : undefined}
      />
    )
  }

  return (
    <IconComponent className={className} style={size ? { width: size, height: size } : undefined} />
  )
}
