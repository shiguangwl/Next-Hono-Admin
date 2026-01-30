"use client";

/**
 * 角色管理页面
 * @description 角色列表、创建、编辑、删除、权限分配
 */

import { PermissionGuard } from "@/components/permission-guard";
import {
  type ColumnDef,
  DataTable,
  Pagination,
} from "@/components/ui/data-table";
import { ConfirmDialog } from "@/components/ui/form-dialog";
import { PageContainer, PageHeader } from "@/components/ui/page-header";
import { EnableStatusChip } from "@/components/ui/status-chip";
import { useDeleteRole, useRoles } from "@/hooks/queries";
import {
  ArrowsRotateRight,
  Pencil,
  Plus,
  ShieldCheck,
  TrashBin,
} from "@gravity-ui/icons";
import { Button, Card, Input, Label, TextField } from "@heroui/react";
import { useState } from "react";
import { toast } from "sonner";
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
        <div className="flex items-center gap-1">
          <PermissionGuard permission="system:role:update">
            <Button
              variant="ghost"
              size="sm"
              isIconOnly
              onPress={() => handleEdit(record)}
              aria-label="编辑"
            >
              <Pencil className="size-4" />
            </Button>
          </PermissionGuard>
          <PermissionGuard permission="system:role:assignMenu">
            <Button
              variant="ghost"
              size="sm"
              isIconOnly
              onPress={() => setMenuDialogRole(record)}
              aria-label="分配权限"
            >
              <ShieldCheck className="size-4 text-accent" />
            </Button>
          </PermissionGuard>
          <PermissionGuard permission="system:role:delete">
            <Button
              variant="ghost"
              size="sm"
              isIconOnly
              onPress={() => setDeleteTarget(record)}
              aria-label="删除"
            >
              <TrashBin className="size-4 text-danger" />
            </Button>
          </PermissionGuard>
        </div>
      ),
    },
  ];

  return (
    <PageContainer>
      {/* 页面标题 */}
      <PageHeader
        title="角色管理"
        breadcrumbs={[{ label: "系统管理" }, { label: "角色管理" }]}
        actions={
          <PermissionGuard permission="system:role:create">
            <Button onPress={handleCreate}>
              <Plus className="size-4" />
              新增角色
            </Button>
          </PermissionGuard>
        }
      />

      {/* 搜索栏 */}
      <Card>
        <Card.Content className="p-4">
          <div className="flex items-end gap-4">
            <TextField className="max-w-xs flex-1">
              <Label>关键词</Label>
              <Input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="搜索角色名称"
              />
            </TextField>
            <Button variant="secondary" onPress={handleSearch}>
              搜索
            </Button>
            <Button variant="ghost" onPress={() => refetch()}>
              <ArrowsRotateRight className="size-4" />
              刷新
            </Button>
          </div>
        </Card.Content>
      </Card>

      {/* 表格 */}
      <DataTable
        columns={columns}
        data={data?.items || []}
        rowKey="id"
        loading={isLoading}
        emptyText="暂无角色数据"
      />

      {/* 分页 */}
      {data && (
        <Pagination
          current={page}
          pageSize={pageSize}
          total={data.total}
          onChange={setPage}
        />
      )}

      {/* 表单对话框 */}
      <RoleFormDialog
        open={dialogOpen}
        role={editingRole}
        onClose={() => setDialogOpen(false)}
        onSuccess={() => {
          setDialogOpen(false);
          refetch();
        }}
      />

      {/* 权限分配对话框 */}
      <RoleMenuDialog
        open={!!menuDialogRole}
        role={menuDialogRole}
        onClose={() => setMenuDialogRole(null)}
        onSuccess={() => setMenuDialogRole(null)}
      />

      {/* 删除确认对话框 */}
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
