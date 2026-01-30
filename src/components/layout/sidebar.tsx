'use client'

/**
 * 侧边栏组件
 * @description 后台管理系统侧边栏，显示菜单导航
 */

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { DynamicIcon } from '@/components/dynamic-icon'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'

/**
 * 菜单树节点类型
 */
interface MenuTreeNode {
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

interface SidebarProps {
  /** 是否折叠 */
  collapsed?: boolean
  /** 折叠状态变化回调 */
  onCollapsedChange?: (collapsed: boolean) => void
}

/**
 * 菜单项组件
 */
function MenuItem({
  menu,
  collapsed,
  level = 0,
  pathname,
  activeMenuIds,
}: {
  menu: MenuTreeNode
  collapsed: boolean
  level?: number
  pathname: string
  activeMenuIds: Set<number>
}) {
  const [expanded, setExpanded] = useState(false)
  const [manuallyCollapsed, setManuallyCollapsed] = useState(false)

  const hasChildren = menu.children && menu.children.length > 0
  const isActive = menu.path ? pathname === menu.path : false
  const isChildActive = activeMenuIds.has(menu.id) && !isActive

  // 有活跃子菜单时默认展开,但允许用户手动折叠
  // 无活跃子菜单时使用普通的展开状态
  const isExpanded = isChildActive ? !manuallyCollapsed : expanded

  // 当不再有活跃子菜单时,重置手动折叠状态
  useEffect(() => {
    if (!isChildActive) {
      setManuallyCollapsed(false)
    }
  }, [isChildActive])

  // 不显示隐藏的菜单
  if (menu.visible === 0 || menu.status === 0) return null

  // 按钮类型不在侧边栏显示
  if (menu.menuType === 'B') return null

  const content = (
    <>
      <span className="shrink-0">
        <DynamicIcon name={menu.icon} className="h-5 w-5" />
      </span>
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{menu.menuName}</span>
          {hasChildren && (
            <svg
              className={cn('h-4 w-4 transition-transform', isExpanded && 'rotate-90')}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <title>{isExpanded ? '收起' : '展开'}</title>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </>
      )}
    </>
  )

  const itemClass = cn(
    'flex items-center gap-3 px-3 py-2 text-sm transition-colors',
    level > 0 && !collapsed && 'ml-4'
  )

  if (hasChildren) {
    const handleClick = () => {
      if (isChildActive) {
        // 当前有活跃子菜单,切换手动折叠状态
        setManuallyCollapsed(!manuallyCollapsed)
      } else {
        // 正常切换展开状态
        setExpanded(!expanded)
      }
    }

    return (
      <div>
        <button type="button" className={cn(itemClass, 'w-full')} onClick={handleClick}>
          {content}
        </button>
        {isExpanded && !collapsed && (
          <div className="mt-1 space-y-1">
            {menu.children?.map((child) => (
              <MenuItem
                key={child.id}
                menu={child}
                collapsed={collapsed}
                level={level + 1}
                pathname={pathname}
                activeMenuIds={activeMenuIds}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  if (menu.path) {
    if (menu.isExternal === 1) {
      return (
        <a href={menu.path} target="_blank" rel="noopener noreferrer" className={itemClass}>
          {content}
        </a>
      )
    }
    return (
      <Link href={menu.path} className={itemClass}>
        {content}
      </Link>
    )
  }

  return <div className={itemClass}>{content}</div>
}

/**
 * 侧边栏组件
 */
export function Sidebar({ collapsed = false, onCollapsedChange }: SidebarProps) {
  const { menus } = useAuth()

  const pathname = usePathname() || ''

  const activeMenuIds = useMemo(() => {
    const ids: number[] = []

    const dfs = (items: MenuTreeNode[], parents: number[]): boolean => {
      for (const item of items) {
        const currentParents = [...parents, item.id]
        if (item.path && item.path === pathname) {
          ids.push(...currentParents)
          return true
        }
        if (item.children && item.children.length > 0) {
          if (dfs(item.children, currentParents)) {
            return true
          }
        }
      }
      return false
    }

    if (menus.length > 0 && pathname) {
      dfs(menus, [])
    }

    return new Set(ids)
  }, [menus, pathname])

  return (
    <aside
      className={cn(
        'flex h-screen flex-col transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4">
        {!collapsed && <span className="text-lg font-semibold">Admin</span>}
        <button type="button" className="p-2" onClick={() => onCollapsedChange?.(!collapsed)}>
          <svg
            className={cn('h-5 w-5 transition-transform', collapsed && 'rotate-180')}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <title>{collapsed ? '展开侧边栏' : '收起侧边栏'}</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
            />
          </svg>
        </button>
      </div>

      {/* 菜单列表 */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {menus.map((menu) => (
          <MenuItem
            key={menu.id}
            menu={menu}
            collapsed={collapsed}
            pathname={pathname}
            activeMenuIds={activeMenuIds}
          />
        ))}
      </nav>
    </aside>
  )
}
