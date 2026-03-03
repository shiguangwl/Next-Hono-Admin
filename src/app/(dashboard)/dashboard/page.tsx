'use client'

import { Group, Paper, SimpleGrid, Stack, Text, ThemeIcon, Title } from '@mantine/core'
import { Activity, Settings, ShieldCheck, Users } from 'lucide-react'
import type { ReactNode } from 'react'

import { PageContainer } from '@/components/ui/page-header'
import { useAuth } from '@/hooks/use-auth'

interface StatCardProps {
  icon: ReactNode
  label: string
  value: string
  gradient: { from: string; to: string }
}

function StatCard({ icon, label, value, gradient }: StatCardProps) {
  return (
    <Paper className="stat-card" withBorder p="lg" radius="lg" style={{ cursor: 'default' }}>
      <Group justify="space-between" align="flex-start">
        <Stack gap={4}>
          <Text size="xs" c="dimmed" tt="uppercase" fw={700} lts="0.04em">
            {label}
          </Text>
          <Title order={2} fw={800}>
            {value}
          </Title>
        </Stack>
        <ThemeIcon
          size={48}
          radius="lg"
          variant="gradient"
          gradient={gradient}
          style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
        >
          {icon}
        </ThemeIcon>
      </Group>
    </Paper>
  )
}

const STAT_ITEMS: StatCardProps[] = [
  {
    icon: <Users size={24} />,
    label: '管理员',
    value: '—',
    gradient: { from: 'indigo', to: 'violet' },
  },
  {
    icon: <ShieldCheck size={24} />,
    label: '角色',
    value: '—',
    gradient: { from: 'teal', to: 'cyan' },
  },
  {
    icon: <Settings size={24} />,
    label: '菜单',
    value: '—',
    gradient: { from: 'orange', to: 'pink' },
  },
  {
    icon: <Activity size={24} />,
    label: '今日操作',
    value: '—',
    gradient: { from: 'grape', to: 'indigo' },
  },
]

export default function DashboardPage() {
  const { admin } = useAuth()
  const displayName = admin?.nickname || admin?.username || '管理员'

  const greeting = getGreeting()

  return (
    <PageContainer>
      <Paper
        className="welcome-banner"
        p="xl"
        radius="lg"
        bg="linear-gradient(135deg, var(--mantine-color-indigo-6), var(--mantine-color-violet-7))"
      >
        <Stack gap="xs" style={{ position: 'relative', zIndex: 1 }}>
          <Text size="sm" c="white" opacity={0.8} fw={500}>
            {greeting}
          </Text>
          <Title order={2} c="white" fw={800}>
            欢迎回来，{displayName} 👋
          </Title>
          <Text size="sm" c="white" opacity={0.7} maw={480}>
            这里是您的后台管理系统控制台，您可以在这里管理用户、角色、权限等。
          </Text>
        </Stack>
      </Paper>

      <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }} className="animate-fade-in">
        {STAT_ITEMS.map((item) => (
          <StatCard key={item.label} {...item} />
        ))}
      </SimpleGrid>
    </PageContainer>
  )
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 6) return '🌙 夜深了'
  if (hour < 12) return '🌅 上午好'
  if (hour < 14) return '☀️ 中午好'
  if (hour < 18) return '🌤️ 下午好'
  return '🌆 晚上好'
}
