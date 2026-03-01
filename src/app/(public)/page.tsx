'use client'

import {
  Anchor,
  Button,
  Card,
  Container,
  Group,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core'
import { ArrowRight, Github, Layout, Monitor, Rocket, ShieldCheck, Zap } from 'lucide-react'
import Link from 'next/link'

const FEATURES = [
  {
    icon: Zap,
    color: 'yellow',
    title: '极速开发体验',
    desc: '基于 Next.js 16 和 Hono 的全栈架构，提供热更新和强类型支持。',
  },
  {
    icon: ShieldCheck,
    color: 'green',
    title: '权限管理系统',
    desc: '内置完整的 RBAC 架构，支持角色、菜单、按钮级别的权限控制。',
  },
  {
    icon: Monitor,
    color: 'blue',
    title: '响应式设计',
    desc: '完美适配移动端和桌面端，提供流畅的跨设备体验。',
  },
  {
    icon: Layout,
    color: 'violet',
    title: '现代化组件库',
    desc: '结合 Mantine UI 组件库，打造精致的界面和极佳的视觉效果。',
  },
] as const

export default function HomePage() {
  return (
    <Stack gap={0} mih="100vh">
      <Group
        component="header"
        px="lg"
        py="sm"
        style={{
          borderBottom: '1px solid var(--mantine-color-default-border)',
        }}
      >
        <Group gap="xs">
          <ThemeIcon variant="gradient" gradient={{ from: 'violet', to: 'indigo' }} radius="md">
            <Rocket size={18} />
          </ThemeIcon>
          <Text fw={700} size="lg">
            NextHonoAdmin
          </Text>
        </Group>
        <Group gap="sm">
          <Button component={Link} href="/login" variant="default">
            登录
          </Button>
          <Button
            component={Link}
            href="/dashboard"
            variant="gradient"
            gradient={{ from: 'violet', to: 'indigo' }}
          >
            控制台
          </Button>
        </Group>
      </Group>

      <Container size="lg" py={80} flex={1}>
        <Stack align="center" gap={48}>
          <Stack align="center" gap="md" maw={640}>
            <Title order={1} ta="center" fz={{ base: 32, sm: 48 }}>
              打造现代化的{' '}
              <Text
                component="span"
                variant="gradient"
                gradient={{ from: 'violet', to: 'indigo' }}
                inherit
              >
                全栈应用开发脚手架
              </Text>
            </Title>
            <Text size="lg" c="dimmed" ta="center" maw={520}>
              基于 Next.js 16+、Hono、Drizzle ORM 和 Mantine 构建。内置完善的 RBAC
              权限管理系统，助你快速启动业务开发。
            </Text>
            <Group mt="sm">
              <Button
                component={Link}
                href="/dashboard"
                size="lg"
                rightSection={<ArrowRight size={18} />}
              >
                立刻开始
              </Button>
              <Button
                component="a"
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                size="lg"
                variant="default"
                leftSection={<Github size={18} />}
              >
                GitHub
              </Button>
            </Group>
          </Stack>

          <Stack gap="lg" w="100%">
            <Stack align="center" gap={4}>
              <Title order={2}>强大特性</Title>
              <Text c="dimmed">集成了现代化开发所需的所有工具</Text>
            </Stack>
            <SimpleGrid cols={{ base: 1, sm: 2 }}>
              {FEATURES.map((f) => (
                <Card key={f.title} withBorder padding="lg" radius="md">
                  <Group gap="md" align="flex-start">
                    <ThemeIcon size={40} radius="md" variant="light" color={f.color}>
                      <f.icon size={20} />
                    </ThemeIcon>
                    <Stack gap={4} flex={1}>
                      <Text fw={600}>{f.title}</Text>
                      <Text size="sm" c="dimmed">
                        {f.desc}
                      </Text>
                    </Stack>
                  </Group>
                </Card>
              ))}
            </SimpleGrid>
          </Stack>

          <Card withBorder padding="xl" radius="md" w="100%" ta="center">
            <Stack align="center" gap="md">
              <Title order={3}>准备好开启你的下一个项目了吗？</Title>
              <Text c="dimmed" maw={480}>
                NextHonoAdmin
                已经为你准备好了所有基础架构。专注于核心业务逻辑，而不必担心权限管理、数据库配置和
                API 设计。
              </Text>
              <Button component={Link} href="/dashboard" size="lg">
                克隆项目
              </Button>
            </Stack>
          </Card>
        </Stack>
      </Container>

      <Group
        component="footer"
        justify="space-between"
        py="md"
        wrap="wrap"
        style={{ borderTop: '1px solid var(--mantine-color-default-border)' }}
      >
        <Group gap="xs">
          <Rocket size={16} />
          <Text fw={600} size="sm">
            NextHonoAdmin
          </Text>
        </Group>
        <Group gap="lg">
          <Anchor size="sm" c="dimmed">
            使用协议
          </Anchor>
          <Anchor size="sm" c="dimmed">
            隐私政策
          </Anchor>
          <Anchor size="sm" c="dimmed">
            问题反馈
          </Anchor>
        </Group>
        <Text size="xs" c="dimmed">
          © 2026 NextHonoAdmin. All rights reserved.
        </Text>
      </Group>
    </Stack>
  )
}
