"use client";

import {
  ActionIcon,
  Avatar,
  Burger,
  Divider,
  Group,
  Menu,
  Text,
} from "@mantine/core";
import { Bell, Home, LogOut, Moon, Sun } from "lucide-react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";

interface AppHeaderProps {
  mobileOpened?: boolean;
  onBurgerClick?: () => void;
}

function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();
  return (
    <ActionIcon
      variant="subtle"
      size="lg"
      onClick={toggleTheme}
      aria-label="切换主题"
    >
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </ActionIcon>
  );
}

function UserDropdown() {
  const router = useRouter();
  const { admin, logout } = useAuth();

  const displayName = admin?.nickname || admin?.username || "Admin";
  const initials = displayName.charAt(0).toUpperCase();

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <Menu shadow="md" width={200} position="bottom-end">
      <Menu.Target>
        <ActionIcon variant="subtle" size="lg" radius="xl">
          <Avatar size="sm" color="blue" radius="xl">
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

        <Menu.Item
          leftSection={<Home size={16} />}
          onClick={() => router.push("/")}
        >
          返回首页
        </Menu.Item>

        <Divider my={4} />

        <Menu.Item
          color="red"
          leftSection={<LogOut size={16} />}
          onClick={handleLogout}
        >
          退出登录
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}

export function AppHeader({ mobileOpened, onBurgerClick }: AppHeaderProps) {
  return (
    <Group h="100%" px="md" justify="space-between">
      <Group>
        <Burger
          opened={mobileOpened}
          onClick={onBurgerClick}
          hiddenFrom="sm"
          size="sm"
        />
      </Group>

      <Group gap="xs">
        <ActionIcon variant="subtle" size="lg" aria-label="通知">
          <Bell size={20} />
        </ActionIcon>
        <ThemeToggle />
        <UserDropdown />
      </Group>
    </Group>
  );
}
