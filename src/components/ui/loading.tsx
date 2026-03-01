"use client";

import { Center, Group, Loader, Stack, Text } from "@mantine/core";

interface EnhancedLoadingProps {
  title?: string;
  description?: string;
  size?: "sm" | "md" | "lg";
}

export function EnhancedLoading({
  title = "正在加载数据",
  description = "请稍候，正在获取数据...",
  size = "md",
}: EnhancedLoadingProps) {
  const loaderSize = size === "sm" ? "sm" : size === "md" ? "md" : "lg";
  const py = size === "sm" ? "xl" : size === "md" ? 48 : 60;

  return (
    <Center py={py}>
      <Stack align="center" gap="md">
        <Loader size={loaderSize} />
        <Stack align="center" gap={4}>
          <Text size="sm" fw={500}>
            {title}
          </Text>
          <Text size="xs" c="dimmed">
            {description}
          </Text>
        </Stack>
      </Stack>
    </Center>
  );
}

export function SimpleLoading({ text = "加载中..." }: { text?: string }) {
  return (
    <Group gap="xs" display="inline-flex">
      <Loader size="xs" />
      <Text size="sm">{text}</Text>
    </Group>
  );
}

export function FullScreenLoading({
  title = "加载中",
  description = "正在为您准备页面...",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <Center h="100vh" w="100%">
      <Stack align="center" gap="lg">
        <Loader size="lg" />
        <Stack align="center" gap={4}>
          <Text size="lg" fw={600}>
            {title}
          </Text>
          <Text size="sm" c="dimmed">
            {description}
          </Text>
        </Stack>
      </Stack>
    </Center>
  );
}
