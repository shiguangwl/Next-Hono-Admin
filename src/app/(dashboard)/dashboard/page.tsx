"use client";

import { Paper, Text, Title } from "@mantine/core";

import { PageContainer } from "@/components/ui/page-header";
import { useAuth } from "@/hooks/use-auth";

export default function DashboardPage() {
  const { admin } = useAuth();

  return (
    <PageContainer>
      <Paper withBorder p="lg" radius="md">
        <Title order={3}>
          欢迎回来，{admin?.nickname || admin?.username}！
        </Title>
        <Text c="dimmed" mt="xs">
          这是您的后台管理系统控制台
        </Text>
      </Paper>
    </PageContainer>
  );
}
