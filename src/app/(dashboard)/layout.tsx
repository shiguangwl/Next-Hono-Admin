'use client'

import { AppShell } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { type ReactNode, useState } from 'react'

import { AuthGuard } from '@/components/auth-guard'
import { AppHeader } from '@/components/layout/app-header'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { RouteProgress } from '@/components/layout/route-progress'

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure()

  return (
    <AuthGuard redirectTo="/login">
      <AppShell
        header={{ height: 60 }}
        navbar={{
          width: collapsed ? 72 : 260,
          breakpoint: 'sm',
          collapsed: { mobile: !mobileOpened },
        }}
        padding="md"
        transitionDuration={200}
      >
        <AppShell.Header>
          <AppHeader mobileOpened={mobileOpened} onBurgerClick={toggleMobile} />
        </AppShell.Header>

        <RouteProgress />

        <AppShell.Navbar>
          <AppSidebar collapsed={collapsed} onCollapsedChange={setCollapsed} />
        </AppShell.Navbar>

        <AppShell.Main>{children}</AppShell.Main>
      </AppShell>
    </AuthGuard>
  )
}
