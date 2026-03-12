/**
 * Next.js Middleware
 * @description 页面级路由守卫，配置公开路由和受保护路由
 */

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { DEFAULT_SESSION_COOKIE_NAME } from '@/lib/utils/constants'

/**
 * 公开路由（无需登录）
 */
const publicRoutes = ['/', '/login']

/**
 * API 路由前缀（不处理）
 */
const apiPrefix = '/api'

/**
 * 静态资源路径（不处理）
 */
const staticPaths = ['/_next', '/favicon.ico', '/images', '/fonts']
const sessionCookieName = process.env.SESSION_COOKIE_NAME || DEFAULT_SESSION_COOKIE_NAME

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 跳过 API 路由
  if (pathname.startsWith(apiPrefix)) {
    return NextResponse.next()
  }

  // 跳过静态资源
  if (staticPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  const isPublicRoute = publicRoutes.includes(pathname)

  // 公开路由直接放行
  if (isPublicRoute) {
    return NextResponse.next()
  }

  const authCookie = request.cookies.get(sessionCookieName)
  if (!authCookie?.value) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * 匹配所有路径除了:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
