/**
 * Next.js Middleware
 * @description 页面级路由守卫，配置公开路由和受保护路由
 */

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

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

  // 从 cookie 或 localStorage 无法在 middleware 中直接读取
  // 这里我们检查 auth-storage cookie（如果设置了的话）
  // 实际的认证检查在客户端组件 AuthGuard 中完成
  // Middleware 主要用于 SSR 场景的初步检查

  const isPublicRoute = publicRoutes.includes(pathname)

  // 公开路由直接放行
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // 受保护路由：检查是否有 token cookie
  // 注意：这只是初步检查，完整的认证验证在 AuthGuard 组件中
  const _authCookie = request.cookies.get('auth-token')

  // 如果没有 token 且不是公开路由，可以选择重定向到登录页
  // 但由于我们使用 localStorage 存储 token，这里不做强制重定向
  // 让客户端 AuthGuard 处理

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
