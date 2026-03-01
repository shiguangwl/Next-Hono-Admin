"use client";

import {
  Button,
  Checkbox,
  Group,
  Modal,
  Paper,
  PasswordInput,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { useEffect, useState } from "react";

import {
  useAllRoles,
  useCreateAdmin,
  useUpdateAdmin,
  useUpdateAdminRoles,
} from "@/hooks/queries";
import { SUPER_ADMIN_ID } from "@/lib/utils";

type Admin = {
  id: number;
  username: string;
  nickname: string;
  status: number;
  remark: string | null;
  roles?: Array<{ id: number; roleName: string }>;
};

interface AdminFormDialogProps {
  open: boolean;
  admin: Admin | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  username: string;
  password: string;
  nickname: string;
  status: number;
  remark: string;
  roleIds: number[];
}

const initialFormData: FormData = {
  username: "",
  password: "",
  nickname: "",
  status: 1,
  remark: "",
  roleIds: [],
};

export function AdminFormDialog({
  open,
  admin,
  onClose,
  onSuccess,
}: AdminFormDialogProps) {
  const isEdit = !!admin;
  const isSuperAdmin = admin?.id === SUPER_ADMIN_ID;
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
    {},
  );

  const { data: rolesData } = useAllRoles();
  const roles =
    (rolesData as Array<{ id: number; roleName: string }> | undefined) || [];
  const createAdmin = useCreateAdmin();
  const updateAdmin = useUpdateAdmin();
  const updateAdminRoles = useUpdateAdminRoles();

  useEffect(() => {
    if (open) {
      if (admin) {
        setFormData({
          username: admin.username,
          password: "",
          nickname: admin.nickname || "",
          status: admin.status,
          remark: admin.remark || "",
          roleIds: admin.roles?.map((r) => r.id) || [],
        });
      } else {
        setFormData(initialFormData);
      }
      setErrors({});
    }
  }, [open, admin]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (!formData.username.trim()) newErrors.username = "请输入用户名";
    if (!isEdit && !formData.password) newErrors.password = "请输入密码";
    if (!isEdit && formData.password && formData.password.length < 6)
      newErrors.password = "密码长度不能少于6位";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      if (isEdit && admin) {
        await updateAdmin.mutateAsync({
          id: admin.id,
          input: {
            nickname: formData.nickname,
            status: formData.status,
            remark: formData.remark || undefined,
          },
        });
        if (!isSuperAdmin) {
          await updateAdminRoles.mutateAsync({
            id: admin.id,
            input: { roleIds: formData.roleIds },
          });
        }
      } else {
        await createAdmin.mutateAsync({
          username: formData.username,
          password: formData.password,
          nickname: formData.nickname || undefined,
          status: formData.status,
          remark: formData.remark || undefined,
          roleIds: formData.roleIds.length > 0 ? formData.roleIds : undefined,
        });
      }
      onSuccess();
    } catch (err) {
      setErrors({ username: err instanceof Error ? err.message : "操作失败" });
    }
  };

  const isPending =
    createAdmin.isPending ||
    updateAdmin.isPending ||
    updateAdminRoles.isPending;

  const handleRoleToggle = (roleId: number, checked: boolean) => {
    setFormData({
      ...formData,
      roleIds: checked
        ? [...formData.roleIds, roleId]
        : formData.roleIds.filter((id) => id !== roleId),
    });
  };

  return (
    <Modal
      opened={open}
      onClose={onClose}
      title={isEdit ? "编辑管理员" : "新增管理员"}
      size="lg"
      centered
    >
      <Stack gap="md">
        <TextInput
          label="用户名"
          placeholder="请输入用户名"
          required
          disabled={isEdit}
          value={formData.username}
          onChange={(e) =>
            setFormData({ ...formData, username: e.currentTarget.value })
          }
          error={errors.username}
        />

        {!isEdit && (
          <PasswordInput
            label="密码"
            placeholder="请输入密码（至少6位）"
            required
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.currentTarget.value })
            }
            error={errors.password}
          />
        )}

        <TextInput
          label="昵称"
          placeholder="请输入昵称"
          value={formData.nickname}
          onChange={(e) =>
            setFormData({ ...formData, nickname: e.currentTarget.value })
          }
        />

        <Select
          label="状态"
          value={String(formData.status)}
          onChange={(val) => setFormData({ ...formData, status: Number(val) })}
          data={[
            { value: "1", label: "正常" },
            { value: "0", label: "禁用" },
          ]}
        />

        <div>
          <Text size="sm" fw={500} mb="xs">
            角色
          </Text>
          {isSuperAdmin ? (
            <Paper withBorder p="sm" radius="md">
              <Text size="sm" c="dimmed">
                超级管理员角色不可修改
              </Text>
            </Paper>
          ) : (
            <Paper
              withBorder
              p="sm"
              radius="md"
              style={{ maxHeight: 160, overflowY: "auto" }}
            >
              {roles.length === 0 ? (
                <Text size="sm" c="dimmed">
                  暂无角色
                </Text>
              ) : (
                <Stack gap="xs">
                  {roles.map((role) => (
                    <Checkbox
                      key={role.id}
                      label={role.roleName}
                      checked={formData.roleIds.includes(role.id)}
                      onChange={(e) =>
                        handleRoleToggle(role.id, e.currentTarget.checked)
                      }
                    />
                  ))}
                </Stack>
              )}
            </Paper>
          )}
        </div>

        <Textarea
          label="备注"
          placeholder="请输入备注"
          rows={3}
          value={formData.remark}
          onChange={(e) =>
            setFormData({ ...formData, remark: e.currentTarget.value })
          }
        />

        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={onClose} disabled={isPending}>
            取消
          </Button>
          <Button onClick={handleSubmit} loading={isPending}>
            确定
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
