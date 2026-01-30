'use client'

/**
 * Public 路由错误边界
 * @description 捕获公开页面的渲染错误
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
export default function PublicErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Public Route Error:', error)
  }, [error])

  return <ErrorPage type="server" error={error} onRetry={reset} showHomeButton={false} />
}
