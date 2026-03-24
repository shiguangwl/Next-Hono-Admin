'use client'

import { ActionIcon, Avatar, Burger, Divider, Group, Menu, Text, ThemeIcon } from '@mantine/core'
import { IconBell, IconBolt, IconHome, IconLogout, IconMoon, IconSun } from '@tabler/icons-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { useAuth } from '@/hooks/use-auth'
import { useTheme } from '@/hooks/use-theme'

interface AppHeaderProps {
  mobileOpened?: boolean
  onBurgerClick?: () => void
}

function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme()
  return (
    <ActionIcon
      variant="subtle"
      size="lg"
      radius="md"
      color={isDark ? 'yellow' : 'gray'}
      onClick={toggleTheme}
      aria-label="切换主题"
    >
      {isDark ? <IconSun size={20} stroke={1.5} /> : <IconMoon size={20} stroke={1.5} />}
    </ActionIcon>
  )
}

function UserDropdown() {
  const router = useRouter()
  const { admin, logout } = useAuth()

  const displayName = admin?.nickname || admin?.username || 'Admin'
  const initials = displayName.charAt(0).toUpperCase()

  const handleLogout = async () => {
    await logout()
    router.replace('/login')
  }

  return (
    <Menu shadow="md" width={200} position="bottom-end">
      <Menu.Target>
        <ActionIcon variant="subtle" size="lg" radius="xl">
          <Avatar
            size="sm"
            variant="gradient"
            gradient={{ from: 'indigo', to: 'violet' }}
            radius="xl"
          >
            {initials}
          </Avatar>
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>
          <Text size="sm" fw={500}>
            {displayName}
          </Text>
          <Text size="xs" c="dimmed">
            {admin?.username}
          </Text>
        </Menu.Label>

        <Divider my={4} />

        <Menu.Item leftSection={<IconHome size={16} />} onClick={() => router.push('/')}>
          返回首页
        </Menu.Item>

        <Divider my={4} />

        <Menu.Item color="red" leftSection={<IconLogout size={16} />} onClick={handleLogout}>
          退出登录
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  )
}

export function AppHeader({ mobileOpened, onBurgerClick }: AppHeaderProps) {
  return (
    <Group h="100%" px="md" justify="space-between" bg="var(--app-header-bg)">
      <Group gap="xs">
        <Burger opened={mobileOpened} onClick={onBurgerClick} hiddenFrom="sm" size="sm" />

        <Link
          href="/dashboard"
          style={{ textDecoration: 'none', color: 'inherit', display: 'flex' }}
        >
          <Group gap="xs" visibleFrom="sm" mr="lg" style={{ cursor: 'pointer' }}>
            <ThemeIcon
              size={32}
              radius="md"
              variant="gradient"
              gradient={{ from: 'indigo', to: 'violet' }}
            >
              <IconBolt size={18} fill="white" />
            </ThemeIcon>
            <Text fw={800} size="lg" style={{ letterSpacing: '-0.02em' }}>
              Admin
            </Text>
          </Group>
        </Link>
      </Group>

      <Group gap="xs">
        <ActionIcon variant="subtle" size="lg" radius="md" color="gray" aria-label="通知">
          <IconBell size={20} stroke={1.5} />
        </ActionIcon>

        <Divider orientation="vertical" h={20} my="auto" opacity={0.5} />

        <ThemeToggle />
        <UserDropdown />
      </Group>
    </Group>
  )
}
