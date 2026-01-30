'use client'

/**
 * 路由级错误边界
 * @description 捕获页面组件的渲染错误
 */

import { useEffect } from 'react'
import { ErrorPage } from '@/components/ui/error-page'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * 错误页面
 */
export default function ErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    // 记录错误到控制台（生产环境可接入监控系统）
    console.error('Route Error:', error)
  }, [error])

  return <ErrorPage type="server" error={error} onRetry={reset} showHomeButton={true} />
}
