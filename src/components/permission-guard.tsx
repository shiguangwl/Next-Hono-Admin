'use client'

import { Center, Stack, Text, ThemeIcon, Title } from '@mantine/core'
import { Lock } from 'lucide-react'
import type { ReactNode } from 'react'

import { usePermission } from '@/hooks/use-permission'

type PermissionGuardBase = {
  children: ReactNode
  fallback?: ReactNode
}

type PermissionGuardProps = PermissionGuardBase &
  (
    | { permission: string; anyPermissions?: never; allPermissions?: never }
    | { permission?: never; anyPermissions: string[]; allPermissions?: never }
    | { permission?: never; anyPermissions?: never; allPermissions: string[] }
  )

export function PermissionGuard({
  children,
  permission,
  anyPermissions,
  allPermissions,
  fallback = null,
}: PermissionGuardProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermission()

  if (permission && !hasPermission(permission)) {
    return <>{fallback}</>
  }

  if (anyPermissions?.length && !hasAnyPermission(anyPermissions)) {
    return <>{fallback}</>
  }

  if (allPermissions?.length && !hasAllPermissions(allPermissions)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

export function NoPermission({ message = '暂无权限访问' }: { message?: string }) {
  return (
    <Center mih={200} p="xl">
      <Stack align="center" gap="md">
        <ThemeIcon size={56} radius="xl" variant="light" color="yellow">
          <Lock size={24} />
        </ThemeIcon>
        <Stack align="center" gap={4}>
          <Title order={5}>权限不足</Title>
          <Text size="sm" c="dimmed">
            {message}
          </Text>
        </Stack>
      </Stack>
    </Center>
  )
}
