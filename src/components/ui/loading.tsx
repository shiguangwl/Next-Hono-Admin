"use client";

import { Spinner } from "@heroui/react";
import { motion } from "framer-motion";

/**
 * 加载动画配置
 */
const LOADING_DOTS = [
  { id: "dot-1", delay: 0 },
  { id: "dot-2", delay: 0.2 },
  { id: "dot-3", delay: 0.4 },
] as const;

interface EnhancedLoadingProps {
  /** 主标题 */
  title?: string;
  /** 副标题描述 */
  description?: string;
  /** 尺寸 */
  size?: "sm" | "md" | "lg";
}

/**
 * 增强版加载组件
 * @description 带有动画效果的精美加载状态
 */
export function EnhancedLoading({
  title = "正在加载数据",
  description = "请稍候，正在获取数据...",
  size = "md",
}: EnhancedLoadingProps) {
  const spinnerSize = size === "sm" ? "sm" : size === "md" ? "md" : "lg";
  const paddingY = size === "sm" ? "py-12" : size === "md" ? "py-16" : "py-20";
  const gapSize = size === "sm" ? "gap-4" : size === "md" ? "gap-5" : "gap-6";

  return (
    <div
      className={`flex flex-col items-center justify-center ${paddingY} ${gapSize}`}
    >
      {/* 主加载器 */}
      <Spinner size={spinnerSize} color="accent" />

      {/* 加载文本 */}
      <motion.div
        className="space-y-1 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted">{description}</p>
      </motion.div>

      {/* 跳动的点 */}
      <div className="flex gap-1.5">
        {LOADING_DOTS.map((dot) => (
          <motion.div
            key={dot.id}
            className="size-2 rounded-full bg-accent"
            animate={{ y: [0, -8, 0], opacity: [0.5, 1, 0.5] }}
            transition={{
              duration: 0.6,
              repeat: Number.POSITIVE_INFINITY,
              delay: dot.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * 简化版加载组件（用于按钮等小场景）
 */
export function SimpleLoading({ text = "加载中..." }: { text?: string }) {
  return (
    <div className="flex items-center gap-2">
      <Spinner size="sm" />
      <span className="text-sm">{text}</span>
    </div>
  );
}

/**
 * 全屏加载组件（用于页面级加载）
 */
export function FullScreenLoading({
  title = "加载中",
  description = "正在为您准备页面...",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6">
        <Spinner size="lg" color="accent" />

        {/* 文字内容 */}
        <motion.div
          className="space-y-2 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <p className="text-sm text-muted">{description}</p>
        </motion.div>

        {/* 跳动的点 */}
        <div className="flex gap-1.5">
          {LOADING_DOTS.map((dot) => (
            <motion.div
              key={dot.id}
              className="size-2 rounded-full bg-accent"
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 0.6,
                repeat: Number.POSITIVE_INFINITY,
                delay: dot.delay,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
