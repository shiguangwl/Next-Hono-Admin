'use client'

import { Center, Loader, Stack, Text } from '@mantine/core'

export function FullScreenLoading({
  title = '验证中',
  description = '正在为您准备安全的环境...',
}: {
  title?: string
  description?: string
}) {
  return (
    <Center h="100vh" w="100%" bg="var(--mantine-color-body)">
      <Stack align="center" gap="xl">
        <Loader size={50} variant="bars" />
        <Stack align="center" gap={8}>
          <Text
            size="xl"
            fw={800}
            variant="gradient"
            gradient={{ from: 'indigo.6', to: 'violet.6' }}
            style={{ letterSpacing: '-0.02em' }}
          >
            {title}
          </Text>
          <Text size="sm" c="dimmed" fw={500}>
            {description}
          </Text>
        </Stack>
      </Stack>
    </Center>
  )
}
