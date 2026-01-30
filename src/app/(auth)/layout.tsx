'use client'

/**
 * 认证布局
 * @description 登录等认证页面的布局，已登录用户会被重定向到仪表盘首页
 */

import type { ReactNode } from 'react'
import { GuestGuard } from '@/components/auth-guard'

interface AuthLayoutProps {
  children: ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <GuestGuard redirectTo="/dashboard">
      <div className="relative flex min-h-screen">
        {/* 左侧品牌区域 - 仅在大屏显示 */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 items-center justify-center bg-linear-to-br from-accent/90 via-accent to-accent/80 p-12">
          <div className="max-w-lg text-center text-white">
            <div className="mb-8 flex justify-center">
              <div className="flex size-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                <svg
                  className="size-12 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <title>品牌 Logo</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                  />
                </svg>
              </div>
            </div>
            <h1 className="mb-4 text-4xl font-bold tracking-tight">欢迎回来</h1>
            <p className="text-lg text-white/80">登录以访问您的工作空间</p>
          </div>
        </div>

        {/* 右侧登录区域 */}
        <div className="flex w-full lg:w-1/2 xl:w-2/5 items-center justify-center bg-surface p-6 sm:p-8">
          {children}
        </div>
      </div>
    </GuestGuard>
  )
}
