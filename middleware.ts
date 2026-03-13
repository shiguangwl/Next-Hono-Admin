import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { DEFAULT_SESSION_COOKIE_NAME } from '@/lib/constants'

const publicRoutes = new Set(['/', '/login'])
const sessionCookieName = process.env.SESSION_COOKIE_NAME || DEFAULT_SESSION_COOKIE_NAME

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (publicRoutes.has(pathname)) {
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
    // 所有静态资源和 API 路由在 matcher 层排除，避免进入 Edge Runtime
    '/((?!api|_next/static|_next/image|favicon.ico|images|fonts).*)',
  ],
}
