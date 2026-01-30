"use client";

/**
 * 错误页面组件
 * @description 可复用的错误展示组件，采用现代简约设计
 */

import {
  ArrowsRotateRight,
  CircleExclamation,
  House,
  Server,
} from "@gravity-ui/icons";
import { Button } from "@heroui/react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export type ErrorType = "server" | "network" | "notFound" | "unknown";

interface ErrorConfig {
  icon: React.ReactNode;
  title: string;
  description: string;
  iconBg: string;
}

const ERROR_CONFIGS: Record<ErrorType, ErrorConfig> = {
  server: {
    icon: <Server className="size-8" />,
    title: "服务暂时不可用",
    description: "服务器正在维护或遇到了一些问题，请稍后再试",
    iconBg: "bg-danger/10 text-danger",
  },
  network: {
    icon: <CircleExclamation className="size-8" />,
    title: "网络连接失败",
    description: "无法连接到服务器，请检查您的网络连接",
    iconBg: "bg-warning/10 text-warning",
  },
  notFound: {
    icon: <CircleExclamation className="size-8" />,
    title: "页面未找到",
    description: "您访问的页面不存在或已被移除",
    iconBg: "bg-accent/10 text-accent",
  },
  unknown: {
    icon: <CircleExclamation className="size-8" />,
    title: "发生了错误",
    description: "抱歉，出现了一些意外情况",
    iconBg: "bg-default text-muted",
  },
};

export interface ErrorPageProps {
  type?: ErrorType;
  title?: string;
  description?: string;
  error?: Error;
  onRetry?: () => void;
  showHomeButton?: boolean;
}

export function ErrorPage({
  type = "unknown",
  title,
  description,
  error,
  onRetry,
  showHomeButton = true,
}: ErrorPageProps) {
  const router = useRouter();
  const config = ERROR_CONFIGS[type];
  const isDev = process.env.NODE_ENV === "development";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <motion.div
        className="relative z-10 w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="rounded-2xl border border-separator bg-surface p-8 shadow-lg md:p-10">
          {/* 图标 */}
          <motion.div
            className="mb-6 flex justify-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          >
            <div className={`rounded-2xl p-4 ${config.iconBg}`}>
              {config.icon}
            </div>
          </motion.div>

          <h1 className="mb-2 text-center text-xl font-semibold text-foreground md:text-2xl">
            {title || config.title}
          </h1>

          <p className="mb-8 text-center text-sm leading-relaxed text-muted">
            {description || config.description}
          </p>

          {isDev && error && (
            <div className="mb-6 rounded-xl border border-danger-soft-hover bg-danger/5 p-4 text-left">
              <p className="break-all font-mono text-sm text-danger">
                {error.name}: {error.message}
              </p>
            </div>
          )}

          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            {onRetry && (
              <Button onPress={onRetry}>
                <ArrowsRotateRight className="size-4" />
                重试
              </Button>
            )}
            {showHomeButton && (
              <Button variant="secondary" onPress={() => router.push("/")}>
                <House className="size-4" />
                返回首页
              </Button>
            )}
          </div>

          <p className="mt-8 text-center text-xs text-muted">
            如果问题持续存在，请联系技术支持
          </p>
        </div>
      </motion.div>
    </div>
  );
}
