'use client'

/**
 * 全局 Providers
 * @description 配置 React Query 和认证初始化
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type ReactNode, useEffect } from 'react'
import { Toaster } from 'sonner'
import { useAuthStore } from '@/hooks/use-auth'

/**
 * 认证初始化组件
 * @description 在应用启动时刷新认证状态
 */
function AuthInitializer({ children }: { children: ReactNode }) {
  const { initialized, refreshAuth } = useAuthStore()

  useEffect(() => {
    // 应用启动时刷新认证状态
    if (!initialized) {
      refreshAuth()
    }
  }, [initialized, refreshAuth])

  return <>{children}</>
}

/**
 * 创建 QueryClient 实例
 */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // 默认缓存时间 5 分钟
        staleTime: 5 * 60 * 1000,
        // 默认重试 1 次
        retry: 1,
        // 窗口聚焦时不自动重新获取
        refetchOnWindowFocus: false,
      },
      mutations: {
        // 默认重试 0 次
        retry: 0,
      },
    },
  })
}

// 浏览器端单例
let browserQueryClient: QueryClient | undefined

function getQueryClient() {
  if (typeof window === 'undefined') {
    // 服务端：每次创建新实例
    return makeQueryClient()
  }
  // 浏览器端：使用单例
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient()
  }
  return browserQueryClient
}

interface ProvidersProps {
  children: ReactNode
}

/**
 * 全局 Providers 组件
 */
export function Providers({ children }: ProvidersProps) {
  const queryClient = getQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer>{children}</AuthInitializer>
      <Toaster position="top-center" richColors closeButton />
    </QueryClientProvider>
  )
}
