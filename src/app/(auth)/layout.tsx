'use client'

import { Center, Flex, Stack, Text, ThemeIcon, Title } from '@mantine/core'
import { Zap } from 'lucide-react'
import type { ReactNode } from 'react'

import { GuestGuard } from '@/components/auth-guard'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <GuestGuard redirectTo="/dashboard">
      <Flex mih="100vh">
        <Center
          visibleFrom="lg"
          flex="0 0 55%"
          bg="linear-gradient(135deg, var(--mantine-color-blue-7), var(--mantine-color-blue-9))"
        >
          <Stack align="center" gap="lg" maw={400}>
            <ThemeIcon
              size={80}
              radius="xl"
              bg="rgba(255, 255, 255, 0.2)"
              color="white"
              variant="transparent"
            >
              <Zap size={40} />
            </ThemeIcon>
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
      </Flex>
    </GuestGuard>
  )
}
