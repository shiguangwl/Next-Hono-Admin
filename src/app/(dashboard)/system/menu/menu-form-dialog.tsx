"use client";

import { useCreateMenu, useUpdateMenu } from "@/hooks/queries";
import { Alert, Button, Group, Modal, ScrollArea, Stack } from "@mantine/core";
import { AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { type MenuFormData, MenuFormFields } from "./menu-form-fields";

type MenuTreeNode = {
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
};

interface MenuFormDialogProps {
  open: boolean;
  menu: MenuTreeNode | null;
  parentMenu: MenuTreeNode | null;
  onClose: () => void;
  onSuccess: () => void;
}

const defaultFormData: MenuFormData = {
  parentId: 0,
  menuType: "M",
  menuName: "",
  permission: "",
  path: "",
  component: "",
  icon: "",
  sort: 0,
  visible: 1,
  status: 1,
  isExternal: 0,
  isCache: 1,
  remark: "",
};

export function MenuFormDialog({
  open,
  menu,
  parentMenu,
  onClose,
  onSuccess,
}: MenuFormDialogProps) {
  const isEdit = !!menu;
  const [formData, setFormData] = useState<MenuFormData>(defaultFormData);
  const [error, setError] = useState("");

  const createMenu = useCreateMenu();
  const updateMenu = useUpdateMenu();

  useEffect(() => {
    if (open) {
      if (menu) {
        setFormData({
          parentId: menu.parentId,
          menuType: menu.menuType,
          menuName: menu.menuName,
          permission: menu.permission || "",
          path: menu.path || "",
          component: menu.component || "",
          icon: menu.icon || "",
          sort: menu.sort,
          visible: menu.visible,
          status: menu.status,
          isExternal: menu.isExternal,
          isCache: menu.isCache,
          remark: menu.remark || "",
        });
      } else {
        setFormData({
          ...defaultFormData,
          parentId: parentMenu?.id || 0,
          menuType: parentMenu
            ? parentMenu.menuType === "D"
              ? "M"
              : "B"
            : "D",
        });
      }
      setError("");
    }
  }, [open, menu, parentMenu]);

  const handleSubmit = async () => {
    setError("");
    if (!formData.menuName.trim()) {
      setError("请输入菜单名称");
      return;
    }
    try {
      const input = {
        parentId: formData.parentId,
        menuType: formData.menuType,
        menuName: formData.menuName,
        permission: formData.permission || undefined,
        // WHY: 目录/按钮类型不需要路径
        path:
          formData.menuType === "D" || formData.menuType === "B"
            ? undefined
            : formData.path || undefined,
        component: formData.component || undefined,
        icon: formData.icon || undefined,
        sort: formData.sort,
        visible: formData.visible,
        status: formData.status,
        isExternal: formData.isExternal,
        isCache: formData.isCache,
        remark: formData.remark || undefined,
      };
      if (isEdit && menu) {
        await updateMenu.mutateAsync({ id: menu.id, input });
      } else {
        await createMenu.mutateAsync(input);
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "操作失败");
    }
  };

  const isPending = createMenu.isPending || updateMenu.isPending;
  const parentMenuName =
    parentMenu?.menuName ||
    (formData.parentId === 0 ? "根目录" : `ID: ${formData.parentId}`);

  return (
    <Modal
      opened={open}
      onClose={onClose}
      title={isEdit ? "编辑菜单" : "新增菜单"}
      size="lg"
      centered
    >
      <Stack gap="md">
        {error && (
          <Alert color="red" icon={<AlertCircle size={16} />}>
            {error}
          </Alert>
        )}
        <ScrollArea.Autosize mah="60vh">
          <MenuFormFields
            formData={formData}
            onChange={setFormData}
            parentMenuName={parentMenuName}
          />
        </ScrollArea.Autosize>
        <Group justify="flex-end">
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
