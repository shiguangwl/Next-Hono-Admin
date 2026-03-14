'use client'

import { NavigationProgress, nprogress } from '@mantine/nprogress'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

export function RouteProgress() {
  const pathname = usePathname()
  const prevPathRef = useRef(pathname)

  // WHY: Next.js App Router 没有 routeChangeStart 事件，需要拦截 link 点击来触发 start
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a')
      if (!anchor) return

      const href = anchor.getAttribute('href')
      if (!href || href.startsWith('http') || href.startsWith('#')) return
      if (anchor.target === '_blank') return

      if (href !== pathname) {
        nprogress.start()
      }
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [pathname])

  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      nprogress.complete()
      prevPathRef.current = pathname
    }
  }, [pathname])

  return <NavigationProgress />
}
