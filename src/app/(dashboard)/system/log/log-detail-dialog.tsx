"use client";

import {
  Badge,
  Button,
  Divider,
  Grid,
  Group,
  Modal,
  Paper,
  ScrollArea,
  Stack,
  Text,
} from "@mantine/core";
import {
  Activity,
  AlertCircle,
  Clock,
  Globe,
  Info,
  Laptop,
  Network,
  Terminal,
  User,
} from "lucide-react";

import { StatusChip } from "@/components/ui/status-chip";
import {
  CodeBlock,
  DetailValue,
  InfoRow,
  Section,
} from "./log-detail-components";

type OperationLog = {
  id: number;
  adminId: number | null;
  adminName: string | null;
  module: string | null;
  operation: string | null;
  description: string | null;
  method: string | null;
  requestMethod: string | null;
  requestUrl: string | null;
  requestParams: string | null;
  responseResult: string | null;
  ip: string | null;
  ipLocation: string | null;
  userAgent: string | null;
  executionTime: number | null;
  status: number;
  errorMsg: string | null;
  createdAt: string;
};

interface LogDetailDialogProps {
  log: OperationLog;
  onClose: () => void;
}

export function LogDetailDialog({ log, onClose }: LogDetailDialogProps) {
  return (
    <Modal
      opened
      onClose={onClose}
      title={
        <Group gap="xs">
          <Activity size={20} />
          <Text fw={700}>日志详情</Text>
          <Badge variant="outline" color="gray">
            ID: {log.id}
          </Badge>
        </Group>
      }
      size="lg"
      centered
      radius="md"
    >
      <ScrollArea.Autosize mah="75vh" offsetScrollbars>
        <Stack gap="lg">
          {/* 状态与摘要 */}
          <Paper withBorder p="md" radius="md" bg="var(--mantine-color-gray-0)">
            <Grid gutter="md">
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <InfoRow
                  icon={<User size={14} />}
                  label="操作人"
                  value={log.adminName || "系统"}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <InfoRow
                  icon={<Clock size={14} />}
                  label="操作时间"
                  value={log.createdAt}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <InfoRow
                  icon={<Info size={14} />}
                  label="业务状态"
                  value={
                    <StatusChip
                      status={log.status === 1 ? "success" : "danger"}
                    >
                      {log.status === 1 ? "成功" : "失败"}
                    </StatusChip>
                  }
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <InfoRow
                  icon={<Activity size={14} />}
                  label="响应耗时"
                  value={
                    log.executionTime !== null ? `${log.executionTime}ms` : "-"
                  }
                />
              </Grid.Col>
            </Grid>
          </Paper>

          {/* 业务信息 */}
          <Section title="业务描述" icon={<Info size={16} />}>
            <Grid gutter="sm">
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <DetailValue label="所属模块" value={log.module} />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <DetailValue label="操作类型" value={log.operation} />
              </Grid.Col>
              <Grid.Col span={12}>
                <DetailValue label="具体描述" value={log.description} />
              </Grid.Col>
            </Grid>
          </Section>

          {/* 请求信息 */}
          <Section title="请求详情" icon={<Network size={16} />}>
            <Stack gap="sm">
              <Group grow align="flex-start">
                <DetailValue
                  label="请求方式"
                  value={<Badge size="lg">{log.requestMethod}</Badge>}
                />
                <DetailValue label="函数方法" value={log.method} />
              </Group>
              <DetailValue label="路径" value={log.requestUrl} isLongText />
              <Grid gutter="sm">
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <DetailValue label="IP 地址" value={log.ip} />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <DetailValue
                    label="IP 归属地"
                    value={log.ipLocation || "-"}
                    icon={<Globe size={14} />}
                  />
                </Grid.Col>
              </Grid>
            </Stack>
          </Section>

          {/* 终端信息 */}
          <Section title="设备信息" icon={<Laptop size={16} />}>
            <DetailValue label="User Agent" value={log.userAgent} isLongText />
          </Section>

          {/* 数据详情 */}
          <Section title="数据详情" icon={<Terminal size={16} />}>
            <Stack gap="md">
              {log.requestParams && (
                <CodeBlock label="请求参数" value={log.requestParams} />
              )}
              {log.responseResult && (
                <CodeBlock label="响应结果" value={log.responseResult} />
              )}
              {log.status === 0 && log.errorMsg && (
                <CodeBlock
                  label="异常信息"
                  value={log.errorMsg}
                  color="var(--mantine-color-red-light)"
                  icon={
                    <AlertCircle
                      size={14}
                      color="var(--mantine-color-red-filled)"
                    />
                  }
                />
              )}
            </Stack>
          </Section>
        </Stack>
      </ScrollArea.Autosize>

      <Divider my="md" />

      <Group justify="flex-end">
        <Button variant="default" onClick={onClose}>
          关闭
        </Button>
      </Group>
    </Modal>
  );
}

export type { OperationLog };
