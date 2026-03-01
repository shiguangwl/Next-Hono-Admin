"use client";

import {
  Button,
  Card,
  Group,
  Select,
  SimpleGrid,
  TextInput,
} from "@mantine/core";
import { Plus, RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PermissionGuard } from "@/components/permission-guard";
import { DataTable } from "@/components/ui/data-table";
import { ConfirmDialog } from "@/components/ui/form-dialog";
import { PageContainer, PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import {
  useConfigs,
  useCreateConfig,
  useDeleteConfig,
  useUpdateConfigValue,
} from "@/hooks/queries";
import { buildColumns, type Config } from "./config-columns";
import {
  ConfigCreateDialog,
  type CreateFormData,
  defaultCreateForm,
} from "./config-create-dialog";
import { ConfigEditDialog } from "./config-edit-dialog";

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

  const columns = buildColumns({
    onEdit: openEditDialog,
    onDelete: setDeleteTarget,
  });

  return (
    <PageContainer>
      <PageHeader
        title="系统配置"
        breadcrumbs={[{ label: "系统管理" }, { label: "系统配置" }]}
        actions={
          <Group gap="sm">
            <PermissionGuard permission="system:config:create">
              <Button
                leftSection={<Plus size={14} />}
                onClick={openCreateDialog}
              >
                新增配置
              </Button>
            </PermissionGuard>
            <Button
              variant="subtle"
              leftSection={<RefreshCw size={14} />}
              onClick={() => refetch()}
            >
              刷新
            </Button>
          </Group>
        }
      />

      <Card padding="md">
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
          <TextInput
            label="分组"
            placeholder="如 security / upload / marketing"
            value={filters.group}
            onChange={(e) =>
              setFilters({ ...filters, group: e.currentTarget.value })
            }
          />
          <Select
            label="状态"
            placeholder="全部"
            data={[
              { value: "", label: "全部" },
              { value: "1", label: "启用" },
              { value: "0", label: "停用" },
            ]}
            value={filters.status}
            onChange={(v) =>
              setFilters({ ...filters, status: (v ?? "") as "" | "0" | "1" })
            }
          />
          <Group align="flex-end" gap="sm">
            <Button variant="filled" onClick={handleSearch}>
              搜索
            </Button>
            <Button variant="default" onClick={handleReset}>
              重置
            </Button>
          </Group>
        </SimpleGrid>
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
          page={page}
          pageSize={pageSize}
          total={data.total}
          onPageChange={setPage}
        />
      )}

      <ConfigCreateDialog
        isOpen={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={handleCreateSave}
        isSubmitting={createConfig.isPending}
        formData={createForm}
        onChange={setCreateForm}
        errors={createErrors}
      />

      <ConfigEditDialog
        config={editingConfig}
        editingValue={editingValue}
        onValueChange={setEditingValue}
        onClose={() => setEditingConfig(null)}
        onSubmit={handleSaveValue}
        isSubmitting={updateValue.isPending}
      />

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
