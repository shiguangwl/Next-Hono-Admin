'use client'

import {
  Alert,
  Box,
  Button,
  Center,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { IconAlertTriangle, IconShield } from '@tabler/icons-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { useAuth } from '@/hooks/use-auth'

const ERROR_MESSAGES: Record<string, { title: string; description: string }> = {
  用户名或密码错误: {
    title: '登录失败',
    description: '用户名或密码不正确，请检查后重试',
  },
  账号已禁用: {
    title: '账号已禁用',
    description: '您的账号已被管理员禁用，请联系管理员处理',
  },
}

function getErrorInfo(message: string) {
  return (
    ERROR_MESSAGES[message] || {
      title: '登录失败',
      description: message || '发生未知错误，请稍后重试',
    }
  )
}

export default function LoginPage() {
  const router = useRouter()
  const { login, loading } = useAuth()
  const [error, setError] = useState<{
    title: string
    description: string
  } | null>(null)

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: { username: '', password: '' },
    validate: {
      username: (v) => (!v.trim() ? '请输入用户名' : null),
      password: (v) => (!v ? '请输入密码' : null),
    },
  })

  const handleSubmit = async (values: typeof form.values) => {
    setError(null)
    try {
      await login(values.username, values.password)
      router.replace('/dashboard')
    } catch (err) {
      const message = err instanceof Error ? err.message : '登录失败'
      setError(getErrorInfo(message))
    }
  }

  return (
    <Box w="100%" maw={420} mx="auto">
      <Paper radius="xl" p={40} withBorder shadow="xl" style={{ backdropFilter: 'blur(10px)' }}>
        <Center mb="xl">
          <Stack align="center" gap="xs">
            <ThemeIcon
              size={56}
              radius="lg"
              variant="gradient"
              gradient={{ from: 'indigo', to: 'violet' }}
            >
              <IconShield size={28} />
            </ThemeIcon>
            <Title order={2} fw={800} mt="sm">
              后台管理系统
            </Title>
            <Text size="sm" c="dimmed">
              请输入您的管理员凭据以继续
            </Text>
          </Stack>
        </Center>

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            {error && (
              <Alert
                icon={<IconAlertTriangle size={18} />}
                color="red"
                variant="light"
                radius="md"
                className="animate-shake"
                title={error.title}
                withCloseButton
                onClose={() => setError(null)}
              >
                {error.description}
              </Alert>
            )}

            <TextInput
              label="用户名"
              placeholder="请输入用户名"
              size="md"
              required
              autoComplete="username"
              disabled={loading}
              key={form.key('username')}
              {...form.getInputProps('username')}
            />

            <PasswordInput
              label="密码"
              placeholder="请输入密码"
              size="md"
              required
              autoComplete="current-password"
              disabled={loading}
              key={form.key('password')}
              {...form.getInputProps('password')}
            />

            <Button
              type="submit"
              fullWidth
              loading={loading}
              mt="lg"
              size="md"
              variant="gradient"
              gradient={{ from: 'indigo', to: 'violet' }}
            >
              登录
            </Button>
          </Stack>
        </form>

        <Text size="xs" c="dimmed" ta="center" mt="xl">
          © {new Date().getFullYear()} NextHonoAdmin. All rights reserved.
        </Text>
      </Paper>
    </Box>
  )
}
