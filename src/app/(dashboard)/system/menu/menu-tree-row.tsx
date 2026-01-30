'use client'

/**
 * 菜单树行组件
 * @description 菜单管理表格的树形行显示
 */

import { ChevronRight, Pencil, Plus, TrashBin } from '@gravity-ui/icons'
import { Button, Chip } from '@heroui/react'
import { DynamicIcon } from '@/components/dynamic-icon'
import { PermissionGuard } from '@/components/permission-guard'
import { EnableStatusChip } from '@/components/ui/status-chip'
import { cn } from '@/lib/utils'

export type MenuTreeNode = {
  id: number
  parentId: number
  menuType: 'D' | 'M' | 'B'
  menuName: string
  permission: string | null
  path: string | null
  component: string | null
  icon: string | null
  sort: number
  visible: number
  status: number
  isExternal: number
  isCache: number
  remark: string | null
  createdAt: string
  updatedAt: string
  children?: MenuTreeNode[]
}

interface MenuTreeRowProps {
  menu: MenuTreeNode
  level: number
  expandedIds: number[]
  onToggleExpand: (id: number) => void
  onEdit: (menu: MenuTreeNode) => void
  onDelete: (menu: MenuTreeNode) => void
  onCreate: (parent: MenuTreeNode) => void
}

const typeConfig = {
  D: { label: '目录', color: 'default' as const },
  M: { label: '菜单', color: 'accent' as const },
  B: { label: '按钮', color: 'warning' as const },
}

export function MenuTreeRow({
  menu,
  level,
  expandedIds,
  onToggleExpand,
  onEdit,
  onDelete,
  onCreate,
}: MenuTreeRowProps) {
  const hasChildren = menu.children && menu.children.length > 0
  const isExpanded = expandedIds.includes(menu.id)
  const config = typeConfig[menu.menuType]

  return (
    <>
      <tr className="border-b border-separator last:border-b-0 transition-colors hover:bg-default/30">
        <td className="px-4 py-3">
          <div className="flex items-center gap-2" style={{ paddingLeft: `${level * 20}px` }}>
            {hasChildren ? (
              <button
                type="button"
                onClick={() => onToggleExpand(menu.id)}
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
            <span className="text-sm font-medium">{menu.menuName}</span>
          </div>
        </td>
        <td className="px-4 py-3">
          <Chip size="sm" color={config.color} variant="soft">
            {config.label}
          </Chip>
        </td>
        <td className="px-4 py-3">
          {menu.icon && <DynamicIcon name={menu.icon} className="size-5" />}
        </td>
        <td className="px-4 py-3 text-sm text-muted">{menu.permission || '-'}</td>
        <td className="px-4 py-3 text-sm text-muted">{menu.path || '-'}</td>
        <td className="px-4 py-3 text-sm">{menu.sort}</td>
        <td className="px-4 py-3">
          <EnableStatusChip status={menu.status} />
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-1">
            {menu.menuType !== 'B' && (
              <PermissionGuard permission="system:menu:create">
                <Button
                  variant="ghost"
                  size="sm"
                  isIconOnly
                  onPress={() => onCreate(menu)}
                  aria-label="新增子菜单"
                >
                  <Plus className="size-4" />
                </Button>
              </PermissionGuard>
            )}
            <PermissionGuard permission="system:menu:update">
              <Button
                variant="ghost"
                size="sm"
                isIconOnly
                onPress={() => onEdit(menu)}
                aria-label="编辑"
              >
                <Pencil className="size-4" />
              </Button>
            </PermissionGuard>
            <PermissionGuard permission="system:menu:delete">
              <Button
                variant="ghost"
                size="sm"
                isIconOnly
                onPress={() => onDelete(menu)}
                aria-label="删除"
              >
                <TrashBin className="size-4 text-danger" />
              </Button>
            </PermissionGuard>
          </div>
        </td>
      </tr>
      {hasChildren &&
        isExpanded &&
        menu.children!.map((child) => (
          <MenuTreeRow
            key={child.id}
            menu={child}
            level={level + 1}
            expandedIds={expandedIds}
            onToggleExpand={onToggleExpand}
            onEdit={onEdit}
            onDelete={onDelete}
            onCreate={onCreate}
          />
        ))}
    </>
  )
}
