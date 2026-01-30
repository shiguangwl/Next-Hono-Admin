'use client'

/**
 * Dashboard 路由错误边界
 * @description 捕获仪表板页面的渲染错误
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
export default function DashboardErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Dashboard Route Error:', error)
  }, [error])

  return <ErrorPage type="server" error={error} onRetry={reset} showHomeButton={true} />
}
