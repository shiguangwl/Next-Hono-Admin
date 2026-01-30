'use client'

/**
 * 顶部导航栏组件
 * @description 后台管理系统顶部导航栏，显示用户信息和操作
 */

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'

interface HeaderProps {
  /** 自定义类名 */
  className?: string
}

/**
 * 用户下拉菜单
 */
function UserDropdown() {
  const router = useRouter()
  const { admin, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // 点击外部关闭下拉菜单
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    router.replace('/login')
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        className="flex items-center gap-2 px-3 py-2"
        onClick={() => setOpen(!open)}
      >
        {/* 头像 */}
        <div className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium">
          {admin?.nickname?.charAt(0) || admin?.username?.charAt(0) || 'A'}
        </div>
        {/* 用户名 */}
        <span className="hidden text-sm font-medium sm:block">
          {admin?.nickname || admin?.username}
        </span>
        {/* 下拉箭头 */}
        <svg
          className={cn('h-4 w-4 transition-transform', open && 'rotate-180')}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <title>用户菜单</title>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* 下拉菜单 */}
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-48">
          <div className="px-4 py-2">
            <p className="text-sm font-medium">{admin?.nickname || admin?.username}</p>
            <p className="text-xs">{admin?.username}</p>
          </div>
          <Link
            href="/"
            className="flex w-full items-center gap-2 px-4 py-2 text-sm transition-colors"
            onClick={() => setOpen(false)}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <title>返回首页</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            返回首页
          </Link>
          <button
            type="button"
            className="flex w-full items-center gap-2 px-4 py-2 text-sm transition-colors"
            onClick={handleLogout}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <title>退出登录</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            退出登录
          </button>
        </div>
      )}
    </div>
  )
}

/**
 * 顶部导航栏组件
 */
export function Header({ className }: HeaderProps) {
  return (
    <header className={cn('flex h-16 items-center justify-between px-4', className)}>
      {/* 左侧区域 */}
      <div className="flex items-center gap-4">{/* 面包屑或其他内容可以放这里 */}</div>

      {/* 右侧区域 */}
      <div className="flex items-center gap-2">
        {/* 通知图标 */}
        <button type="button" className="relative p-2">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <title>通知</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
        </button>

        {/* 用户下拉菜单 */}
        <UserDropdown />
      </div>
    </header>
  )
}
