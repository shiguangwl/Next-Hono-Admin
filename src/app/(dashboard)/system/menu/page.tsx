"use client";

import { closestCenter, DndContext, type DragEndEvent } from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  Button,
  Card,
  Center,
  Group,
  Loader,
  Table,
  Text,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import {
  IconChevronDown,
  IconChevronUp,
  IconPlus,
  IconRefresh,
} from "@tabler/icons-react";
import { useCallback, useMemo, useState } from "react";

import { PermissionGuard } from "@/components/permission-guard";
import { PageContainer, PageHeader } from "@/components/ui/page-header";
import { useBatchSortMenu, useDeleteMenu, useMenuTree } from "@/hooks/queries";
import { MenuFormDialog } from "./menu-form-dialog";
import { type MenuTreeNode, MenuTreeRow } from "./menu-tree-row";

export default function MenuPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<MenuTreeNode | null>(null);
  const [parentMenu, setParentMenu] = useState<MenuTreeNode | null>(null);
  const [expandedIds, setExpandedIds] = useState<number[]>([]);

  const { data: menuTree, isLoading, refetch } = useMenuTree();
  const deleteMenu = useDeleteMenu();
  const batchSort = useBatchSortMenu();

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

  const openDeleteConfirm = (menu: MenuTreeNode) => {
    modals.openConfirmModal({
      title: "删除菜单",
      children: `确定要删除菜单 "${menu.menuName}" 吗？如果有子菜单，将一并删除。`,
      labels: { confirm: "删除", cancel: "取消" },
      confirmProps: { color: "red" },
      centered: true,
      onConfirm: async () => {
        try {
          await deleteMenu.mutateAsync(menu.id);
          notifications.show({ message: "删除成功", color: "green" });
        } catch (err) {
          notifications.show({
            message: err instanceof Error ? err.message : "删除失败",
            color: "red",
          });
        }
      },
    });
  };

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const expandAll = () => setExpandedIds(allMenuIds);
  const collapseAll = () => setExpandedIds([]);

  /** 在整棵树中查找拖拽项所在的同级列表 */
  const findSiblings = useCallback(
    (id: number): MenuTreeNode[] | null => {
      if (!menuTree) return null;

      // WHY: 根级菜单的 parentId 为 0，直接匹配
      const root = menuTree.find((m) => m.id === id);
      if (root) return menuTree;

      const search = (nodes: MenuTreeNode[]): MenuTreeNode[] | null => {
        for (const node of nodes) {
          if (node.children?.some((c) => c.id === id)) return node.children;
          if (node.children) {
            const found = search(node.children);
            if (found) return found;
          }
        }
        return null;
      };
      return search(menuTree);
    },
    [menuTree],
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const siblings = findSiblings(Number(active.id));
      if (!siblings) return;

      const oldIndex = siblings.findIndex((s) => s.id === Number(active.id));
      const newIndex = siblings.findIndex((s) => s.id === Number(over.id));
      if (oldIndex === -1 || newIndex === -1) return;

      // WHY: 降序排列，排在前面的 sort 值更大
      const reordered = arrayMove(siblings, oldIndex, newIndex);
      const sortItems = reordered.map((item, idx) => ({
        id: item.id,
        sort: (reordered.length - idx) * 10,
      }));

      try {
        await batchSort.mutateAsync(sortItems);
        notifications.show({ message: "排序已更新", color: "green" });
      } catch (err) {
        notifications.show({
          message: err instanceof Error ? err.message : "排序更新失败",
          color: "red",
        });
      }
    },
    [findSiblings, batchSort],
  );

  const rootIds = useMemo(() => menuTree?.map((m) => m.id) ?? [], [menuTree]);

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
              leftSection={<IconChevronDown size={14} />}
              onClick={expandAll}
            >
              展开全部
            </Button>
            <Button
              variant="subtle"
              size="xs"
              leftSection={<IconChevronUp size={14} />}
              onClick={collapseAll}
            >
              折叠全部
            </Button>
            <Button
              variant="subtle"
              size="xs"
              leftSection={<IconRefresh size={14} />}
              onClick={() => refetch()}
            >
              刷新
            </Button>
            <PermissionGuard permission="system:menu:create">
              <Button
                leftSection={<IconPlus size={14} />}
                onClick={() => handleCreate()}
              >
                新增菜单
              </Button>
            </PermissionGuard>
          </Group>
        }
      />

      <Card withBorder padding={0} radius="md">
        <Table.ScrollContainer minWidth={800}>
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
          >
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
                  <SortableContext
                    items={rootIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {menuTree.map((menu: MenuTreeNode) => (
                      <MenuTreeRow
                        key={menu.id}
                        menu={menu}
                        level={0}
                        expandedIds={expandedIds}
                        onToggleExpand={toggleExpand}
                        onEdit={handleEdit}
                        onDelete={openDeleteConfirm}
                        onCreate={handleCreate}
                      />
                    ))}
                  </SortableContext>
                )}
              </Table.Tbody>
            </Table>
          </DndContext>
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
    </PageContainer>
  );
}
