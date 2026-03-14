/** biome-ignore-all lint/suspicious/noExplicitAny: 图标库类型无法精确推断，需要动态索引 */
'use client'

import * as Icons from '@tabler/icons-react'
import { FALLBACK_ICON, ICON_REGISTRY } from './icon-registry'

interface DynamicIconProps {
  name?: string | null
  size?: number
  stroke?: number
  filled?: boolean
}

export function DynamicIcon({ name, size = 20, stroke = 1.5, filled = false }: DynamicIconProps) {
  if (!name) {
    return <FALLBACK_ICON size={size} stroke={stroke} />
  }

  const baseName = name.startsWith('Icon') ? name : `Icon${name}`

  // 优先 filled 变体 → 本地注册表 → 全量库兜底
  const lookup = (n: string) =>
    (ICON_REGISTRY as Record<string, any>)[n] || (Icons as Record<string, any>)[n]

  const IconComponent = (filled && lookup(`${baseName}Filled`)) || lookup(baseName)

  if (!IconComponent) {
    return <FALLBACK_ICON size={size} stroke={stroke} />
  }

  return <IconComponent size={size} stroke={stroke} />
}
