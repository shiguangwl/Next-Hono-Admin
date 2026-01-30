"use client";

/**
 * 认证守卫组件
 * @description 保护需要登录才能访问的内容
 */

import { FullScreenLoading } from "@/components/ui/loading";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";

interface AuthGuardProps {
  /** 子组件 */
  children: ReactNode;
  /** 未登录时重定向的路径，默认 /login */
  redirectTo?: string;
  /** 加载中显示的内容 */
  fallback?: ReactNode;
}

/**
 * 认证守卫组件
 * @description 检查用户是否已登录，未登录则重定向到登录页
 */
export function AuthGuard({
  children,
  redirectTo = "/login",
  fallback,
}: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, initialized, loading } = useAuth();

  useEffect(() => {
    // 等待初始化完成
    if (!initialized) return;

    // 未登录则重定向
    if (!isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [initialized, isAuthenticated, redirectTo, router]);

  // 初始化中或加载中显示 fallback
  if (!initialized || loading) {
    return (
      <>
        {fallback ?? (
          <FullScreenLoading title="正在验证身份" description="请稍候..." />
        )}
      </>
    );
  }

  // 未登录时不渲染内容（等待重定向）
  if (!isAuthenticated) {
    return (
      <>
        {fallback ?? (
          <FullScreenLoading title="跳转中" description="正在跳转到登录页..." />
        )}
      </>
    );
  }

  return <>{children}</>;
}

/**
 * 访客守卫组件
 * @description 保护只有未登录用户才能访问的内容（如登录页）
 */
export function GuestGuard({
  children,
  redirectTo = "/",
  fallback,
}: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, initialized } = useAuth();

  useEffect(() => {
    // 等待初始化完成
    if (!initialized) return;

    // 已登录则重定向
    if (isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [initialized, isAuthenticated, redirectTo, router]);

  // 初始化中显示 fallback (登录操作的 loading 由页面组件自己处理)
  if (!initialized) {
    return (
      <>
        {fallback ?? (
          <FullScreenLoading title="正在加载" description="请稍候..." />
        )}
      </>
    );
  }

  // 已登录时不渲染内容（等待重定向）
  if (isAuthenticated) {
    return (
      <>
        {fallback ?? (
          <FullScreenLoading title="跳转中" description="正在跳转到主页..." />
        )}
      </>
    );
  }

  return <>{children}</>;
}
