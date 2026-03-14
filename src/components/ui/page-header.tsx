'use client'

import { Anchor, Group, Breadcrumbs as MantineBreadcrumbs, Stack, Text, Title } from '@mantine/core'
import { IconHome } from '@tabler/icons-react'
import Link from 'next/link'
import type { ReactNode } from 'react'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface PageHeaderProps {
  title: string
  description?: string
  breadcrumbs?: BreadcrumbItem[]
  actions?: ReactNode
}

export function PageHeader({ title, description, breadcrumbs = [], actions }: PageHeaderProps) {
  return (
    <Stack gap="sm">
      {breadcrumbs.length > 0 && (
        <MantineBreadcrumbs>
          <Anchor component={Link} href="/dashboard" c="dimmed" size="sm">
            <IconHome size={14} />
          </Anchor>
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1
            if (item.href && !isLast) {
              return (
                <Anchor component={Link} href={item.href} key={item.label} size="sm" c="dimmed">
                  {item.label}
                </Anchor>
              )
            }
            return (
              <Text size="sm" key={item.label}>
                {item.label}
              </Text>
            )
          })}
        </MantineBreadcrumbs>
      )}

      <Group justify="space-between" align="flex-start">
        <div>
          <Title order={3}>{title}</Title>
          {description && (
            <Text size="sm" c="dimmed" mt={4}>
              {description}
            </Text>
          )}
        </div>
        {actions && <Group gap="xs">{actions}</Group>}
      </Group>
    </Stack>
  )
}

export function PageContainer({ children }: { children: ReactNode }) {
  return <Stack gap="lg">{children}</Stack>
}
