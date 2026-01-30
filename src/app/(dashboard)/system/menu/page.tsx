"use client";

/**
 * 菜单管理页面
 * @description 菜单列表、创建、编辑、删除
 */

import { PermissionGuard } from "@/components/permission-guard";
import { ConfirmDialog } from "@/components/ui/form-dialog";
import { PageContainer, PageHeader } from "@/components/ui/page-header";
import { useDeleteMenu, useMenuTree } from "@/hooks/queries";
import {
  ArrowsRotateRight,
  ChevronDown,
  ChevronUp,
  Plus,
} from "@gravity-ui/icons";
import { Button, Card, Spinner } from "@heroui/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { MenuFormDialog } from "./menu-form-dialog";
import { type MenuTreeNode, MenuTreeRow } from "./menu-tree-row";

export default function MenuPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<MenuTreeNode | null>(null);
  const [parentMenu, setParentMenu] = useState<MenuTreeNode | null>(null);
  const [expandedIds, setExpandedIds] = useState<number[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<MenuTreeNode | null>(null);

  const { data: menuTree, isLoading, refetch } = useMenuTree();
  const deleteMenu = useDeleteMenu();

  const allMenuIds = useMemo(() => {
    const ids: number[] = [];
    const collect = (nodes: MenuTreeNode[]) => {
      for (const node of nodes) {
        ids.push(node.id);
        if (node.children) collect(node.children);
      }
    };
    if (menuTree) collect(menuTree);
    return ids;
  }, [menuTree]);

  const handleCreate = (parent?: MenuTreeNode) => {
    setEditingMenu(null);
    setParentMenu(parent || null);
    setDialogOpen(true);
  };

  const handleEdit = (menu: MenuTreeNode) => {
    setEditingMenu(menu);
    setParentMenu(null);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMenu.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
      toast.success("删除成功");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "删除失败");
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const expandAll = () => setExpandedIds(allMenuIds);
  const collapseAll = () => setExpandedIds([]);

  return (
    <PageContainer>
      {/* 页面标题 */}
      <PageHeader
        title="菜单管理"
        breadcrumbs={[{ label: "系统管理" }, { label: "菜单管理" }]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onPress={expandAll}>
              <ChevronDown className="size-4" />
              展开全部
            </Button>
            <Button variant="ghost" size="sm" onPress={collapseAll}>
              <ChevronUp className="size-4" />
              折叠全部
            </Button>
            <Button variant="ghost" size="sm" onPress={() => refetch()}>
              <ArrowsRotateRight className="size-4" />
              刷新
            </Button>
            <PermissionGuard permission="system:menu:create">
              <Button onPress={() => handleCreate()}>
                <Plus className="size-4" />
                新增菜单
              </Button>
            </PermissionGuard>
          </div>
        }
      />

      {/* 表格 */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-separator bg-default/50">
                <th className="px-4 py-3 text-left text-sm font-medium">
                  菜单名称
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  类型
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  图标
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  权限标识
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  路径
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  排序
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  状态
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Spinner size="sm" />
                      <span className="text-sm text-muted">加载中...</span>
                    </div>
                  </td>
                </tr>
              ) : !menuTree?.length ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <span className="text-sm text-muted">暂无菜单数据</span>
                  </td>
                </tr>
              ) : (
                menuTree.map((menu: MenuTreeNode) => (
                  <MenuTreeRow
                    key={menu.id}
                    menu={menu}
                    level={0}
                    expandedIds={expandedIds}
                    onToggleExpand={toggleExpand}
                    onEdit={handleEdit}
                    onDelete={setDeleteTarget}
                    onCreate={handleCreate}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 表单对话框 */}
      <MenuFormDialog
        open={dialogOpen}
        menu={editingMenu}
        parentMenu={parentMenu}
        onClose={() => setDialogOpen(false)}
        onSuccess={() => {
          setDialogOpen(false);
          refetch();
        }}
      />

      {/* 删除确认对话框 */}
      <ConfirmDialog
        title="删除菜单"
        content={`确定要删除菜单 "${deleteTarget?.menuName}" 吗？如果有子菜单，将一并删除。`}
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isConfirming={deleteMenu.isPending}
        confirmText="删除"
        isDanger
      />
    </PageContainer>
  );
}
