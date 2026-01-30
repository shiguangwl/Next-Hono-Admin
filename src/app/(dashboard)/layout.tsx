'use client'

/**
 * 后台布局
 * @description 后台管理系统主布局，包含侧边栏和顶部导航
 */

import { type ReactNode, useState } from 'react'
import { AuthGuard } from '@/components/auth-guard'
import { AppHeader } from '@/components/layout/app-header'
import { AppSidebar } from '@/components/layout/app-sidebar'

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <AuthGuard redirectTo="/login">
      <div className="flex h-screen overflow-hidden bg-background">
        {/* 侧边栏 */}
        <AppSidebar collapsed={collapsed} onCollapsedChange={setCollapsed} />

        {/* 主内容区 */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* 顶部导航 */}
          <AppHeader />

          {/* 页面内容 */}
          <main className="flex-1 overflow-auto bg-background p-6">{children}</main>
        </div>
      </div>
    </AuthGuard>
  )
}
