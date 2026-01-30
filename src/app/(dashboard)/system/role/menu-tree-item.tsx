'use client'

/**
 * 菜单树节点组件
 * @description 用于角色权限分配的菜单树节点
 */

import { ChevronRight } from '@gravity-ui/icons'
import { Checkbox, Chip } from '@heroui/react'
import { cn } from '@/lib/utils'

export type MenuTreeNode = {
  id: number
  parentId: number
  menuType: 'D' | 'M' | 'B'
  menuName: string
  permission: string | null
  children?: MenuTreeNode[]
}

interface MenuTreeItemProps {
  node: MenuTreeNode
  checkedIds: number[]
  expandedIds: number[]
  onToggleCheck: (node: MenuTreeNode) => void
  onToggleExpand: (id: number) => void
  level: number
}

const typeConfig = {
  D: { label: '目录', color: 'default' as const },
  M: { label: '菜单', color: 'accent' as const },
  B: { label: '按钮', color: 'warning' as const },
}

export function MenuTreeItem({
  node,
  checkedIds,
  expandedIds,
  onToggleCheck,
  onToggleExpand,
  level,
}: MenuTreeItemProps) {
  const hasChildren = node.children && node.children.length > 0
  const isExpanded = expandedIds.includes(node.id)
  const isChecked = checkedIds.includes(node.id)
  const config = typeConfig[node.menuType]

  return (
    <div>
      <div
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-default/50"
        style={{ paddingLeft: `${level * 20 + 8}px` }}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={() => onToggleExpand(node.id)}
            className="flex size-5 items-center justify-center rounded transition-colors hover:bg-default"
            aria-label={isExpanded ? '收起' : '展开'}
          >
            <ChevronRight
              className={cn('size-4 transition-transform', isExpanded && 'rotate-90')}
            />
          </button>
        ) : (
          <span className="w-5" />
        )}

        <Checkbox isSelected={isChecked} onChange={() => onToggleCheck(node)}>
          <Checkbox.Control>
            <Checkbox.Indicator />
          </Checkbox.Control>
        </Checkbox>

        <span className="flex-1 text-sm">{node.menuName}</span>

        <Chip size="sm" color={config.color} variant="soft">
          {config.label}
        </Chip>
      </div>

      {hasChildren && isExpanded && (
        <div>
          {node.children!.map((child) => (
            <MenuTreeItem
              key={child.id}
              node={child}
              checkedIds={checkedIds}
              expandedIds={expandedIds}
              onToggleCheck={onToggleCheck}
              onToggleExpand={onToggleExpand}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}
