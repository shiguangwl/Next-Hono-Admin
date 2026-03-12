import { env } from "@/env";
import { ForbiddenError } from "@/lib/errors";
import type { Env } from "@/server/context";
import { createMiddleware } from "hono/factory";

const SAFE_METHODS = ["GET", "HEAD", "OPTIONS"];

// WHY: 优先使用 CORS_ORIGINS 白名单；
// 未配置时回退为 Origin ⇔ Host 动态匹配。
function isOriginAllowed(origin: string, host: string): boolean {
  if (env.CORS_ORIGINS.length > 0) {
    return env.CORS_ORIGINS.some(
      (allowed) => origin === allowed || origin.startsWith(`${allowed}/`),
    );
  }

  // WHY: 从 Origin URL 中提取 host 部分，与请求的 Host 头对比
  // 同源请求的 Origin host 必然等于 Host 头（含端口）
  try {
    const originHost = new URL(origin).host;
    return originHost === host;
  } catch {
    return false;
  }
}

function isRefererAllowed(referer: string, host: string): boolean {
  if (env.CORS_ORIGINS.length > 0) {
    return env.CORS_ORIGINS.some((allowed) => referer.startsWith(allowed));
  }

  try {
    const refererHost = new URL(referer).host;
    return refererHost === host;
  } catch {
    return false;
  }
}

export const csrfMiddleware = createMiddleware<Env>(async (c, next) => {
  const method = c.req.method.toUpperCase();

  if (SAFE_METHODS.includes(method)) {
    return next();
  }

  const origin = c.req.header("Origin");
  const referer = c.req.header("Referer");
  const host = c.req.header("Host");

  if (!host) {
    throw new ForbiddenError("CSRF validation failed: missing Host header");
  }

  if (origin) {
    if (!isOriginAllowed(origin, host)) {
      throw new ForbiddenError("CSRF validation failed: origin mismatch");
    }
    return next();
  }

  if (referer) {
    if (!isRefererAllowed(referer, host)) {
      throw new ForbiddenError("CSRF validation failed: referer mismatch");
    }
    return next();
  }

  throw new ForbiddenError(
    "CSRF validation failed: missing origin and referer",
  );
});
