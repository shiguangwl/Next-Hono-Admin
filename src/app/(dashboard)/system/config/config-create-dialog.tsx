"use client";

import { Select, SimpleGrid, Stack, Textarea, TextInput } from "@mantine/core";
import { FormDialog } from "@/components/ui/form-dialog";
import { ConfigValuePreview, type ConfigType } from "./config-value-preview";

export type CreateFormData = {
  configKey: string;
  configValue: string;
  configType: ConfigType;
  configGroup: string;
  configName: string;
  remark: string;
  isSystem: number;
  status: number;
};

export const defaultCreateForm: CreateFormData = {
  configKey: "",
  configValue: "",
  configType: "string",
  configGroup: "",
  configName: "",
  remark: "",
  isSystem: 0,
  status: 1,
};

const CONFIG_TYPES = [
  { value: "string", label: "string" },
  { value: "number", label: "number" },
  { value: "boolean", label: "boolean" },
  { value: "json", label: "json" },
  { value: "array", label: "array" },
];

interface ConfigCreateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => Promise<void>;
  isSubmitting: boolean;
  formData: CreateFormData;
  onChange: (data: CreateFormData) => void;
  errors: Partial<Record<keyof CreateFormData, string>>;
}

export function ConfigCreateDialog({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  formData,
  onChange,
  errors,
}: ConfigCreateDialogProps) {
  return (
    <FormDialog
      title="新增配置"
      description="请按照规范填写配置键、分组和类型，配置值支持原始字符串或 JSON"
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
      submitText="保存"
      size="lg"
    >
      <Stack gap="md">
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          <TextInput
            label="分组"
            placeholder="如 system / auth / feature"
            value={formData.configGroup}
            onChange={(e) => onChange({ ...formData, configGroup: e.currentTarget.value })}
            error={errors.configGroup}
          />
          <TextInput
            label="配置键"
            required
            placeholder="如 system.site_name"
            value={formData.configKey}
            onChange={(e) => onChange({ ...formData, configKey: e.currentTarget.value })}
            error={errors.configKey}
            style={{ fontFamily: "monospace" }}
          />
          <TextInput
            label="名称"
            required
            placeholder="如 站点名称"
            value={formData.configName}
            onChange={(e) => onChange({ ...formData, configName: e.currentTarget.value })}
            error={errors.configName}
          />
          <Select
            label="类型"
            data={CONFIG_TYPES}
            value={formData.configType}
            onChange={(v) => onChange({ ...formData, configType: (v ?? "string") as ConfigType })}
          />
        </SimpleGrid>

        <Textarea
          label="配置值"
          placeholder="在此输入配置值，json/array 类型请填写合法 JSON"
          rows={6}
          value={formData.configValue}
          onChange={(e) => onChange({ ...formData, configValue: e.currentTarget.value })}
          styles={{ input: { fontFamily: "monospace", fontSize: "0.875rem" } }}
        />

        <ConfigValuePreview value={formData.configValue} type={formData.configType} />

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          <Select
            label="状态"
            data={[
              { value: "1", label: "启用" },
              { value: "0", label: "停用" },
            ]}
            value={String(formData.status)}
            onChange={(v) => onChange({ ...formData, status: Number(v) })}
          />
          <TextInput
            label="备注"
            placeholder="可选"
            value={formData.remark}
            onChange={(e) => onChange({ ...formData, remark: e.currentTarget.value })}
          />
        </SimpleGrid>
      </Stack>
    </FormDialog>
  );
}

