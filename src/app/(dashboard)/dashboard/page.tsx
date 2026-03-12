"use client";

import { PageContainer } from "@/components/ui/page-header";
import { useAuth } from "@/hooks/use-auth";
import { Box, Paper, Stack, Text, Title } from "@mantine/core";

export default function DashboardPage() {
  const { admin } = useAuth();
  const displayName = admin?.nickname || admin?.username || "管理员";

  return (
    <PageContainer>
      <Stack gap="xl">
        <Paper
          className="welcome-banner"
          p={40}
          radius="lg"
          bg="linear-gradient(135deg, var(--mantine-color-indigo-6), var(--mantine-color-violet-7))"
          style={{
            minHeight: "300px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* 装饰性背景元素 */}
          <Box
            style={{
              position: "absolute",
              top: "-10%",
              right: "-5%",
              width: "400px",
              height: "400px",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(255, 255, 255, 0.15), transparent 70%)",
              pointerEvents: "none",
              zIndex: 0,
            }}
          />
          <Box
            style={{
              position: "absolute",
              bottom: "-20%",
              left: "5%",
              width: "300px",
              height: "300px",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(255, 255, 255, 0.1), transparent 70%)",
              pointerEvents: "none",
              zIndex: 0,
            }}
          />

          <Stack gap="md" style={{ position: "relative", zIndex: 1 }}>
            <Text size="lg" c="white" opacity={0.9} fw={500} lts="0.05em">
              {getGreeting()}
            </Text>
            <Title
              order={1}
              c="white"
              fw={800}
              size={42}
              style={{ letterSpacing: "-0.02em" }}
            >
              欢迎回来，{displayName} 👋
            </Title>
            <Box maw={600}>
              <Text size="md" c="white" opacity={0.8} lh={1.6}>
                您已成功登录管理系统。请通过左侧导航菜单访问您拥有权限的功能模块。
                如果您在使用过程中遇到任何问题，请联系系统管理员。
              </Text>
            </Box>
          </Stack>
        </Paper>
      </Stack>
    </PageContainer>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return "🌙 夜深了";
  if (hour < 12) return "🌅 上午好";
  if (hour < 14) return "☀️ 中午好";
  if (hour < 18) return "🌤️ 下午好";
  return "🌆 晚上好";
}
