"use client";

/**
 * 菜单表单字段组件
 * @description 菜单表单的各个字段组件
 */

import { DynamicIcon } from "@/components/dynamic-icon";
import { IconPicker } from "@/components/icon-picker";
import {
  Button,
  Input,
  Label,
  ListBox,
  Select,
  Surface,
  TextArea,
  TextField,
} from "@heroui/react";
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

export function MenuFormFields({
  formData,
  onChange,
  parentMenuName,
}: FormFieldProps) {
  const [showIconPicker, setShowIconPicker] = useState(false);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {/* 上级菜单 */}
      <div className="sm:col-span-2">
        <TextField isDisabled value={parentMenuName}>
          <Label>上级菜单</Label>
          <Input />
        </TextField>
      </div>

      {/* 菜单类型 */}
      <Select
        selectedKey={formData.menuType}
        onSelectionChange={(key) => {
          const newType = key as "D" | "M" | "B";
          onChange({
            ...formData,
            menuType: newType,
            // 切换到目录或按钮类型时自动清空路径
            path: newType === "D" || newType === "B" ? "" : formData.path,
            // 切换到按钮类型时自动清空组件路径
            component: newType === "B" ? "" : formData.component,
          });
        }}
      >
        <Label>
          菜单类型 <span className="text-danger">*</span>
        </Label>
        <Select.Trigger>
          <Select.Value />
          <Select.Indicator />
        </Select.Trigger>
        <Select.Popover>
          <ListBox>
            <ListBox.Item id="D" textValue="目录">
              目录
              <ListBox.ItemIndicator />
            </ListBox.Item>
            <ListBox.Item id="M" textValue="菜单">
              菜单
              <ListBox.ItemIndicator />
            </ListBox.Item>
            <ListBox.Item id="B" textValue="按钮">
              按钮
              <ListBox.ItemIndicator />
            </ListBox.Item>
          </ListBox>
        </Select.Popover>
      </Select>

      {/* 菜单名称 */}
      <TextField
        isRequired
        value={formData.menuName}
        onChange={(v) => onChange({ ...formData, menuName: v })}
      >
        <Label>菜单名称</Label>
        <Input placeholder="请输入菜单名称" />
      </TextField>

      {/* 权限标识 */}
      <TextField
        value={formData.permission}
        onChange={(v) => onChange({ ...formData, permission: v })}
      >
        <Label>权限标识</Label>
        <Input placeholder="如：system:admin:list" />
      </TextField>

      {/* 排序 */}
      <TextField
        type="number"
        value={String(formData.sort)}
        onChange={(v) => onChange({ ...formData, sort: Number(v) })}
      >
        <Label>排序</Label>
        <Input placeholder="请输入排序值" />
      </TextField>

      {/* 路由路径 - 仅菜单类型可编辑，目录类型禁用 */}
      {formData.menuType !== "B" && (
        <TextField
          value={formData.path}
          onChange={(v) => onChange({ ...formData, path: v })}
          isDisabled={formData.menuType === "D"}
        >
          <Label>路由路径</Label>
          <Input
            placeholder={
              formData.menuType === "D"
                ? "目录类型无需设置路径"
                : "如：/system/admin"
            }
          />
          {formData.menuType === "D" && (
            <p className="mt-1 text-xs text-muted">
              目录仅用于菜单分组，无需配置路由路径
            </p>
          )}
        </TextField>
      )}

      {/* 组件路径 - 仅菜单显示 */}
      {formData.menuType === "M" && (
        <TextField
          value={formData.component}
          onChange={(v) => onChange({ ...formData, component: v })}
        >
          <Label>组件路径</Label>
          <Input placeholder="如：system/admin/index" />
        </TextField>
      )}

      {/* 图标 - 仅目录和菜单显示 */}
      {formData.menuType !== "B" && (
        <div>
          <Label className="mb-2 block">图标</Label>
          <Surface className="flex items-center gap-2 rounded-xl p-2">
            <div className="flex flex-1 items-center gap-2 px-2">
              <DynamicIcon name={formData.icon} className="size-5" />
              <span className="text-sm text-muted">
                {formData.icon || "未选择"}
              </span>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onPress={() => setShowIconPicker(true)}
            >
              选择
            </Button>
          </Surface>
        </div>
      )}

      {/* 状态 */}
      <Select
        selectedKey={String(formData.status)}
        onSelectionChange={(key) =>
          onChange({ ...formData, status: Number(key) })
        }
      >
        <Label>状态</Label>
        <Select.Trigger>
          <Select.Value />
          <Select.Indicator />
        </Select.Trigger>
        <Select.Popover>
          <ListBox>
            <ListBox.Item id="1" textValue="正常">
              正常
              <ListBox.ItemIndicator />
            </ListBox.Item>
            <ListBox.Item id="0" textValue="禁用">
              禁用
              <ListBox.ItemIndicator />
            </ListBox.Item>
          </ListBox>
        </Select.Popover>
      </Select>

      {/* 显示状态 - 仅目录和菜单显示 */}
      {formData.menuType !== "B" && (
        <Select
          selectedKey={String(formData.visible)}
          onSelectionChange={(key) =>
            onChange({ ...formData, visible: Number(key) })
          }
        >
          <Label>显示状态</Label>
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              <ListBox.Item id="1" textValue="显示">
                显示
                <ListBox.ItemIndicator />
              </ListBox.Item>
              <ListBox.Item id="0" textValue="隐藏">
                隐藏
                <ListBox.ItemIndicator />
              </ListBox.Item>
            </ListBox>
          </Select.Popover>
        </Select>
      )}

      {/* 是否外链 - 仅菜单显示 */}
      {formData.menuType === "M" && (
        <Select
          selectedKey={String(formData.isExternal)}
          onSelectionChange={(key) =>
            onChange({ ...formData, isExternal: Number(key) })
          }
        >
          <Label>是否外链</Label>
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              <ListBox.Item id="0" textValue="否">
                否
                <ListBox.ItemIndicator />
              </ListBox.Item>
              <ListBox.Item id="1" textValue="是">
                是
                <ListBox.ItemIndicator />
              </ListBox.Item>
            </ListBox>
          </Select.Popover>
        </Select>
      )}

      {/* 是否缓存 - 仅菜单显示 */}
      {formData.menuType === "M" && (
        <Select
          selectedKey={String(formData.isCache)}
          onSelectionChange={(key) =>
            onChange({ ...formData, isCache: Number(key) })
          }
        >
          <Label>是否缓存</Label>
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              <ListBox.Item id="1" textValue="是">
                是
                <ListBox.ItemIndicator />
              </ListBox.Item>
              <ListBox.Item id="0" textValue="否">
                否
                <ListBox.ItemIndicator />
              </ListBox.Item>
            </ListBox>
          </Select.Popover>
        </Select>
      )}

      {/* 备注 */}
      <div className="sm:col-span-2">
        <TextField
          value={formData.remark}
          onChange={(v) => onChange({ ...formData, remark: v })}
        >
          <Label>备注</Label>
          <TextArea placeholder="请输入备注" rows={3} />
        </TextField>
      </div>

      {/* 图标选择器弹窗 */}
      {showIconPicker && (
        <IconPicker
          value={formData.icon}
          onChange={(icon) => onChange({ ...formData, icon })}
          onClose={() => setShowIconPicker(false)}
        />
      )}
    </div>
  );
}
