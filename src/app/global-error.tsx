'use client'

/**
 * 全局错误边界
 * @description 捕获根布局级别的错误，使用内联样式避免依赖问题
 * 现代简约设计，中性色调
 */

import { useEffect } from 'react'

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  const isDev = process.env.NODE_ENV === 'development'

  useEffect(() => {
    console.error('Global Error:', error)
  }, [error])

  return (
    <html lang="zh-CN">
      <body
        style={{
          margin: 0,
          padding: '24px',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(to bottom, #18181b, #09090b)',
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        }}
      >
        {/* 背景点阵 */}
        <div
          style={{
            position: 'fixed',
            inset: 0,
            opacity: 0.03,
            backgroundImage: 'radial-gradient(circle at 1px 1px, #fff 1px, transparent 1px)',
            backgroundSize: '32px 32px',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            position: 'relative',
            maxWidth: '420px',
            width: '100%',
            padding: '40px',
            background: 'rgba(24, 24, 27, 0.8)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            border: '1px solid rgba(63, 63, 70, 0.5)',
            textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          }}
        >
          {/* 图标容器 */}
          <div
            style={{
              width: '64px',
              height: '64px',
              margin: '0 auto 24px',
              borderRadius: '16px',
              background: 'rgba(244, 63, 94, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#f43f5e"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <title>错误</title>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>

          <h1
            style={{
              color: '#fafafa',
              fontSize: '20px',
              fontWeight: 600,
              marginBottom: '8px',
            }}
          >
            系统发生严重错误
          </h1>

          <p
            style={{
              color: '#a1a1aa',
              fontSize: '14px',
              marginBottom: '32px',
              lineHeight: 1.6,
            }}
          >
            应用程序遇到了无法恢复的错误，请尝试刷新页面
          </p>

          {isDev && (
            <div
              style={{
                marginBottom: '24px',
                padding: '16px',
                background: 'rgba(244, 63, 94, 0.1)',
                border: '1px solid rgba(244, 63, 94, 0.2)',
                borderRadius: '12px',
                textAlign: 'left',
              }}
            >
              <p
                style={{
                  color: '#fb7185',
                  fontSize: '13px',
                  fontFamily: 'monospace',
                  wordBreak: 'break-all',
                  margin: 0,
                }}
              >
                {error.name}: {error.message}
              </p>
              {error.digest && (
                <p
                  style={{
                    color: 'rgba(251, 113, 133, 0.6)',
                    fontSize: '11px',
                    marginTop: '8px',
                    marginBottom: 0,
                  }}
                >
                  Digest: {error.digest}
                </p>
              )}
            </div>
          )}

          <div
            style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              onClick={reset}
              style={{
                padding: '10px 20px',
                background: '#fafafa',
                color: '#18181b',
                border: 'none',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#e4e4e7'
              }}
              onFocus={(e) => {
                e.currentTarget.style.background = '#e4e4e7'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = '#fafafa'
              }}
              onBlur={(e) => {
                e.currentTarget.style.background = '#fafafa'
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
              </svg>
              重试
            </button>
            <button
              type="button"
              onClick={() => {
                window.location.href = '/'
              }}
              style={{
                padding: '10px 20px',
                background: 'transparent',
                color: '#d4d4d8',
                border: '1px solid rgba(63, 63, 70, 0.8)',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(63, 63, 70, 0.3)'
              }}
              onFocus={(e) => {
                e.currentTarget.style.background = 'rgba(63, 63, 70, 0.3)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'transparent'
              }}
              onBlur={(e) => {
                e.currentTarget.style.background = 'transparent'
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              返回首页
            </button>
          </div>

          <p style={{ color: '#71717a', fontSize: '12px', marginTop: '32px' }}>
            如果问题持续存在，请联系技术支持
          </p>
        </div>
      </body>
    </html>
  )
}
