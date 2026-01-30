"use client";

/**
 * 操作日志页面
 * @description 操作日志列表、多条件筛选
 */

import {
  type ColumnDef,
  DataTable,
  Pagination,
} from "@/components/ui/data-table";
import { ConfirmDialog } from "@/components/ui/form-dialog";
import { PageContainer, PageHeader } from "@/components/ui/page-header";
import { StatusChip } from "@/components/ui/status-chip";
import { useDeleteOperationLog, useOperationLogs } from "@/hooks/queries";
import { ArrowsRotateRight, Xmark } from "@gravity-ui/icons";
import {
  Button,
  Card,
  Input,
  Label,
  ListBox,
  Select,
  TextField,
} from "@heroui/react";
import { useState } from "react";
import { toast } from "sonner";
import { LogDetailDialog, type OperationLog } from "./log-detail-dialog";

export default function LogPage() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [filters, setFilters] = useState({
    adminName: "",
    module: "",
    operation: "",
    status: "" as "" | "0" | "1",
    startTime: "",
    endTime: "",
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [detailLog, setDetailLog] = useState<OperationLog | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<OperationLog | null>(null);

  const { data, isLoading, refetch } = useOperationLogs({
    page,
    pageSize,
    adminName: appliedFilters.adminName || undefined,
    module: appliedFilters.module || undefined,
    operation: appliedFilters.operation || undefined,
    status: appliedFilters.status ? Number(appliedFilters.status) : undefined,
    startTime: appliedFilters.startTime || undefined,
    endTime: appliedFilters.endTime || undefined,
  });
  const deleteLog = useDeleteOperationLog();

  const handleSearch = () => {
    setAppliedFilters(filters);
    setPage(1);
  };

  const handleReset = () => {
    const resetFilters = {
      adminName: "",
      module: "",
      operation: "",
      status: "" as const,
      startTime: "",
      endTime: "",
    };
    setFilters(resetFilters);
    setAppliedFilters(resetFilters);
    setPage(1);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteLog.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
      toast.success("删除成功");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "删除失败");
    }
  };

  const columns: ColumnDef<OperationLog>[] = [
    { key: "id", title: "ID", width: 80 },
    { key: "adminName", title: "管理员", render: (v) => (v as string) || "-" },
    { key: "module", title: "模块", render: (v) => (v as string) || "-" },
    { key: "operation", title: "操作", render: (v) => (v as string) || "-" },
    { key: "requestMethod", title: "请求方法", width: 100 },
    { key: "ip", title: "IP", render: (v) => (v as string) || "-" },
    {
      key: "executionTime",
      title: "耗时",
      width: 80,
      render: (v) => (v !== null ? `${v}ms` : "-"),
    },
    {
      key: "status",
      title: "状态",
      width: 150,
      render: (v) => (
        <StatusChip status={(v as number) === 1 ? "success" : "danger"}>
          {(v as number) === 1 ? "成功" : "失败"}
        </StatusChip>
      ),
    },
    {
      key: "createdAt",
      title: "时间",
      render: (v) => (v as string) || "-",
    },
    {
      key: "actions",
      title: "操作",
      width: 120,
      render: (_, record) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onPress={() => setDetailLog(record)}
          >
            详情
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onPress={() => setDeleteTarget(record)}
          >
            <Xmark className="size-4 text-danger" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageContainer>
      {/* 页面标题 */}
      <PageHeader
        title="操作日志"
        breadcrumbs={[{ label: "系统管理" }, { label: "操作日志" }]}
        actions={
          <Button variant="ghost" onPress={() => refetch()}>
            <ArrowsRotateRight className="size-4" />
            刷新
          </Button>
        }
      />

      {/* 筛选栏 */}
      <Card>
        <Card.Content className="p-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <TextField
              value={filters.adminName}
              onChange={(v) => setFilters({ ...filters, adminName: v })}
            >
              <Label>管理员</Label>
              <Input placeholder="请输入管理员名称" />
            </TextField>

            <TextField
              value={filters.module}
              onChange={(v) => setFilters({ ...filters, module: v })}
            >
              <Label>模块</Label>
              <Input placeholder="请输入模块名称" />
            </TextField>

            <TextField
              value={filters.operation}
              onChange={(v) => setFilters({ ...filters, operation: v })}
            >
              <Label>操作类型</Label>
              <Input placeholder="请输入操作类型" />
            </TextField>

            <Select
              defaultSelectedKey={filters.status}
              onSelectionChange={(key) =>
                setFilters({ ...filters, status: key as "" | "0" | "1" })
              }
            >
              <Label>状态</Label>
              <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  <ListBox.Item id="" textValue="全部">
                    全部
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                  <ListBox.Item id="1" textValue="成功">
                    成功
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                  <ListBox.Item id="0" textValue="失败">
                    失败
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                </ListBox>
              </Select.Popover>
            </Select>

            <TextField
              type="datetime-local"
              value={filters.startTime}
              onChange={(v) => setFilters({ ...filters, startTime: v })}
            >
              <Label>开始时间</Label>
              <Input />
            </TextField>

            <TextField
              type="datetime-local"
              value={filters.endTime}
              onChange={(v) => setFilters({ ...filters, endTime: v })}
            >
              <Label>结束时间</Label>
              <Input />
            </TextField>

            <div className="flex items-end gap-2 sm:col-span-2">
              <Button variant="secondary" onPress={handleSearch}>
                搜索
              </Button>
              <Button variant="ghost" onPress={handleReset}>
                重置
              </Button>
            </div>
          </div>
        </Card.Content>
      </Card>

      {/* 表格 */}
      <DataTable
        columns={columns}
        data={data?.items || []}
        rowKey="id"
        loading={isLoading}
        emptyText="暂无日志数据"
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

      {/* 详情对话框 */}
      {detailLog && (
        <LogDetailDialog log={detailLog} onClose={() => setDetailLog(null)} />
      )}

      {/* 删除确认对话框 */}
      <ConfirmDialog
        title="删除日志"
        content="确定要删除这条日志吗？此操作不可恢复。"
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isConfirming={deleteLog.isPending}
        confirmText="删除"
        isDanger
      />
    </PageContainer>
  );
}
