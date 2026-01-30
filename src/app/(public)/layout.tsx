/**
 * 公开页面布局
 * @description 无需认证的公开页面布局
 */

import type { ReactNode } from 'react'

interface PublicLayoutProps {
  children: ReactNode
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return <>{children}</>
}
