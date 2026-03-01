"use client";

import {
  Button,
  Code,
  Divider,
  Group,
  Modal,
  ScrollArea,
  SimpleGrid,
  Stack,
  Text,
} from "@mantine/core";

import { StatusChip } from "@/components/ui/status-chip";

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
    <Modal opened onClose={onClose} title="日志详情" size="lg" centered>
      <ScrollArea.Autosize mah="60vh">
        <Stack gap="md">
          <SimpleGrid cols={2}>
            <DetailItem label="ID" value={log.id} />
            <DetailItem label="管理员" value={log.adminName} />
            <DetailItem label="模块" value={log.module} />
            <DetailItem label="操作" value={log.operation} />
          </SimpleGrid>
          <Divider />
          <DetailItem label="描述" value={log.description} />
          <DetailItem label="请求方法" value={log.requestMethod} />
          <DetailItem label="请求URL" value={log.requestUrl} />
          <DetailItem label="请求参数" value={log.requestParams} isCode />
          <Divider />
          <SimpleGrid cols={2}>
            <DetailItem label="IP" value={log.ip} />
            <DetailItem
              label="执行时间"
              value={
                log.executionTime !== null ? `${log.executionTime}ms` : null
              }
            />
          </SimpleGrid>
          <DetailItem label="User-Agent" value={log.userAgent} />
          <Divider />
          <SimpleGrid cols={2}>
            <div>
              <Text size="sm" fw={500} c="dimmed">
                状态
              </Text>
              <StatusChip status={log.status === 1 ? "success" : "danger"}>
                {log.status === 1 ? "成功" : "失败"}
              </StatusChip>
            </div>
            <DetailItem label="创建时间" value={log.createdAt} />
          </SimpleGrid>
          {log.status === 0 && (
            <DetailItem label="错误信息" value={log.errorMsg} isCode />
          )}
        </Stack>
      </ScrollArea.Autosize>
      <Group justify="flex-end" mt="md">
        <Button onClick={onClose}>关闭</Button>
      </Group>
    </Modal>
  );
}

function DetailItem({
  label,
  value,
  isCode,
}: {
  label: string;
  value: string | number | null | undefined;
  isCode?: boolean;
}) {
  return (
    <div>
      <Text size="sm" fw={500} c="dimmed">
        {label}
      </Text>
      {isCode && value ? (
        <Code block mt={4} style={{ maxHeight: 200, overflow: "auto" }}>
          {String(value)}
        </Code>
      ) : (
        <Text size="sm" mt={4}>
          {value ?? "-"}
        </Text>
      )}
    </div>
  );
}

export type { OperationLog };
