"use client";

/**
 * 系统配置管理页面
 * @description 管理系统配置项，支持多种数据类型
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
import {
  useConfigs,
  useCreateConfig,
  useDeleteConfig,
  useUpdateConfigValue,
} from "@/hooks/queries";
import { ArrowsRotateRight, Pencil, Plus, TrashBin } from "@gravity-ui/icons";
import {
  Button,
  Card,
  FieldError,
  Input,
  Label,
  ListBox,
  Select,
  TextArea,
  TextField,
} from "@heroui/react";
import { type CSSProperties, type ReactNode, useState } from "react";
import { toast } from "sonner";

type ConfigType = "string" | "boolean" | "number" | "json" | "array";

type Config = {
  id: number;
  configKey: string;
  configValue: string | null;
  configType: ConfigType;
  configGroup: string;
  configName: string;
  remark: string | null;
  isSystem: number;
  status: number;
  createdAt: string;
  updatedAt: string;
};

type CreateFormData = {
  configKey: string;
  configValue: string;
  configType: ConfigType;
  configGroup: string;
  configName: string;
  remark: string;
  isSystem: number;
  status: number;
};

const defaultCreateForm: CreateFormData = {
  configKey: "",
  configValue: "",
  configType: "string",
  configGroup: "",
  configName: "",
  remark: "",
  isSystem: 0,
  status: 1,
};

const CONFIG_TYPES: { value: ConfigType; label: string }[] = [
  { value: "string", label: "string" },
  { value: "number", label: "number" },
  { value: "boolean", label: "boolean" },
  { value: "json", label: "json" },
  { value: "array", label: "array" },
];

const STATUS_OPTIONS = [
  { value: "", label: "全部" },
  { value: "1", label: "启用" },
  { value: "0", label: "停用" },
];

export default function ConfigPage() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [filters, setFilters] = useState({
    group: "",
    status: "" as "" | "0" | "1",
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);

  const [editingConfig, setEditingConfig] = useState<Config | null>(null);
  const [editingValue, setEditingValue] = useState("");

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createForm, setCreateForm] =
    useState<CreateFormData>(defaultCreateForm);
  const [createErrors, setCreateErrors] = useState<
    Partial<Record<keyof CreateFormData, string>>
  >({});

  const [deleteTarget, setDeleteTarget] = useState<Config | null>(null);

  const { data, isLoading, refetch } = useConfigs({
    page,
    pageSize,
    group: appliedFilters.group || undefined,
    status: appliedFilters.status ? Number(appliedFilters.status) : undefined,
  });

  const createConfig = useCreateConfig();
  const updateValue = useUpdateConfigValue();
  const deleteConfig = useDeleteConfig();

  const handleSearch = () => {
    setAppliedFilters(filters);
    setPage(1);
  };

  const handleReset = () => {
    const reset = { group: "", status: "" as const };
    setFilters(reset);
    setAppliedFilters(reset);
    setPage(1);
  };

  const openEditDialog = (config: Config) => {
    setEditingConfig(config);
    setEditingValue(config.configValue ?? "");
  };

  const openCreateDialog = () => {
    setCreateForm(defaultCreateForm);
    setCreateErrors({});
    setCreateDialogOpen(true);
  };

  const handleSaveValue = async () => {
    if (!editingConfig) return;
    try {
      await updateValue.mutateAsync({
        id: editingConfig.id,
        input: {
          configValue: editingValue,
          configType: editingConfig.configType,
          status: editingConfig.status,
        },
      });
      setEditingConfig(null);
      toast.success("配置已保存");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "保存失败");
    }
  };

  const validateCreateForm = (): boolean => {
    const errors: Partial<Record<keyof CreateFormData, string>> = {};
    if (!createForm.configKey.trim()) errors.configKey = "请输入配置键";
    if (!createForm.configName.trim()) errors.configName = "请输入配置名称";
    setCreateErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateSave = async () => {
    if (!validateCreateForm()) return;
    try {
      await createConfig.mutateAsync({
        configKey: createForm.configKey.trim(),
        configGroup: createForm.configGroup.trim() || "general",
        configName: createForm.configName.trim(),
        configType: createForm.configType,
        configValue:
          createForm.configValue === "" ? null : createForm.configValue,
        remark: createForm.remark.trim() || null,
        isSystem: createForm.isSystem,
        status: createForm.status,
      });
      setCreateDialogOpen(false);
      toast.success("配置已创建");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "创建失败");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.isSystem === 1) {
      toast.error("系统配置不允许删除");
      setDeleteTarget(null);
      return;
    }
    try {
      await deleteConfig.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
      toast.success("删除成功");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "删除失败");
    }
  };

  const columns: ColumnDef<Config>[] = [
    { key: "id", title: "ID", width: 60 },
    { key: "configGroup", title: "分组" },
    {
      key: "configKey",
      title: "Key",
      render: (v) => <span className="font-mono text-xs">{v as string}</span>,
    },
    { key: "configName", title: "名称" },
    { key: "configType", title: "类型", width: 80 },
    {
      key: "status",
      title: "状态",
      width: 100,
      render: (v) => <EnableStatusChip status={v as number} />,
    },
    {
      key: "isSystem",
      title: "系统",
      width: 60,
      render: (v) => ((v as number) === 1 ? "是" : "否"),
    },
    {
      key: "actions",
      title: "操作",
      width: 120,
      render: (_, record) => (
        <div className="flex items-center gap-1">
          <PermissionGuard permission="system:config:update">
            <Button
              variant="ghost"
              size="sm"
              isIconOnly
              onPress={() => openEditDialog(record)}
              aria-label="编辑值"
            >
              <Pencil className="size-4" />
            </Button>
          </PermissionGuard>
          <PermissionGuard permission="system:config:delete">
            <Button
              variant="ghost"
              size="sm"
              isIconOnly
              isDisabled={record.isSystem === 1}
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
      <PageHeader
        title="系统配置"
        breadcrumbs={[{ label: "系统管理" }, { label: "系统配置" }]}
        actions={
          <div className="flex items-center gap-2">
            <PermissionGuard permission="system:config:create">
              <Button onPress={openCreateDialog}>
                <Plus className="size-4" />
                新增配置
              </Button>
            </PermissionGuard>
            <Button variant="ghost" onPress={() => refetch()}>
              <ArrowsRotateRight className="size-4" />
              刷新
            </Button>
          </div>
        }
      />

      <Card>
        <Card.Content className="p-4">
          <div className="flex items-end gap-4">
            <TextField className="max-w-xs flex-1">
              <Label>分组</Label>
              <Input
                value={filters.group}
                onChange={(e) =>
                  setFilters({ ...filters, group: e.target.value })
                }
                placeholder="如 security / upload / marketing"
              />
            </TextField>
            <Select
              className="w-32"
              placeholder="全部"
              selectedKey={filters.status}
              onSelectionChange={(key) =>
                setFilters({
                  ...filters,
                  status: key as string as "" | "0" | "1",
                })
              }
            >
              <Label>状态</Label>
              <Select.Trigger>
                <Select.Value />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  {STATUS_OPTIONS.map((opt) => (
                    <ListBox.Item
                      key={opt.value}
                      id={opt.value}
                      textValue={opt.label}
                    >
                      {opt.label}
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>
            <Button variant="secondary" onPress={handleSearch}>
              搜索
            </Button>
            <Button variant="ghost" onPress={handleReset}>
              重置
            </Button>
          </div>
        </Card.Content>
      </Card>

      <DataTable
        columns={columns}
        data={data?.items || []}
        rowKey="id"
        loading={isLoading}
        emptyText="暂无配置"
      />

      {data && (
        <Pagination
          current={page}
          pageSize={pageSize}
          total={data.total}
          onChange={setPage}
        />
      )}

      <FormDialog
        title="新增配置"
        description="请按照规范填写配置键、分组和类型，配置值支持原始字符串或 JSON"
        isOpen={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={handleCreateSave}
        isSubmitting={createConfig.isPending}
        submitText="保存"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField isInvalid={!!createErrors.configGroup}>
              <Label>分组</Label>
              <Input
                value={createForm.configGroup}
                onChange={(e) =>
                  setCreateForm({ ...createForm, configGroup: e.target.value })
                }
                placeholder="如 system / auth / feature"
              />
            </TextField>
            <TextField isRequired isInvalid={!!createErrors.configKey}>
              <Label>配置键</Label>
              <Input
                value={createForm.configKey}
                onChange={(e) =>
                  setCreateForm({ ...createForm, configKey: e.target.value })
                }
                placeholder="如 system.site_name"
                className="font-mono"
              />
              {createErrors.configKey && (
                <FieldError>{createErrors.configKey}</FieldError>
              )}
            </TextField>
            <TextField isRequired isInvalid={!!createErrors.configName}>
              <Label>名称</Label>
              <Input
                value={createForm.configName}
                onChange={(e) =>
                  setCreateForm({ ...createForm, configName: e.target.value })
                }
                placeholder="如 站点名称"
              />
              {createErrors.configName && (
                <FieldError>{createErrors.configName}</FieldError>
              )}
            </TextField>
            <Select
              selectedKey={createForm.configType}
              onSelectionChange={(key) =>
                setCreateForm({ ...createForm, configType: key as ConfigType })
              }
            >
              <Label>类型</Label>
              <Select.Trigger>
                <Select.Value />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  {CONFIG_TYPES.map((t) => (
                    <ListBox.Item
                      key={t.value}
                      id={t.value}
                      textValue={t.label}
                    >
                      {t.label}
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>
          </div>

          <TextField>
            <Label>配置值</Label>
            <TextArea
              value={createForm.configValue}
              onChange={(e) =>
                setCreateForm({ ...createForm, configValue: e.target.value })
              }
              rows={6}
              placeholder="在此输入配置值，json/array 类型请填写合法 JSON"
              className="font-mono text-sm"
            />
          </TextField>

          <ConfigValuePreview
            value={createForm.configValue}
            type={createForm.configType}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              selectedKey={String(createForm.status)}
              onSelectionChange={(key) =>
                setCreateForm({ ...createForm, status: Number(key) as 0 | 1 })
              }
            >
              <Label>状态</Label>
              <Select.Trigger>
                <Select.Value />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  <ListBox.Item id="1" textValue="启用">
                    启用
                  </ListBox.Item>
                  <ListBox.Item id="0" textValue="停用">
                    停用
                  </ListBox.Item>
                </ListBox>
              </Select.Popover>
            </Select>
            <TextField>
              <Label>备注</Label>
              <Input
                value={createForm.remark}
                onChange={(e) =>
                  setCreateForm({ ...createForm, remark: e.target.value })
                }
                placeholder="可选"
              />
            </TextField>
          </div>
        </div>
      </FormDialog>

      <FormDialog
        title={`编辑配置值：${editingConfig?.configKey}`}
        description={`类型：${editingConfig?.configType}，名称：${editingConfig?.configName}`}
        isOpen={!!editingConfig}
        onClose={() => setEditingConfig(null)}
        onSubmit={handleSaveValue}
        isSubmitting={updateValue.isPending}
        submitText="保存"
        size="lg"
      >
        <div className="space-y-4">
          <TextField>
            <Label>配置值</Label>
            <TextArea
              value={editingValue}
              onChange={(e) => setEditingValue(e.target.value)}
              rows={10}
              placeholder="在此编辑配置值（原始字符串或 JSON）"
              className="font-mono text-sm"
            />
          </TextField>

          {editingConfig?.remark && (
            <p className="text-xs text-muted">备注：{editingConfig.remark}</p>
          )}

          {editingConfig && (
            <ConfigValuePreview
              value={editingValue}
              type={editingConfig.configType}
            />
          )}
        </div>
      </FormDialog>

      <ConfirmDialog
        title="删除配置"
        content={`确定要删除配置 "${deleteTarget?.configKey}" 吗？此操作不可恢复。`}
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isConfirming={deleteConfig.isPending}
        confirmText="删除"
        isDanger
      />
    </PageContainer>
  );
}

function ConfigValuePreview({
  value,
  type,
}: {
  value: string;
  type: ConfigType;
}) {
  const isJsonLike = type === "json" || type === "array";

  if (!value) {
    return (
      <div>
        <p className="mb-1 text-xs font-medium text-muted">预览</p>
        <div className="rounded-lg bg-default/50 px-3 py-2 text-xs font-mono text-muted">
          (空)
        </div>
      </div>
    );
  }

  if (!isJsonLike) {
    return (
      <div>
        <p className="mb-1 text-xs font-medium text-muted">预览</p>
        <pre className="max-h-60 overflow-auto rounded-lg bg-default/50 px-3 py-2 text-xs font-mono">
          {value}
        </pre>
      </div>
    );
  }

  return <JsonPreview value={value} />;
}

function JsonPreview({ value }: { value: string }) {
  let formatted = value;
  let parseError: string | null = null;

  try {
    const parsed = JSON.parse(value);
    formatted = JSON.stringify(parsed, null, 2);
  } catch {
    parseError = "JSON 解析失败，以下为原始内容";
  }

  const content = syntaxHighlightJson(formatted);

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-medium text-muted">预览（JSON 语法高亮）</span>
        {parseError && <span className="text-danger">{parseError}</span>}
      </div>
      <pre className="max-h-60 overflow-auto rounded-lg bg-[#1e1e1e] px-3 py-2 text-xs font-mono">
        {content}
      </pre>
    </div>
  );
}

function syntaxHighlightJson(json: string): ReactNode[] {
  const regex =
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g;
  const elements: ReactNode[] = [];
  let lastIndex = 0;

  json.replace(
    regex,
    (match, _group, _unicode, _colon, _bool, offset: number) => {
      if (lastIndex < offset) {
        elements.push(json.slice(lastIndex, offset));
      }

      let style: CSSProperties = {};

      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          style = { color: "#9cdcfe" };
        } else {
          style = { color: "#ce9178" };
        }
      } else if (/true|false/.test(match)) {
        style = { color: "#569cd6" };
      } else if (/null/.test(match)) {
        style = { color: "#569cd6", fontStyle: "italic" };
      } else {
        style = { color: "#b5cea8" };
      }

      elements.push(
        <span style={style} key={elements.length}>
          {match}
        </span>
      );

      lastIndex = offset + match.length;
      return match;
    }
  );

  if (lastIndex < json.length) {
    elements.push(json.slice(lastIndex));
  }

  return elements;
}
