"use client";

import {
  ActionIcon,
  AppShell,
  Group,
  NavLink,
  ScrollArea,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useEffect, useMemo, useState } from "react";

import { DynamicIcon } from "@/components/dynamic-icon";
import { useAuth } from "@/hooks/use-auth";

interface MenuTreeNode {
  id: number;
  parentId: number;
  menuType: "D" | "M" | "B";
  menuName: string;
  path: string | null;
  icon: string | null;
  sort: number;
  visible: number;
  status: number;
  isExternal: number;
  children?: MenuTreeNode[];
}

interface AppSidebarProps {
  collapsed?: boolean;
  onCollapsedChange?: (v: boolean) => void;
}

function findActiveIds(menus: MenuTreeNode[], pathname: string): Set<number> {
  const ids: number[] = [];
  const dfs = (items: MenuTreeNode[], parents: number[]): boolean => {
    for (const item of items) {
      const curr = [...parents, item.id];
      if (item.path === pathname) {
        ids.push(...curr);
        return true;
      }
      if (item.children?.length && dfs(item.children, curr)) return true;
    }
    return false;
  };
  if (menus.length > 0 && pathname) dfs(menus, []);
  return new Set(ids);
}

function SidebarMenuItem({
  menu,
  collapsed,
  pathname,
  activeIds,
}: {
  menu: MenuTreeNode;
  collapsed: boolean;
  pathname: string;
  activeIds: Set<number>;
}) {
  const hasChildren = !!menu.children?.length;
  const isActive = menu.path === pathname;
  const isChildActive = activeIds.has(menu.id) && !isActive;
  const [opened, setOpened] = useState(isChildActive);

  useEffect(() => {
    if (isChildActive) setOpened(true);
  }, [isChildActive]);

  if (menu.visible === 0 || menu.status === 0 || menu.menuType === "B")
    return null;

  const icon = <DynamicIcon name={menu.icon} size={20} />;

  if (collapsed) {
    const variant = isActive ? "light" : "subtle";
    let btn: ReactNode;
    if (menu.path && menu.isExternal === 1) {
      btn = (
        <ActionIcon
          component="a"
          href={menu.path}
          target="_blank"
          variant={variant}
          size="lg"
        >
          {icon}
        </ActionIcon>
      );
    } else if (menu.path) {
      btn = (
        <ActionIcon
          component={Link}
          href={menu.path}
          variant={variant}
          size="lg"
        >
          {icon}
        </ActionIcon>
      );
    } else {
      btn = (
        <ActionIcon variant={variant} size="lg">
          {icon}
        </ActionIcon>
      );
    }
    return (
      <Tooltip label={menu.menuName} position="right" withArrow>
        {btn}
      </Tooltip>
    );
  }

  const navLinkBase = {
    label: menu.menuName,
    leftSection: icon,
    active: isActive,
    opened: hasChildren ? opened : undefined,
    onChange: hasChildren ? setOpened : undefined,
    childrenOffset: 28,
  };

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
    : undefined;

  if (!hasChildren && menu.path && menu.isExternal === 1) {
    return (
      <NavLink component="a" href={menu.path} target="_blank" {...navLinkBase}>
        {children}
      </NavLink>
    );
  }

  if (!hasChildren && menu.path) {
    return (
      <NavLink component={Link} href={menu.path} {...navLinkBase}>
        {children}
      </NavLink>
    );
  }

  return <NavLink {...navLinkBase}>{children}</NavLink>;
}

export function AppSidebar({
  collapsed = false,
  onCollapsedChange,
}: AppSidebarProps) {
  const { menus } = useAuth();
  const pathname = usePathname() || "";
  const activeIds = useMemo(
    () => findActiveIds(menus as MenuTreeNode[], pathname),
    [menus, pathname],
  );

  return (
    <>
      <AppShell.Section>
        <Group
          h={60}
          px={collapsed ? 0 : "md"}
          justify={collapsed ? "center" : "flex-start"}
          style={{
            borderBottom: "1px solid var(--mantine-color-default-border)",
          }}
        >
          <Link
            href="/dashboard"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <Text fw={700} size="lg">
              {collapsed ? "A" : "Admin"}
            </Text>
          </Link>
        </Group>
      </AppShell.Section>

      <AppShell.Section grow component={ScrollArea} scrollbarSize={4}>
        <Stack gap={2} p={collapsed ? 4 : "xs"}>
          {menus.map((menu) => (
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

      <AppShell.Section>
        <Group
          justify="center"
          p="xs"
          style={{ borderTop: "1px solid var(--mantine-color-default-border)" }}
        >
          <ActionIcon
            variant="subtle"
            size="lg"
            onClick={() => onCollapsedChange?.(!collapsed)}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </ActionIcon>
        </Group>
      </AppShell.Section>
    </>
  );
}
