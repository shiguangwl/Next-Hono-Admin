"use client";

import { DynamicIcon } from "@/components/dynamic-icon";
import { IconPicker } from "@/components/icon-picker";
import {
  Button,
  Group,
  NumberInput,
  Select,
  SimpleGrid,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { useState } from "react";

export type MenuFormData = {
  parentId: number;
  menuType: "D" | "M" | "B";
  menuName: string;
  permission: string;
  path: string;
  component: string;
  icon: string;
  sort: number;
  visible: number;
  status: number;
  isExternal: number;
  isCache: number;
  remark: string;
};

interface FormFieldProps {
  formData: MenuFormData;
  onChange: (data: MenuFormData) => void;
  parentMenuName: string;
}

const menuTypeOptions = [
  { value: "D", label: "目录" },
  { value: "M", label: "菜单" },
  { value: "B", label: "按钮" },
];

const statusOptions = [
  { value: "1", label: "正常" },
  { value: "0", label: "禁用" },
];

const visibleOptions = [
  { value: "1", label: "显示" },
  { value: "0", label: "隐藏" },
];

const yesNoOptions = [
  { value: "0", label: "否" },
  { value: "1", label: "是" },
];

const cacheOptions = [
  { value: "1", label: "是" },
  { value: "0", label: "否" },
];

export function MenuFormFields({
  formData,
  onChange,
  parentMenuName,
}: FormFieldProps) {
  const [showIconPicker, setShowIconPicker] = useState(false);

  const handleTypeChange = (val: string | null) => {
    if (!val) return;
    const newType = val as "D" | "M" | "B";
    onChange({
      ...formData,
      menuType: newType,
      path: newType === "D" || newType === "B" ? "" : formData.path,
      component: newType === "B" ? "" : formData.component,
    });
  };

  return (
    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
      <TextInput
        label="上级菜单"
        value={parentMenuName}
        disabled
        style={{ gridColumn: "1 / -1" }}
      />

      <Select
        label="菜单类型"
        required
        data={menuTypeOptions}
        value={formData.menuType}
        onChange={handleTypeChange}
      />

      <TextInput
        label="菜单名称"
        required
        placeholder="请输入菜单名称"
        value={formData.menuName}
        onChange={(e) =>
          onChange({ ...formData, menuName: e.currentTarget.value })
        }
      />

      <TextInput
        label="权限标识"
        placeholder="如：system:admin:list"
        value={formData.permission}
        onChange={(e) =>
          onChange({ ...formData, permission: e.currentTarget.value })
        }
      />

      <NumberInput
        label="排序"
        placeholder="请输入排序值"
        value={formData.sort}
        onChange={(val) => onChange({ ...formData, sort: Number(val) || 0 })}
      />

      {formData.menuType !== "B" && (
        <TextInput
          label="路由路径"
          placeholder={
            formData.menuType === "D"
              ? "目录类型无需设置路径"
              : "如：/system/admin"
          }
          value={formData.path}
          disabled={formData.menuType === "D"}
          description={
            formData.menuType === "D"
              ? "目录仅用于菜单分组，无需配置路由路径"
              : undefined
          }
          onChange={(e) =>
            onChange({ ...formData, path: e.currentTarget.value })
          }
        />
      )}

      {formData.menuType === "M" && (
        <TextInput
          label="组件路径"
          placeholder="如：system/admin/index"
          value={formData.component}
          onChange={(e) =>
            onChange({ ...formData, component: e.currentTarget.value })
          }
        />
      )}

      {formData.menuType !== "B" && (
        <div>
          <Text size="sm" fw={500} mb={4}>
            图标
          </Text>
          <Group
            gap="sm"
            p="xs"
            style={{
              border: "1px solid var(--mantine-color-gray-3)",
              borderRadius: "var(--mantine-radius-sm)",
            }}
          >
            <DynamicIcon name={formData.icon} size={18} />
            <Text size="sm" c="dimmed" style={{ flex: 1 }}>
              {formData.icon || "未选择"}
            </Text>
            <Button
              variant="light"
              size="xs"
              onClick={() => setShowIconPicker(true)}
            >
              选择
            </Button>
          </Group>
        </div>
      )}

      <Select
        label="状态"
        data={statusOptions}
        value={String(formData.status)}
        onChange={(v) => onChange({ ...formData, status: Number(v) })}
      />

      {formData.menuType !== "B" && (
        <Select
          label="显示状态"
          data={visibleOptions}
          value={String(formData.visible)}
          onChange={(v) => onChange({ ...formData, visible: Number(v) })}
        />
      )}

      {formData.menuType === "M" && (
        <Select
          label="是否外链"
          data={yesNoOptions}
          value={String(formData.isExternal)}
          onChange={(v) => onChange({ ...formData, isExternal: Number(v) })}
        />
      )}

      {formData.menuType === "M" && (
        <Select
          label="是否缓存"
          data={cacheOptions}
          value={String(formData.isCache)}
          onChange={(v) => onChange({ ...formData, isCache: Number(v) })}
        />
      )}

      <Textarea
        label="备注"
        placeholder="请输入备注"
        rows={3}
        value={formData.remark}
        onChange={(e) =>
          onChange({ ...formData, remark: e.currentTarget.value })
        }
        style={{ gridColumn: "1 / -1" }}
      />

      {showIconPicker && (
        <IconPicker
          value={formData.icon}
          onChange={(icon) => onChange({ ...formData, icon })}
          onClose={() => setShowIconPicker(false)}
        />
      )}
    </SimpleGrid>
  );
}
