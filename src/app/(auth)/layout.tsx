'use client'

import { Box, Center, Flex, Stack, Text, ThemeIcon, Title } from '@mantine/core'
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
          bg="linear-gradient(135deg, var(--mantine-color-indigo-7), var(--mantine-color-violet-9))"
          pos="relative"
          style={{ overflow: 'hidden' }}
        >
          {/* 装饰性网格 */}
          <Box className="auth-decoration" />

          {/* 装饰性光圈 */}
          <Box
            pos="absolute"
            top="-15%"
            right="-10%"
            w={350}
            h={350}
            className="animate-pulse-glow"
            style={{
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(167,139,250,0.25), transparent 70%)',
              pointerEvents: 'none',
            }}
          />
          <Box
            pos="absolute"
            bottom="-20%"
            left="-10%"
            w={400}
            h={400}
            className="animate-pulse-glow"
            style={{
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(99,102,241,0.2), transparent 70%)',
              pointerEvents: 'none',
              animationDelay: '1.5s',
            }}
          />

          <Stack align="center" gap="lg" maw={400} style={{ position: 'relative', zIndex: 1 }}>
            <ThemeIcon
              size={80}
              radius="xl"
              bg="rgba(255, 255, 255, 0.15)"
              color="white"
              variant="transparent"
              style={{
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
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
