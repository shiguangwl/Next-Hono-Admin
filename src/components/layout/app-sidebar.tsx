'use client'

import {
  ActionIcon,
  AppShell,
  Box,
  Divider,
  NavLink,
  ScrollArea,
  Stack,
  Tooltip,
} from '@mantine/core'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import { DynamicIcon } from '@/components/dynamic-icon'
import { useAuth } from '@/hooks/use-auth'

interface MenuTreeNode {
  id: number
  parentId: number
  menuType: 'D' | 'M' | 'B'
  menuName: string
  path: string | null
  icon: string | null
  sort: number
  visible: number
  status: number
  isExternal: number
  children?: MenuTreeNode[]
}

/** 查找当前路径对应的激活节点 ID 链 */
function findActiveIds(menus: MenuTreeNode[], pathname: string): Set<number> {
  const ids: number[] = []
  const dfs = (items: MenuTreeNode[], parents: number[]): boolean => {
    for (const item of items) {
      const curr = [...parents, item.id]
      if (item.path === pathname) {
        ids.push(...curr)
        return true
      }
      if (item.children?.length && dfs(item.children, curr)) return true
    }
    return false
  }
  if (menus.length > 0 && pathname) dfs(menus, [])
  return new Set(ids)
}

/** 折叠状态下的单体菜单项 */
function CollapsedMenuItem({ menu, isActive }: { menu: MenuTreeNode; isActive: boolean }) {
  const icon = <DynamicIcon name={menu.icon} size={22} />
  const variant = isActive ? 'filled' : 'subtle'
  const iconProps = { variant, size: 'lg' as const, radius: 'md' as const }

  const content = menu.path ? (
    menu.isExternal ? (
      <ActionIcon {...iconProps} component="a" href={menu.path} target="_blank">
        {icon}
      </ActionIcon>
    ) : (
      <ActionIcon {...iconProps} component={Link} href={menu.path}>
        {icon}
      </ActionIcon>
    )
  ) : (
    <ActionIcon {...iconProps}>{icon}</ActionIcon>
  )

  return (
    <Tooltip label={menu.menuName} position="right" withArrow offset={10}>
      <Box py={2}>{content}</Box>
    </Tooltip>
  )
}

interface SidebarMenuItemProps {
  menu: MenuTreeNode
  collapsed: boolean
  pathname: string
  activeIds: Set<number>
}

/** 标准导航项渲染逻辑 */
function SidebarMenuItem({ menu, collapsed, pathname, activeIds }: SidebarMenuItemProps) {
  const hasChildren = !!menu.children?.length
  const isActive = menu.path === pathname
  const isChildActive = activeIds.has(menu.id) && !isActive
  const [opened, setOpened] = useState(isChildActive)

  useEffect(() => {
    if (isChildActive) setOpened(true)
  }, [isChildActive])

  if (menu.visible === 0 || menu.status === 0 || menu.menuType === 'B') return null
  if (collapsed) return <CollapsedMenuItem menu={menu} isActive={isActive || isChildActive} />

  const children = hasChildren
    ? menu.children?.map((child) => (
        <SidebarMenuItem
          key={child.id}
          menu={child}
          collapsed={collapsed}
          pathname={pathname}
          activeIds={activeIds}
        />
      ))
    : undefined

  const navProps = {
    label: menu.menuName,
    leftSection: <DynamicIcon name={menu.icon} size={20} />,
    active: isActive,
    opened: hasChildren ? opened : undefined,
    onChange: hasChildren ? setOpened : undefined,
    variant: 'light' as const,
    childrenOffset: 16,
    fw: isActive ? 700 : 500,
    styles: {
      root: { margin: '2px 0', borderRadius: 'var(--mantine-radius-md)' },
      label: { fontSize: 'var(--mantine-font-size-sm)' },
    },
  }

  if (menu.path && menu.isExternal) {
    return (
      <NavLink {...navProps} component="a" href={menu.path} target="_blank">
        {children}
      </NavLink>
    )
  }

  if (menu.path) {
    return (
      <NavLink {...navProps} component={Link} href={menu.path}>
        {children}
      </NavLink>
    )
  }

  return <NavLink {...navProps}>{children}</NavLink>
}

export function AppSidebar({
  collapsed = false,
  onCollapsedChange,
}: {
  collapsed?: boolean
  onCollapsedChange?: (v: boolean) => void
}) {
  const { menus } = useAuth()
  const pathname = usePathname() || ''
  const activeIds = useMemo(
    () => findActiveIds(menus as MenuTreeNode[], pathname),
    [menus, pathname]
  )

  return (
    <Stack
      h="100%"
      gap={0}
      bg="var(--app-sidebar-bg)"
      style={{ borderRight: '1px solid var(--mantine-color-default-border)' }}
    >
      <AppShell.Section grow component={ScrollArea} p="xs" scrollbarSize={4}>
        <Stack gap={2}>
          {menus.map((menu: MenuTreeNode) => (
            <SidebarMenuItem
              key={menu.id}
              menu={menu as MenuTreeNode}
              collapsed={collapsed}
              pathname={pathname}
              activeIds={activeIds}
            />
          ))}
        </Stack>
      </AppShell.Section>

      <AppShell.Section p="xs">
        <Divider mb="xs" variant="dashed" opacity={0.5} />
        <ActionIcon
          variant="subtle"
          size="xl"
          w="100%"
          radius="md"
          color="gray"
          onClick={() => onCollapsedChange?.(!collapsed)}
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </ActionIcon>
      </AppShell.Section>
    </Stack>
  )
}
