"use client";

import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ActionIcon,
  Badge,
  Center,
  Group,
  Table,
  Tooltip,
  UnstyledButton,
} from "@mantine/core";
import {
  IconChevronRight,
  IconGripVertical,
  IconPencil,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";

import { DynamicIcon } from "@/components/dynamic-icon";
import { PermissionGuard } from "@/components/permission-guard";
import { EnableStatusChip } from "@/components/ui/status-chip";

export type MenuTreeNode = {
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
};

interface MenuTreeRowProps {
  menu: MenuTreeNode;
  level: number;
  expandedIds: number[];
  onToggleExpand: (id: number) => void;
  onEdit: (menu: MenuTreeNode) => void;
  onDelete: (menu: MenuTreeNode) => void;
  onCreate: (parent: MenuTreeNode) => void;
}

const typeConfig = {
  D: { label: "目录", color: "gray" as const },
  M: { label: "菜单", color: "blue" as const },
  B: { label: "按钮", color: "orange" as const },
};

function SortableRow({
  menu,
  level,
  expandedIds,
  onToggleExpand,
  onEdit,
  onDelete,
  onCreate,
}: MenuTreeRowProps) {
  const hasChildren = menu.children && menu.children.length > 0;
  const isExpanded = expandedIds.includes(menu.id);
  const config = typeConfig[menu.menuType];

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: menu.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <>
      <Table.Tr ref={setNodeRef} style={style}>
        <Table.Td>
          <Group gap="xs" wrap="nowrap" pl={level * 20}>
            <Center
              w={20}
              h={20}
              style={{ cursor: "grab", touchAction: "none" }}
              {...attributes}
              {...listeners}
            >
              <IconGripVertical size={14} color="var(--mantine-color-dimmed)" />
            </Center>
            {hasChildren ? (
              <UnstyledButton onClick={() => onToggleExpand(menu.id)}>
                <Center w={20} h={20}>
                  <IconChevronRight
                    size={14}
                    style={{
                      transition: "transform 150ms",
                      transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                    }}
                  />
                </Center>
              </UnstyledButton>
            ) : (
              <Center w={20} />
            )}
            <span
              style={{
                fontSize: "var(--mantine-font-size-sm)",
                fontWeight: 500,
              }}
            >
              {menu.menuName}
            </span>
          </Group>
        </Table.Td>
        <Table.Td>
          <Badge size="xs" variant="light" color={config.color}>
            {config.label}
          </Badge>
        </Table.Td>
        <Table.Td>
          {menu.icon && <DynamicIcon name={menu.icon} size={18} />}
        </Table.Td>
        <Table.Td fz="sm" c="dimmed">
          {menu.permission || "-"}
        </Table.Td>
        <Table.Td fz="sm" c="dimmed">
          {menu.path || "-"}
        </Table.Td>
        <Table.Td fz="sm">{menu.sort}</Table.Td>
        <Table.Td>
          <EnableStatusChip status={menu.status} />
        </Table.Td>
        <Table.Td>
          <Group gap={4}>
            {menu.menuType !== "B" && (
              <PermissionGuard permission="system:menu:create">
                <Tooltip label="新增子菜单">
                  <ActionIcon
                    variant="subtle"
                    size="sm"
                    onClick={() => onCreate(menu)}
                  >
                    <IconPlus size={14} />
                  </ActionIcon>
                </Tooltip>
              </PermissionGuard>
            )}
            <PermissionGuard permission="system:menu:update">
              <Tooltip label="编辑">
                <ActionIcon
                  variant="subtle"
                  size="sm"
                  onClick={() => onEdit(menu)}
                >
                  <IconPencil size={14} />
                </ActionIcon>
              </Tooltip>
            </PermissionGuard>
            <PermissionGuard permission="system:menu:delete">
              <Tooltip label="删除">
                <ActionIcon
                  variant="subtle"
                  color="red"
                  size="sm"
                  onClick={() => onDelete(menu)}
                >
                  <IconTrash size={14} />
                </ActionIcon>
              </Tooltip>
            </PermissionGuard>
          </Group>
        </Table.Td>
      </Table.Tr>
      {hasChildren && isExpanded && (
        <SortableChildrenGroup
          items={menu.children!}
          level={level + 1}
          expandedIds={expandedIds}
          onToggleExpand={onToggleExpand}
          onEdit={onEdit}
          onDelete={onDelete}
          onCreate={onCreate}
        />
      )}
    </>
  );
}

/** 同级子菜单的可排序容器 */
function SortableChildrenGroup({
  items,
  level,
  expandedIds,
  onToggleExpand,
  onEdit,
  onDelete,
  onCreate,
}: {
  items: MenuTreeNode[];
  level: number;
  expandedIds: number[];
  onToggleExpand: (id: number) => void;
  onEdit: (menu: MenuTreeNode) => void;
  onDelete: (menu: MenuTreeNode) => void;
  onCreate: (parent: MenuTreeNode) => void;
}) {
  const ids = items.map((item) => item.id);

  return (
    <SortableContext items={ids} strategy={verticalListSortingStrategy}>
      {items.map((child) => (
        <SortableRow
          key={child.id}
          menu={child}
          level={level}
          expandedIds={expandedIds}
          onToggleExpand={onToggleExpand}
          onEdit={onEdit}
          onDelete={onDelete}
          onCreate={onCreate}
        />
      ))}
    </SortableContext>
  );
}

export function MenuTreeRow(props: MenuTreeRowProps) {
  return <SortableRow {...props} />;
}
