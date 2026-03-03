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
import { AlertTriangle, Shield } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { type FormEvent, useState } from 'react'

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
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<{
    title: string
    description: string
  } | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{
    username?: string
    password?: string
  }>({})

  const validateForm = (): boolean => {
    const errors: { username?: string; password?: string } = {}
    if (!username.trim()) errors.username = '请输入用户名'
    if (!password) errors.password = '请输入密码'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!validateForm()) return

    try {
      await login(username, password)
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
              <Shield size={28} />
            </ThemeIcon>
            <Title order={2} fw={800} mt="sm">
              后台管理系统
            </Title>
            <Text size="sm" c="dimmed">
              请输入您的管理员凭据以继续
            </Text>
          </Stack>
        </Center>

        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            {error && (
              <Alert
                icon={<AlertTriangle size={18} />}
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
              value={username}
              onChange={(e) => setUsername(e.currentTarget.value)}
              error={fieldErrors.username}
            />

            <PasswordInput
              label="密码"
              placeholder="请输入密码"
              size="md"
              required
              autoComplete="current-password"
              disabled={loading}
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              error={fieldErrors.password}
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
