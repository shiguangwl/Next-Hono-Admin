import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'NextHonoAdmin - 全栈应用开发脚手架',
  description: 'NextHonoAdmin 是一个基于 Next.js 和 Hono.js 的全栈应用开发脚手架，提供了一整套开发工具和组件，帮助开发者快速搭建和管理全栈应用。',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" className="light" data-theme="light" suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
