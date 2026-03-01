'use client'

import { useRouter } from 'next/navigation'
import { type ReactNode, useEffect } from 'react'

import { FullScreenLoading } from '@/components/ui/loading'
import { useAuth } from '@/hooks/use-auth'

interface AuthGuardProps {
  children: ReactNode
  redirectTo?: string
  fallback?: ReactNode
}

export function AuthGuard({ children, redirectTo = '/login', fallback }: AuthGuardProps) {
  const router = useRouter()
  const { isAuthenticated, initialized, loading } = useAuth()

  useEffect(() => {
    if (!initialized) return
    if (!isAuthenticated) router.replace(redirectTo)
  }, [initialized, isAuthenticated, redirectTo, router])

  if (!initialized || loading) {
    return <>{fallback ?? <FullScreenLoading title="正在验证身份" description="请稍候..." />}</>
  }

  if (!isAuthenticated) {
    return <>{fallback ?? <FullScreenLoading title="跳转中" description="正在跳转到登录页..." />}</>
  }

  return <>{children}</>
}

export function GuestGuard({ children, redirectTo = '/', fallback }: AuthGuardProps) {
  const router = useRouter()
  const { isAuthenticated, initialized } = useAuth()

  useEffect(() => {
    if (!initialized) return
    if (isAuthenticated) router.replace(redirectTo)
  }, [initialized, isAuthenticated, redirectTo, router])

  if (!initialized) {
    return <>{fallback ?? <FullScreenLoading title="正在加载" description="请稍候..." />}</>
  }

  if (isAuthenticated) {
    return <>{fallback ?? <FullScreenLoading title="跳转中" description="正在跳转到主页..." />}</>
  }

  return <>{children}</>
}
