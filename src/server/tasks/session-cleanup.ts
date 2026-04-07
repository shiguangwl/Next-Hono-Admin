import { logger } from '@/lib/logging'
import { deleteExpiredSessions } from '@/server/services'

const CLEANUP_INTERVAL_MS = 60 * 60 * 1000
const INITIAL_DELAY_MS = 30 * 1000

declare global {
  var __sessionCleanupTaskStarted: boolean | undefined
}

async function runCleanup() {
  try {
    const deleted = await deleteExpiredSessions()
    if (deleted > 0) {
      logger.info('Session cleanup completed', { deletedCount: deleted })
    }
  } catch (err) {
    logger.error('Session cleanup failed', { err: err as Error })
  }
}

export function startSessionCleanupTask(): void {
  if (globalThis.__sessionCleanupTaskStarted) {
    logger.debug('Session cleanup task already started, skipping duplicate registration')
    return
  }

  globalThis.__sessionCleanupTaskStarted = true

  const initialTimer = setTimeout(() => {
    void runCleanup()

    const intervalTimer = setInterval(() => {
      void runCleanup()
    }, CLEANUP_INTERVAL_MS)

    intervalTimer.unref()
  }, INITIAL_DELAY_MS)

  initialTimer.unref()

  logger.info('Session cleanup task scheduled', {
    intervalMs: CLEANUP_INTERVAL_MS,
    initialDelayMs: INITIAL_DELAY_MS,
  })
}
