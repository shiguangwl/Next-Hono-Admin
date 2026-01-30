'use client'

/**
 * 顶部导航栏组件
 * @description 后台管理系统顶部导航栏，使用 HeroUI 组件
 */

import { ArrowRightFromSquare, Bell, House, Moon, Sun } from '@gravity-ui/icons'
import { Avatar, Button, Dropdown, Header, Label, Separator } from '@heroui/react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { useTheme } from '@/hooks/use-theme'
import { cn } from '@/lib/utils'

interface AppHeaderProps {
  className?: string
}

/**
 * 用户下拉菜单
 */
function UserDropdown() {
  const router = useRouter()
  const { admin, logout } = useAuth()

  const displayName = admin?.nickname || admin?.username || 'Admin'
  const initials = displayName.charAt(0).toUpperCase()

  const handleAction = (key: React.Key) => {
    if (key === 'home') {
      router.push('/')
    } else if (key === 'logout') {
      logout()
      router.replace('/login')
    }
  }

  return (
    <Dropdown>
      <Button variant="ghost" className="gap-2 px-2">
        <Avatar size="sm">
          <Avatar.Fallback>{initials}</Avatar.Fallback>
        </Avatar>
        <span className="hidden text-sm font-medium sm:block">{displayName}</span>
      </Button>
      <Dropdown.Popover className="min-w-[200px]">
        <Dropdown.Menu onAction={handleAction}>
          <Dropdown.Section>
            <Header>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{displayName}</span>
                <span className="text-xs text-muted">{admin?.username}</span>
              </div>
            </Header>
            <Dropdown.Item id="home" textValue="返回首页">
              <House className="size-4" />
              <Label>返回首页</Label>
            </Dropdown.Item>
          </Dropdown.Section>
          <Separator />
          <Dropdown.Section>
            <Dropdown.Item id="logout" textValue="退出登录" variant="danger">
              <ArrowRightFromSquare className="size-4" />
              <Label>退出登录</Label>
            </Dropdown.Item>
          </Dropdown.Section>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  )
}

/**
 * 主题切换按钮
 */
function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <Button variant="ghost" isIconOnly onPress={toggleTheme} aria-label="切换主题">
      {isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </Button>
  )
}

/**
 * 顶部导航栏组件
 */
export function AppHeader({ className }: AppHeaderProps) {
  return (
    <header
      className={cn(
        'flex h-16 items-center justify-between border-b border-separator bg-surface px-4',
        className
      )}
    >
      {/* 左侧区域 - 面包屑或其他内容 */}
      <div className="flex items-center gap-4" />

      {/* 右侧区域 */}
      <div className="flex items-center gap-1">
        {/* 通知按钮 */}
        <Button variant="ghost" isIconOnly aria-label="通知">
          <Bell className="size-5" />
        </Button>

        {/* 主题切换 */}
        <ThemeToggle />

        {/* 用户下拉菜单 */}
        <UserDropdown />
      </div>
    </header>
  )
}
