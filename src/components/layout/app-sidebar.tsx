"use client";

/**
 * 侧边栏组件
 * @description 后台管理系统侧边栏，使用 HeroUI 组件
 */

import { DynamicIcon } from "@/components/dynamic-icon";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "@gravity-ui/icons";
import { Button, Separator, Tooltip } from "@heroui/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

/**
 * 菜单树节点类型
 */
interface MenuTreeNode {
  id: number;
  parentId: number;
  menuType: "D" | "M" | "B";
  menuName: string;
  permission: string | null;
  path: string | null;
  component: string | null;
  icon: string | null;
  sort: number;
  visible: number;
  status: number;
  isExternal: number;
  isCache: number;
  remark: string | null;
  createdAt: string;
  updatedAt: string;
  children?: MenuTreeNode[];
}

interface AppSidebarProps {
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
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
  menu: MenuTreeNode;
  collapsed: boolean;
  level?: number;
  pathname: string;
  activeMenuIds: Set<number>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [manuallyCollapsed, setManuallyCollapsed] = useState(false);

  const hasChildren = menu.children && menu.children.length > 0;
  const isActive = menu.path ? pathname === menu.path : false;
  const isChildActive = activeMenuIds.has(menu.id) && !isActive;
  const isExpanded = isChildActive ? !manuallyCollapsed : expanded;

  useEffect(() => {
    if (!isChildActive) {
      setManuallyCollapsed(false);
    }
  }, [isChildActive]);

  // 不显示隐藏的菜单或按钮类型
  if (menu.visible === 0 || menu.status === 0 || menu.menuType === "B") {
    return null;
  }

  const iconElement = (
    <span className="flex size-5 shrink-0 items-center justify-center">
      <DynamicIcon name={menu.icon} className="size-5" />
    </span>
  );

  const itemContent = (
    <>
      {iconElement}
      {!collapsed && (
        <>
          <span className="flex-1 truncate text-sm">{menu.menuName}</span>
          {hasChildren && (
            <ChevronRight
              className={cn(
                "size-4 shrink-0 transition-transform duration-200",
                isExpanded && "rotate-90"
              )}
            />
          )}
        </>
      )}
    </>
  );

  const baseClass = cn(
    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-foreground/80 transition-all duration-200",
    "hover:bg-default hover:text-foreground",
    isActive &&
      "bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground",
    isChildActive && !isActive && "text-accent",
    level > 0 && !collapsed && "ml-4",
    collapsed && "justify-center px-2"
  );

  // 折叠状态下使用 Tooltip
  const wrapWithTooltip = (element: React.ReactNode) => {
    if (!collapsed) return element;
    return (
      <Tooltip delay={0}>
        {element}
        <Tooltip.Content placement="right">
          <span className="text-sm">{menu.menuName}</span>
        </Tooltip.Content>
      </Tooltip>
    );
  };

  if (hasChildren) {
    const handleClick = () => {
      if (isChildActive) {
        setManuallyCollapsed(!manuallyCollapsed);
      } else {
        setExpanded(!expanded);
      }
    };

    return (
      <div>
        {wrapWithTooltip(
          <button type="button" className={baseClass} onClick={handleClick}>
            {itemContent}
          </button>
        )}
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
    );
  }

  if (menu.path) {
    const linkElement =
      menu.isExternal === 1 ? (
        <a
          href={menu.path}
          target="_blank"
          rel="noopener noreferrer"
          className={baseClass}
        >
          {itemContent}
        </a>
      ) : (
        <Link href={menu.path} className={baseClass}>
          {itemContent}
        </Link>
      );
    return wrapWithTooltip(linkElement);
  }

  return wrapWithTooltip(<div className={baseClass}>{itemContent}</div>);
}

/**
 * 侧边栏组件
 */
export function AppSidebar({
  collapsed = false,
  onCollapsedChange,
}: AppSidebarProps) {
  const { menus } = useAuth();
  const pathname = usePathname() || "";

  const activeMenuIds = useMemo(() => {
    const ids: number[] = [];

    const dfs = (items: MenuTreeNode[], parents: number[]): boolean => {
      for (const item of items) {
        const currentParents = [...parents, item.id];
        if (item.path && item.path === pathname) {
          ids.push(...currentParents);
          return true;
        }
        if (item.children && item.children.length > 0) {
          if (dfs(item.children, currentParents)) {
            return true;
          }
        }
      }
      return false;
    };

    if (menus.length > 0 && pathname) {
      dfs(menus, []);
    }

    return new Set(ids);
  }, [menus, pathname]);

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-separator bg-surface transition-all duration-300",
        collapsed ? "w-18" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-accent">
              <span className="text-sm font-bold text-accent-foreground">
                A
              </span>
            </div>
            <span className="text-lg font-semibold">Admin</span>
          </Link>
        )}
        {collapsed && (
          <Link href="/dashboard" className="mx-auto">
            <div className="flex size-8 items-center justify-center rounded-lg bg-accent">
              <span className="text-sm font-bold text-accent-foreground">
                A
              </span>
            </div>
          </Link>
        )}
      </div>

      <Separator />

      {/* 菜单列表 */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-3 scrollbar-hide">
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

      <Separator />

      {/* 折叠按钮 */}
      <div className="px-2 py-3">
        <Button
          variant="ghost"
          className={cn("w-full", collapsed && "px-2")}
          onPress={() => onCollapsedChange?.(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="size-5" />
          ) : (
            <ChevronLeft className="size-5" />
          )}
          {!collapsed && <span className="ml-2">收起侧边栏</span>}
        </Button>
      </div>
    </aside>
  );
}
