'use client'

import { Button, Center, Stack, Text, ThemeIcon, Title } from '@mantine/core'
import { Clock, RefreshCw, Server, WifiOff } from 'lucide-react'

export type ServiceErrorType = 'network' | 'server' | 'timeout'

const ERROR_CONFIGS: Record<
  ServiceErrorType,
  { icon: React.ReactNode; title: string; description: string; color: string }
> = {
  network: {
    icon: <WifiOff size={24} />,
    title: '网络连接失败',
    description: '无法连接到服务器，请检查您的网络连接后重试',
    color: 'orange',
  },
  server: {
    icon: <Server size={24} />,
    title: '服务暂时不可用',
    description: '服务器正在维护或遇到问题，请稍后重试',
    color: 'red',
  },
  timeout: {
    icon: <Clock size={24} />,
    title: '请求超时',
    description: '服务响应时间过长，请稍后重试',
    color: 'blue',
  },
}

export interface ServiceUnavailableProps {
  type?: ServiceErrorType
  onRetry?: () => void
  isRetrying?: boolean
  title?: string
  description?: string
}

export function ServiceUnavailable({
  type = 'server',
  onRetry,
  isRetrying = false,
  title,
  description,
}: ServiceUnavailableProps) {
  const config = ERROR_CONFIGS[type]

  return (
    <Center py={64}>
      <Stack align="center" gap="lg" maw={400}>
        <ThemeIcon size={56} radius="xl" variant="light" color={config.color}>
          {config.icon}
        </ThemeIcon>

        <Stack align="center" gap={4}>
          <Title order={4}>{title || config.title}</Title>
          <Text size="sm" c="dimmed" ta="center">
            {description || config.description}
          </Text>
        </Stack>

        {onRetry && (
          <Button leftSection={<RefreshCw size={16} />} onClick={onRetry} loading={isRetrying}>
            {isRetrying ? '正在重试...' : '点击重试'}
          </Button>
        )}

        <Text size="xs" c="dimmed">
          系统会每 10 秒自动尝试重新连接
        </Text>
      </Stack>
    </Center>
  )
}
