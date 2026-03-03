import { type ClientResponse, hc } from 'hono/client'
import type { AppType } from '@/server/types'

export type HonoClient = ReturnType<typeof hc<AppType>>

export interface ClientOptions {
  token?: string | null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export type ApiErrorResponse = {
  code: string
  message: string
  details?: unknown
}

export type ApiSuccessResponse<T> = {
  code: string
  message?: string
  data: T
}

export async function unwrapApiData<T>(response: unknown, fallbackMessage: string): Promise<T> {
  const res = response as Pick<ClientResponse<unknown>, 'ok' | 'json'>
  const payload = await res.json().catch(() => null)

  if (!res.ok) {
    if (isRecord(payload) && typeof payload.message === 'string' && payload.message.trim()) {
      throw new Error(payload.message)
    }
    throw new Error(fallbackMessage)
  }

  if (!isRecord(payload) || !('data' in payload)) {
    throw new Error(fallbackMessage)
  }

  return (payload as ApiSuccessResponse<T>).data
}

function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return ''
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  if (process.env.RAILWAY_PUBLIC_DOMAIN) {
    return `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
  }
  return 'http://localhost:3000'
}

function getStoredToken(): string | null {
  if (typeof window === 'undefined') {
    return null
  }
  try {
    const authStorage = localStorage.getItem('auth-storage')
    if (authStorage) {
      const parsed = JSON.parse(authStorage)
      return parsed?.state?.token || null
    }
  } catch {
    // 解析失败时返回 null
  }
  return null
}

function createHeaders(token: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  return headers
}

function resolveToken(tokenOption: string | null | undefined): string | null {
  if (tokenOption === undefined) {
    return getStoredToken()
  }
  return tokenOption
}

export function createClient(options?: ClientOptions): HonoClient {
  const baseUrl = getBaseUrl()
  const token = resolveToken(options?.token)

  return hc<AppType>(`${baseUrl}/api`, {
    headers: () => createHeaders(token),
  })
}

export function getApiClient(): HonoClient {
  return createClient()
}

export type { ClientResponse }
