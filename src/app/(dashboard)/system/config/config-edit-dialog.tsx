"use client";

import { Stack, Text, Textarea } from "@mantine/core";
import { FormDialog } from "@/components/ui/form-dialog";
import { ConfigValuePreview, type ConfigType } from "./config-value-preview";

interface Config {
  id: number;
  configKey: string;
  configValue: string | null;
  configType: ConfigType;
  configName: string;
  remark: string | null;
}

interface ConfigEditDialogProps {
  config: Config | null;
  editingValue: string;
  onValueChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => Promise<void>;
  isSubmitting: boolean;
}

export function ConfigEditDialog({
  config,
  editingValue,
  onValueChange,
  onClose,
  onSubmit,
  isSubmitting,
}: ConfigEditDialogProps) {
  return (
    <FormDialog
      title={`编辑配置值：${config?.configKey}`}
      description={`类型：${config?.configType}，名称：${config?.configName}`}
      isOpen={!!config}
      onClose={onClose}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
      submitText="保存"
      size="lg"
    >
      <Stack gap="md">
        <Textarea
          label="配置值"
          placeholder="在此编辑配置值（原始字符串或 JSON）"
          rows={10}
          value={editingValue}
          onChange={(e) => onValueChange(e.currentTarget.value)}
          styles={{ input: { fontFamily: "monospace", fontSize: "0.875rem" } }}
        />

        {config?.remark && (
          <Text size="xs" c="dimmed">
            备注：{config.remark}
          </Text>
        )}

        {config && (
          <ConfigValuePreview value={editingValue} type={config.configType} />
        )}
      </Stack>
    </FormDialog>
  );
}

