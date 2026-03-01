"use client";

import {
  ActionIcon,
  Button,
  Group,
  Paper,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { Pencil, Plus, RefreshCw, ShieldCheck, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PermissionGuard } from "@/components/permission-guard";
import { type ColumnDef, DataTable } from "@/components/ui/data-table";
import { ConfirmDialog } from "@/components/ui/form-dialog";
import { PageContainer, PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { EnableStatusChip } from "@/components/ui/status-chip";
import { useDeleteRole, useRoles } from "@/hooks/queries";
import { RoleFormDialog } from "./role-form-dialog";
import { RoleMenuDialog } from "./role-menu-dialog";

type Role = {
  id: number;
  roleName: string;
  sort: number;
  status: number;
  remark: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function RolePage() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [keyword, setKeyword] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [menuDialogRole, setMenuDialogRole] = useState<Role | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);

  const { data, isLoading, refetch } = useRoles({
    page,
    pageSize,
    keyword: searchKeyword,
  });
  const deleteRole = useDeleteRole();

  const handleSearch = () => {
    setSearchKeyword(keyword);
    setPage(1);
  };

  const handleCreate = () => {
    setEditingRole(null);
    setDialogOpen(true);
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteRole.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
      toast.success("删除成功");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "删除失败");
    }
  };

  const columns: ColumnDef<Role>[] = [
    { key: "id", title: "ID", width: 80 },
    { key: "roleName", title: "角色名称" },
    { key: "sort", title: "排序", width: 80 },
    {
      key: "status",
      title: "状态",
      render: (v) => <EnableStatusChip status={v as number} />,
    },
    { key: "remark", title: "备注", render: (v) => (v as string) || "-" },
    {
      key: "createdAt",
      title: "创建时间",
      render: (v) => (v as string) || "-",
    },
    {
      key: "actions",
      title: "操作",
      width: 150,
      render: (_, record) => (
        <Group gap={4}>
          <PermissionGuard permission="system:role:update">
            <Tooltip label="编辑">
              <ActionIcon
                variant="subtle"
                size="sm"
                onClick={() => handleEdit(record)}
              >
                <Pencil size={14} />
              </ActionIcon>
            </Tooltip>
          </PermissionGuard>
          <PermissionGuard permission="system:role:assignMenu">
            <Tooltip label="分配权限">
              <ActionIcon
                variant="subtle"
                color="blue"
                size="sm"
                onClick={() => setMenuDialogRole(record)}
              >
                <ShieldCheck size={14} />
              </ActionIcon>
            </Tooltip>
          </PermissionGuard>
          <PermissionGuard permission="system:role:delete">
            <Tooltip label="删除">
              <ActionIcon
                variant="subtle"
                color="red"
                size="sm"
                onClick={() => setDeleteTarget(record)}
              >
                <Trash2 size={14} />
              </ActionIcon>
            </Tooltip>
          </PermissionGuard>
        </Group>
      ),
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="角色管理"
        breadcrumbs={[{ label: "系统管理" }, { label: "角色管理" }]}
        actions={
          <PermissionGuard permission="system:role:create">
            <Button leftSection={<Plus size={16} />} onClick={handleCreate}>
              新增角色
            </Button>
          </PermissionGuard>
        }
      />

      <Paper withBorder p="md" radius="md">
        <Group>
          <TextInput
            style={{ flex: 1, maxWidth: 300 }}
            label="关键词"
            placeholder="搜索角色名称"
            value={keyword}
            onChange={(e) => setKeyword(e.currentTarget.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button variant="default" onClick={handleSearch} mt="auto">
            搜索
          </Button>
          <Button
            variant="subtle"
            leftSection={<RefreshCw size={14} />}
            onClick={() => refetch()}
            mt="auto"
          >
            刷新
          </Button>
        </Group>
      </Paper>

      <DataTable
        columns={columns}
        data={data?.items || []}
        rowKey="id"
        loading={isLoading}
        emptyText="暂无角色数据"
      />

      {data && (
        <Pagination
          page={page}
          pageSize={pageSize}
          total={data.total}
          onPageChange={setPage}
        />
      )}

      <RoleFormDialog
        open={dialogOpen}
        role={editingRole}
        onClose={() => setDialogOpen(false)}
        onSuccess={() => {
          setDialogOpen(false);
          refetch();
        }}
      />

      <RoleMenuDialog
        open={!!menuDialogRole}
        role={menuDialogRole}
        onClose={() => setMenuDialogRole(null)}
        onSuccess={() => setMenuDialogRole(null)}
      />

      <ConfirmDialog
        title="删除角色"
        content={`确定要删除角色 "${deleteTarget?.roleName}" 吗？此操作不可恢复。`}
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isConfirming={deleteRole.isPending}
        confirmText="删除"
        isDanger
      />
    </PageContainer>
  );
}
