/**
 * Next.js Instrumentation Hook
 * @description 应用启动时的初始化逻辑（服务端）
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // ========== 数据库初始化 ==========
    const { ensureDatabaseInitialized } = await import('@/db')
    await ensureDatabaseInitialized()

    // ========== 错误监控初始化 ==========
    const { env } = await import('@/env')
    const { logger } = await import('@/lib/logging')
    const { ConsoleMonitor, setErrorMonitor } = await import('@/lib/errors')

    // 开发环境：使用控制台监控
    if (env.NODE_ENV !== 'production') {
      setErrorMonitor(new ConsoleMonitor())
      logger.info('[Instrumentation] ErrorMonitor initialized (ConsoleMonitor)')
    }

    // 生产环境：集成 Sentry（需要配置 SENTRY_DSN 环境变量）
    // if (env.NODE_ENV === 'production' && env.SENTRY_DSN) {
    //   const Sentry = await import('@sentry/node')
    //   const { SentryMonitor } = await import('@/lib/errors/sentry')
    //
    //   Sentry.init({
    //     dsn: env.SENTRY_DSN,
    //     environment: env.NODE_ENV,
    //     tracesSampleRate: 1.0,
    //   })
    //
    //   setErrorMonitor(new SentryMonitor())
    //   console.log('[Instrumentation] ErrorMonitor initialized (SentryMonitor)')
    // }
  }
}
