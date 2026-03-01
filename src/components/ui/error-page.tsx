'use client'

import { Button, Center, Code, Group, Paper, Stack, Text, ThemeIcon, Title } from '@mantine/core'
import { AlertCircle, Home, RefreshCw, Server, Wifi } from 'lucide-react'
import { useRouter } from 'next/navigation'

export type ErrorType = 'server' | 'network' | 'notFound' | 'unknown'

const ERROR_CONFIGS: Record<
  ErrorType,
  { icon: React.ReactNode; title: string; description: string; color: string }
> = {
  server: {
    icon: <Server size={24} />,
    title: '服务暂时不可用',
    description: '服务器正在维护或遇到了一些问题，请稍后再试',
    color: 'red',
  },
  network: {
    icon: <Wifi size={24} />,
    title: '网络连接失败',
    description: '无法连接到服务器，请检查您的网络连接',
    color: 'orange',
  },
  notFound: {
    icon: <AlertCircle size={24} />,
    title: '页面未找到',
    description: '您访问的页面不存在或已被移除',
    color: 'blue',
  },
  unknown: {
    icon: <AlertCircle size={24} />,
    title: '发生了错误',
    description: '抱歉，出现了一些意外情况',
    color: 'gray',
  },
}

export interface ErrorPageProps {
  type?: ErrorType
  title?: string
  description?: string
  error?: Error
  onRetry?: () => void
  showHomeButton?: boolean
}

export function ErrorPage({
  type = 'unknown',
  title,
  description,
  error,
  onRetry,
  showHomeButton = true,
}: ErrorPageProps) {
  const router = useRouter()
  const config = ERROR_CONFIGS[type]
  const isDev = process.env.NODE_ENV === 'development'

  return (
    <Center mih="100vh" p="xl">
      <Paper shadow="md" radius="lg" p="xl" maw={420} w="100%">
        <Stack align="center" gap="lg">
          <ThemeIcon size={56} radius="xl" variant="light" color={config.color}>
            {config.icon}
          </ThemeIcon>

          <Stack align="center" gap={4}>
            <Title order={3} ta="center">
              {title || config.title}
            </Title>
            <Text size="sm" c="dimmed" ta="center">
              {description || config.description}
            </Text>
          </Stack>

          {isDev && error && (
            <Code block c="red" w="100%">
              {error.name}: {error.message}
            </Code>
          )}

          <Group>
            {onRetry && (
              <Button leftSection={<RefreshCw size={16} />} onClick={onRetry}>
                重试
              </Button>
            )}
            {showHomeButton && (
              <Button
                variant="default"
                leftSection={<Home size={16} />}
                onClick={() => router.push('/')}
              >
                返回首页
              </Button>
            )}
          </Group>

          <Text size="xs" c="dimmed">
            如果问题持续存在，请联系技术支持
          </Text>
        </Stack>
      </Paper>
    </Center>
  )
}
