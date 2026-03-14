'use client'

import {
  Button,
  Center,
  Code,
  ColorSchemeScript,
  Container,
  Group,
  MantineProvider,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core'
import { IconAlertCircle, IconHome, IconRefresh } from '@tabler/icons-react'
import { useEffect } from 'react'

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  const isDev = process.env.NODE_ENV === 'development'

  useEffect(() => {
    console.error('Global Error:', error)
  }, [error])

  return (
    <html lang="zh-CN">
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body>
        <MantineProvider defaultColorScheme="auto">
          <Center
            mih="100vh"
            p="xl"
            bg="linear-gradient(to bottom, var(--mantine-color-dark-8), var(--mantine-color-dark-9))"
            pos="relative"
          >
            {/* Context Pattern */}
            <div
              style={{
                position: 'fixed',
                inset: 0,
                opacity: 0.03,
                backgroundImage:
                  'radial-gradient(circle at 1px 1px, var(--mantine-color-white) 1px, transparent 1px)',
                backgroundSize: '32px 32px',
                pointerEvents: 'none',
              }}
            />

            <Container size="xs" w="100%" pos="relative" style={{ zIndex: 1 }}>
              <Paper
                p={40}
                radius="lg"
                bg="rgba(24, 24, 27, 0.8)"
                style={{
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(63, 63, 70, 0.5)',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                }}
              >
                <Stack align="center" gap="lg">
                  <ThemeIcon size={64} radius="lg" color="red" variant="light">
                    <IconAlertCircle size={32} />
                  </ThemeIcon>

                  <Stack gap={8} align="center">
                    <Title order={3} c="gray.1">
                      系统发生严重错误
                    </Title>
                    <Text size="sm" c="dimmed" ta="center" lh={1.6}>
                      应用程序遇到了无法恢复的错误，请尝试刷新页面
                    </Text>
                  </Stack>

                  {isDev && (
                    <Paper
                      w="100%"
                      p="md"
                      radius="md"
                      style={{
                        backgroundColor: 'rgba(244, 63, 94, 0.1)',
                        border: '1px solid rgba(244, 63, 94, 0.2)',
                      }}
                    >
                      <Code
                        block
                        bg="transparent"
                        c="red.3"
                        style={{ wordBreak: 'break-all', padding: 0 }}
                      >
                        {error.name}: {error.message}
                      </Code>
                      {error.digest && (
                        <Text size="xs" c="red.4" mt="xs" opacity={0.8}>
                          Digest: {error.digest}
                        </Text>
                      )}
                    </Paper>
                  )}

                  <Group justify="center" gap="md" mt="sm">
                    <Button
                      variant="white"
                      color="dark"
                      size="md"
                      radius="md"
                      leftSection={<IconRefresh size={18} />}
                      onClick={reset}
                    >
                      重试
                    </Button>
                    <Button
                      variant="outline"
                      color="gray"
                      size="md"
                      radius="md"
                      leftSection={<IconHome size={18} />}
                      onClick={() => {
                        window.location.href = '/'
                      }}
                    >
                      返回首页
                    </Button>
                  </Group>

                  <Text size="xs" c="dimmed" mt="xl">
                    如果问题持续存在，请联系技术支持
                  </Text>
                </Stack>
              </Paper>
            </Container>
          </Center>
        </MantineProvider>
      </body>
    </html>
  )
}
