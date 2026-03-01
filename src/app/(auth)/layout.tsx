"use client";

import { Box, Center, Stack, Text, Title } from "@mantine/core";
import { Zap } from "lucide-react";
import type { ReactNode } from "react";

import { GuestGuard } from "@/components/auth-guard";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <GuestGuard redirectTo="/dashboard">
      <Box style={{ display: "flex", minHeight: "100vh" }}>
        <Center
          visibleFrom="lg"
          style={{
            flex: "0 0 55%",
            backgroundImage:
              "linear-gradient(135deg, var(--mantine-color-blue-7), var(--mantine-color-blue-9))",
          }}
        >
          <Stack align="center" gap="lg" maw={400}>
            <Center
              w={80}
              h={80}
              style={{
                borderRadius: "var(--mantine-radius-xl)",
                backgroundColor: "rgba(255, 255, 255, 0.2)",
              }}
            >
              <Zap size={40} color="white" />
            </Center>
            <Title order={1} c="white" ta="center">
              欢迎回来
            </Title>
            <Text size="lg" c="white" opacity={0.8} ta="center">
              登录以访问您的工作空间
            </Text>
          </Stack>
        </Center>

        <Center flex={1} p="xl">
          {children}
        </Center>
      </Box>
    </GuestGuard>
  );
}
