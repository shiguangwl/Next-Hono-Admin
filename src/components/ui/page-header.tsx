'use client'

/**
 * 页面头部组件
 * @description 统一的页面标题区域，支持面包屑、标题、描述和操作区
 */

import { ChevronRight, House } from '@gravity-ui/icons'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * 面包屑项类型
 */
interface BreadcrumbItem {
  label: string
  href?: string
}

/**
 * 页面头部属性
 */
interface PageHeaderProps {
  /** 页面标题 */
  title: string
  /** 页面描述 */
  description?: string
  /** 面包屑导航 */
  breadcrumbs?: BreadcrumbItem[]
  /** 操作区域 */
  actions?: ReactNode
  /** 自定义类名 */
  className?: string
}

/**
 * 面包屑组件
 */
function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  if (items.length === 0) return null

  return (
    <nav aria-label="面包屑导航" className="flex items-center gap-1.5 text-sm">
      <Link
        href="/dashboard"
        className="flex items-center text-muted transition-colors hover:text-foreground"
      >
        <House className="size-4" />
      </Link>
      {items.map((item, index) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <ChevronRight className="size-3.5 text-muted" />
          {item.href && index < items.length - 1 ? (
            <Link href={item.href} className="text-muted transition-colors hover:text-foreground">
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  )
}

/**
 * 页面头部组件
 */
export function PageHeader({
  title,
  description,
  breadcrumbs = [],
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {/* 面包屑 */}
      {breadcrumbs.length > 0 && <Breadcrumbs items={breadcrumbs} />}

      {/* 标题行 */}
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl font-bold text-foreground">{title}</h1>
          {description && <p className="mt-1 text-sm text-muted">{description}</p>}
        </div>

        {/* 操作区 */}
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
    </div>
  )
}

/**
 * 页面容器组件
 * @description 标准化的页面内容容器，统一间距
 */
interface PageContainerProps {
  children: ReactNode
  className?: string
}

export function PageContainer({ children, className }: PageContainerProps) {
  return <div className={cn('space-y-6', className)}>{children}</div>
}

/**
 * 页面区块组件
 * @description 用于分隔页面内的不同区块
 */
interface PageSectionProps {
  children: ReactNode
  className?: string
}

export function PageSection({ children, className }: PageSectionProps) {
  return <section className={cn('space-y-4', className)}>{children}</section>
}

