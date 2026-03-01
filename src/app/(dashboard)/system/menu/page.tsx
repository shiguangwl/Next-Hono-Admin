"use client";

import {
  Button,
  Card,
  Center,
  Group,
  Loader,
  Table,
  Text,
} from "@mantine/core";
import { ChevronDown, ChevronUp, Plus, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { PermissionGuard } from "@/components/permission-guard";
import { ConfirmDialog } from "@/components/ui/form-dialog";
import { PageContainer, PageHeader } from "@/components/ui/page-header";
import { useDeleteMenu, useMenuTree } from "@/hooks/queries";
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
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const expandAll = () => setExpandedIds(allMenuIds);
  const collapseAll = () => setExpandedIds([]);

  return (
    <PageContainer>
      <PageHeader
        title="菜单管理"
        breadcrumbs={[{ label: "系统管理" }, { label: "菜单管理" }]}
        actions={
          <Group gap="xs">
            <Button
              variant="subtle"
              size="xs"
              leftSection={<ChevronDown size={14} />}
              onClick={expandAll}
            >
              展开全部
            </Button>
            <Button
              variant="subtle"
              size="xs"
              leftSection={<ChevronUp size={14} />}
              onClick={collapseAll}
            >
              折叠全部
            </Button>
            <Button
              variant="subtle"
              size="xs"
              leftSection={<RefreshCw size={14} />}
              onClick={() => refetch()}
            >
              刷新
            </Button>
            <PermissionGuard permission="system:menu:create">
              <Button
                leftSection={<Plus size={14} />}
                onClick={() => handleCreate()}
              >
                新增菜单
              </Button>
            </PermissionGuard>
          </Group>
        }
      />

      <Card withBorder padding={0}>
        <Table.ScrollContainer minWidth={800}>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>菜单名称</Table.Th>
                <Table.Th>类型</Table.Th>
                <Table.Th>图标</Table.Th>
                <Table.Th>权限标识</Table.Th>
                <Table.Th>路径</Table.Th>
                <Table.Th>排序</Table.Th>
                <Table.Th>状态</Table.Th>
                <Table.Th>操作</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {isLoading ? (
                <Table.Tr>
                  <Table.Td colSpan={8}>
                    <Center py="xl">
                      <Group gap="xs">
                        <Loader size="sm" />
                        <Text size="sm" c="dimmed">
                          加载中...
                        </Text>
                      </Group>
                    </Center>
                  </Table.Td>
                </Table.Tr>
              ) : !menuTree?.length ? (
                <Table.Tr>
                  <Table.Td colSpan={8}>
                    <Center py="xl">
                      <Text size="sm" c="dimmed">
                        暂无菜单数据
                      </Text>
                    </Center>
                  </Table.Td>
                </Table.Tr>
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
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Card>

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
