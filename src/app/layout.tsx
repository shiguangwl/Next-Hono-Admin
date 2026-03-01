import { ColorSchemeScript, mantineHtmlProps } from '@mantine/core'
import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'NextHonoAdmin - 全栈应用开发脚手架',
  description: 'NextHonoAdmin 是一个基于 Next.js 和 Hono.js 的全栈应用开发脚手架',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" {...mantineHtmlProps} suppressHydrationWarning>
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
