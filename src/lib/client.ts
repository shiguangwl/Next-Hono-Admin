import type { ValidationErrorDetails } from "@/lib/errors/types";
import type { AppType } from "@/server/route-defs";
import { type ClientResponse, hc } from "hono/client";

export type HonoClient = ReturnType<typeof hc<AppType>>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export type ApiErrorResponse = {
  code: string;
  message: string;
  details?:
    | ValidationErrorDetails
    | Record<string, unknown>
    | Array<unknown>
    | string
    | number
    | boolean
    | null;
  requestId?: string;
};

export type ApiSuccessResponse<T> = {
  code: string;
  message?: string;
  data: T;
};

export async function unwrapApiData<T>(
  response: unknown,
  fallbackMessage: string,
): Promise<T> {
  const res = response as Pick<ClientResponse<unknown>, "ok" | "json">;
  const payload = await res.json().catch(() => null);

  if (!res.ok) {
    if (
      isRecord(payload) &&
      typeof payload.message === "string" &&
      payload.message.trim()
    ) {
      throw new Error(payload.message);
    }
    throw new Error(fallbackMessage);
  }

  if (!isRecord(payload) || !("data" in payload)) {
    throw new Error(fallbackMessage);
  }

  return (payload as ApiSuccessResponse<T>).data;
}

function getBaseUrl(): string {
  if (typeof window !== "undefined") {
    return "";
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  if (process.env.RAILWAY_PUBLIC_DOMAIN) {
    return `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`;
  }
  return "http://localhost:3000";
}

export function createClient(token?: string): HonoClient {
  const baseUrl = getBaseUrl();

  return hc<AppType>(`${baseUrl}/api`, {
    headers: () => {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      return headers;
    },
  });
}

export function getApiClient(): HonoClient {
  return createClient();
}

export type { ClientResponse };
