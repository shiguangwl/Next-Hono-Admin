"use client";

import {
  ActionIcon,
  Button,
  Group,
  Paper,
  PasswordInput,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { KeyRound, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PermissionGuard } from "@/components/permission-guard";
import { type ColumnDef, DataTable } from "@/components/ui/data-table";
import { ConfirmDialog, FormDialog } from "@/components/ui/form-dialog";
import { PageContainer, PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { EnableStatusChip } from "@/components/ui/status-chip";
import { useAdmins, useDeleteAdmin, useResetPassword } from "@/hooks/queries";
import { SUPER_ADMIN_ID } from "@/lib/utils";
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
        <Group gap={4}>
          {record.id !== SUPER_ADMIN_ID && (
            <>
              <PermissionGuard permission="system:admin:update">
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
              <PermissionGuard permission="system:admin:delete">
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
            </>
          )}
          <PermissionGuard permission="system:admin:resetPwd">
            <Tooltip label="重置密码">
              <ActionIcon
                variant="subtle"
                size="sm"
                onClick={() => {
                  setResetPasswordId(record.id);
                  setNewPassword("");
                  setPasswordError("");
                }}
              >
                <KeyRound size={14} />
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
        title="用户管理"
        breadcrumbs={[{ label: "系统管理" }, { label: "用户管理" }]}
        actions={
          <PermissionGuard permission="system:admin:create">
            <Button leftSection={<Plus size={16} />} onClick={handleCreate}>
              新增管理员
            </Button>
          </PermissionGuard>
        }
      />

      <Paper withBorder p="md" radius="md">
        <Group>
          <TextInput
            style={{ flex: 1, maxWidth: 300 }}
            label="关键词"
            placeholder="搜索用户名或昵称"
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
        emptyText="暂无管理员数据"
      />

      {data && (
        <Pagination
          page={page}
          pageSize={pageSize}
          total={data.total}
          onPageChange={setPage}
        />
      )}

      <AdminFormDialog
        open={dialogOpen}
        admin={editingAdmin}
        onClose={() => setDialogOpen(false)}
        onSuccess={() => {
          setDialogOpen(false);
          refetch();
        }}
      />

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
        <PasswordInput
          label="新密码"
          placeholder="请输入新密码（至少6位）"
          required
          value={newPassword}
          onChange={(e) => setNewPassword(e.currentTarget.value)}
          error={passwordError || undefined}
        />
      </FormDialog>
    </PageContainer>
  );
}
