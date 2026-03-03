'use client'

import { Badge, Center, Checkbox, Group, Text, UnstyledButton } from '@mantine/core'
import { ChevronRight } from 'lucide-react'

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
  D: { label: '目录', color: 'gray' as const },
  M: { label: '菜单', color: 'blue' as const },
  B: { label: '按钮', color: 'orange' as const },
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
      <Group
        gap="xs"
        wrap="nowrap"
        py={4}
        px="xs"
        pl={level * 20 + 8}
        style={{
          borderRadius: 'var(--mantine-radius-sm)',
          cursor: 'default',
        }}
      >
        {hasChildren ? (
          <UnstyledButton onClick={() => onToggleExpand(node.id)}>
            <Center w={20} h={20}>
              <ChevronRight
                size={14}
                style={{
                  transition: 'transform 150ms',
                  transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                }}
              />
            </Center>
          </UnstyledButton>
        ) : (
          <Center w={20} />
        )}

        <Checkbox checked={isChecked} onChange={() => onToggleCheck(node)} size="xs" />

        <Text size="sm" style={{ flex: 1 }}>
          {node.menuName}
        </Text>

        <Badge size="xs" variant="light" color={config.color}>
          {config.label}
        </Badge>
      </Group>

      {hasChildren &&
        isExpanded &&
        node.children?.map((child) => (
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
  )
}
