/**
 * Next.js Instrumentation Hook
 * @description 应用启动时的初始化逻辑（服务端）
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // ========== OpenTelemetry 初始化（必须最先执行）==========
    // WHY: OTel auto-instrumentation 需要在 HTTP/DB 模块被 import 前 patch
    const { initTelemetry } = await import('@/lib/telemetry')
    await initTelemetry()

    // ========== 数据库初始化 ==========
    const { ensureDatabaseInitialized } = await import('@/db')
    await ensureDatabaseInitialized()

    // ========== 后台任务 ==========
    const { startSessionCleanupTask } = await import('@/server/tasks/session-cleanup')
    startSessionCleanupTask()
  }
}
