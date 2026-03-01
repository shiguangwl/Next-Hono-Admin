import type { Hono } from 'hono'
import type { Env } from '@/server/context'
import { routes } from '@/server/route-defs'

export function setupRoutes(app: Hono<Env>): void {
  app.route('/api', routes)
}
