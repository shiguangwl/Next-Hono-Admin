"use client";

/**
 * 用户管理页面
 * @description 管理员列表、创建、编辑、删除
 */

import { PermissionGuard } from "@/components/permission-guard";
import {
  type ColumnDef,
  DataTable,
  Pagination,
} from "@/components/ui/data-table";
import { ConfirmDialog, FormDialog } from "@/components/ui/form-dialog";
import { PageContainer, PageHeader } from "@/components/ui/page-header";
import { EnableStatusChip } from "@/components/ui/status-chip";
import { useAdmins, useDeleteAdmin, useResetPassword } from "@/hooks/queries";
import { SUPER_ADMIN_ID } from "@/lib/utils";
import {
  ArrowsRotateRight,
  Key,
  Pencil,
  Plus,
  TrashBin,
} from "@gravity-ui/icons";
import {
  Button,
  Card,
  FieldError,
  Input,
  Label,
  TextField,
} from "@heroui/react";
import { useState } from "react";
import { toast } from "sonner";
import { AdminFormDialog } from "./admin-form-dialog";

type Admin = {
  id: number;
  username: string;
  nickname: string;
  status: number;
  loginIp: string | null;
  loginTime: string | null;
  remark: string | null;
  createdAt: string;
  updatedAt: string;
  roles?: Array<{ id: number; roleName: string }>;
};

export default function AdminPage() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [keyword, setKeyword] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [resetPasswordId, setResetPasswordId] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Admin | null>(null);

  const { data, isLoading, refetch } = useAdmins({
    page,
    pageSize,
    keyword: searchKeyword,
  });
  const deleteAdmin = useDeleteAdmin();
  const resetPassword = useResetPassword();

  const handleSearch = () => {
    setSearchKeyword(keyword);
    setPage(1);
  };

  const handleCreate = () => {
    setEditingAdmin(null);
    setDialogOpen(true);
  };

  const handleEdit = (admin: Admin) => {
    setEditingAdmin(admin);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteAdmin.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
      toast.success("删除成功");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "删除失败");
    }
  };

  const handleResetPassword = async () => {
    if (!resetPasswordId) return;
    if (!newPassword) {
      setPasswordError("请输入新密码");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("密码长度不能少于6位");
      return;
    }
    try {
      await resetPassword.mutateAsync({
        id: resetPasswordId,
        input: { newPassword },
      });
      setResetPasswordId(null);
      setNewPassword("");
      setPasswordError("");
      toast.success("密码重置成功");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "重置密码失败");
    }
  };

  const columns: ColumnDef<Admin>[] = [
    { key: "id", title: "ID", width: 80 },
    { key: "username", title: "用户名" },
    { key: "nickname", title: "昵称", render: (v) => (v as string) || "-" },
    {
      key: "roles",
      title: "角色",
      render: (_, record) =>
        record.roles?.map((r) => r.roleName).join(", ") || "-",
    },
    {
      key: "status",
      title: "状态",
      render: (v) => <EnableStatusChip status={v as number} />,
    },
    {
      key: "loginTime",
      title: "最后登录",
      render: (v) => (v as string) || "-",
    },
    {
      key: "actions",
      title: "操作",
      width: 150,
      render: (_, record) => (
        <div className="flex items-center gap-1">
          {record.id !== SUPER_ADMIN_ID && (
            <>
              <PermissionGuard permission="system:admin:update">
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
              <PermissionGuard permission="system:admin:delete">
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
            </>
          )}
          <PermissionGuard permission="system:admin:resetPwd">
            <Button
              variant="ghost"
              size="sm"
              isIconOnly
              onPress={() => {
                setResetPasswordId(record.id);
                setNewPassword("");
                setPasswordError("");
              }}
              aria-label="重置密码"
            >
              <Key className="size-4" />
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
        title="用户管理"
        breadcrumbs={[{ label: "系统管理" }, { label: "用户管理" }]}
        actions={
          <PermissionGuard permission="system:admin:create">
            <Button onPress={handleCreate}>
              <Plus className="size-4" />
              新增管理员
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
                placeholder="搜索用户名或昵称"
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
        emptyText="暂无管理员数据"
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
      <AdminFormDialog
        open={dialogOpen}
        admin={editingAdmin}
        onClose={() => setDialogOpen(false)}
        onSuccess={() => {
          setDialogOpen(false);
          refetch();
        }}
      />

      {/* 删除确认对话框 */}
      <ConfirmDialog
        title="删除管理员"
        content={`确定要删除管理员 "${deleteTarget?.username}" 吗？此操作不可恢复。`}
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isConfirming={deleteAdmin.isPending}
        confirmText="删除"
        isDanger
      />

      {/* 重置密码对话框 */}
      <FormDialog
        title="重置密码"
        description="请输入新密码"
        isOpen={!!resetPasswordId}
        onClose={() => {
          setResetPasswordId(null);
          setNewPassword("");
          setPasswordError("");
        }}
        onSubmit={handleResetPassword}
        isSubmitting={resetPassword.isPending}
        submitText="确定"
        size="sm"
      >
        <TextField
          isRequired
          isInvalid={!!passwordError}
          type="password"
          value={newPassword}
          onChange={setNewPassword}
        >
          <Label>新密码</Label>
          <Input placeholder="请输入新密码（至少6位）" />
          {passwordError && <FieldError>{passwordError}</FieldError>}
        </TextField>
      </FormDialog>
    </PageContainer>
  );
}
