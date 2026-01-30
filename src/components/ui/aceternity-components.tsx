"use client";

import { cn } from "@/lib/utils";
import { motion, useInView } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// ========== BackgroundBeams 组件 ==========
export function BackgroundBeams({ className }: { className?: string }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const paths = [
    "M-380 -189C-380 -189 -312 216 152 343C616 470 684 875 684 875",
    "M-373 -197C-373 -197 -305 208 159 335C623 462 691 867 691 867",
    "M-366 -205C-366 -205 -298 200 166 327C630 454 698 859 698 859",
  ];

  // 生成固定的随机位置（仅在客户端挂载后）
  const particlePositions = useRef<
    Array<{ left: number; top: number; duration: number; delay: number }>
  >([]);

  if (isMounted && particlePositions.current.length === 0) {
    particlePositions.current = [...Array(20)].map(() => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: 3 + Math.random() * 3,
      delay: Math.random() * 5,
    }));
  }

  return (
    <div
      className={cn(
        "absolute inset-0 overflow-hidden pointer-events-none",
        className,
      )}
    >
      <svg
        className="absolute w-full h-full"
        viewBox="0 0 696 316"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient
            id="beam-gradient-1"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="rgba(168, 85, 247, 0)" />
            <stop offset="50%" stopColor="rgba(168, 85, 247, 0.4)" />
            <stop offset="100%" stopColor="rgba(168, 85, 247, 0)" />
          </linearGradient>
          <linearGradient
            id="beam-gradient-2"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="rgba(59, 130, 246, 0)" />
            <stop offset="50%" stopColor="rgba(59, 130, 246, 0.4)" />
            <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
          </linearGradient>
          <linearGradient
            id="beam-gradient-3"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="rgba(236, 72, 153, 0)" />
            <stop offset="50%" stopColor="rgba(236, 72, 153, 0.4)" />
            <stop offset="100%" stopColor="rgba(236, 72, 153, 0)" />
          </linearGradient>
        </defs>
        {paths.map((path, index) => (
          <motion.path
            // biome-ignore lint/suspicious/noArrayIndexKey: <>
            key={index}
            d={path}
            stroke={`url(#beam-gradient-${index + 1})`}
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: [0, 1, 0],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: 8 + index * 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: index * 1.5,
            }}
            style={{
              filter: "blur(1px)",
            }}
          />
        ))}
      </svg>

      {/* 额外的光点效果 - 仅在客户端挂载后渲染 */}
      {isMounted &&
        particlePositions.current.map((pos, i) => (
          <motion.div
            // biome-ignore lint/suspicious/noArrayIndexKey: <>
            key={i}
            className="absolute w-1 h-1 bg-purple-400 rounded-full"
            style={{
              left: `${pos.left}%`,
              top: `${pos.top}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: pos.duration,
              repeat: Number.POSITIVE_INFINITY,
              delay: pos.delay,
            }}
          />
        ))}
    </div>
  );
}

// ========== BentoGrid 组件 ==========
export function BentoGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-4 auto-rows-[minmax(120px,auto)]", className)}>
      {children}
    </div>
  );
}

// ========== BentoCard 组件 ==========
interface BentoCardProps {
  title: string;
  value?: string | number;
  description?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function BentoCard({
  title,
  value,
  description,
  icon,
  children,
  className,
}: BentoCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <motion.div
      ref={cardRef}
      className={cn(
        "relative group p-6 rounded-2xl overflow-hidden",
        "bg-linear-to-br from-white/5 to-white/2",
        "border border-white/10",
        "backdrop-blur-xl",
        "transition-all duration-500",
        className,
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      whileHover={{
        scale: 1.02,
        y: -5,
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* 鼠标跟随光晕 */}
      {isHovered && (
        <motion.div
          className="absolute pointer-events-none rounded-full"
          style={{
            width: 300,
            height: 300,
            left: mousePosition.x - 150,
            top: mousePosition.y - 150,
            background:
              "radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        />
      )}

      {/* 边框光晕 */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 rounded-2xl bg-linear-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 blur-xl" />
      </div>

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-zinc-400">{title}</h3>
          {icon && (
            <motion.div
              className="text-zinc-400"
              whileHover={{ rotate: 360, scale: 1.2 }}
              transition={{ duration: 0.6 }}
            >
              {icon}
            </motion.div>
          )}
        </div>
        <div className="flex-1 flex items-center justify-center">
          {children || description ? (
            description ? (
              <p className="text-sm text-slate-300/80 text-center">
                {description}
              </p>
            ) : (
              children
            )
          ) : (
            <p className="text-3xl font-bold text-zinc-200">{value}</p>
          )}
        </div>
      </div>

      {/* 装饰性网格 */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
          }}
        />
      </div>
    </motion.div>
  );
}

// ========== AnimatedNumber 组件 ==========
interface AnimatedNumberProps {
  value: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
}

export function AnimatedNumber({
  value,
  decimals = 0,
  suffix = "",
  prefix = "",
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    const duration = 2000;
    const steps = 60;
    const stepValue = value / steps;
    const stepDuration = duration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(stepValue * currentStep);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [value, isInView]);

  return (
    <span ref={ref}>
      {prefix}
      {displayValue.toFixed(decimals)}
      {suffix}
    </span>
  );
}

// ========== GlassCard 组件 ==========
export function GlassCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={cn(
        "relative rounded-2xl overflow-hidden",
        "bg-linear-to-br from-white/[0.07] to-white/2",
        "border border-white/10",
        "backdrop-blur-2xl",
        "shadow-2xl shadow-purple-500/10",
        className,
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* 顶部光晕 */}
      <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-purple-500/50 to-transparent" />

      {/* 内容 */}
      <div className="relative z-10">{children}</div>

      {/* 底部装饰 */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-blue-500/30 to-transparent" />
    </motion.div>
  );
}

// ========== SpotLight 组件（额外优化）==========
export function SpotLight() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <motion.div
      className="fixed pointer-events-none z-30 rounded-full"
      style={{
        width: 600,
        height: 600,
        left: mousePosition.x - 300,
        top: mousePosition.y - 300,
        background:
          "radial-gradient(circle, rgba(168, 85, 247, 0.08) 0%, transparent 70%)",
      }}
      animate={{
        x: 0,
        y: 0,
      }}
      transition={{
        type: "spring",
        damping: 30,
        stiffness: 200,
      }}
    />
  );
}

// ========== FloatingStats 组件（浮动统计）==========
interface FloatingStatsProps {
  label: string;
  value: string | number;
  trend?: "up" | "down";
  className?: string;
}

export function FloatingStats({
  label,
  value,
  trend,
  className,
}: FloatingStatsProps) {
  return (
    <motion.div
      className={cn(
        "fixed bottom-6 right-6 z-40",
        "px-6 py-4 rounded-2xl",
        "bg-linear-to-br from-white/10 to-white/5",
        "border border-white/20",
        "backdrop-blur-2xl",
        "shadow-2xl shadow-purple-500/20",
        className,
      )}
      initial={{ opacity: 0, y: 50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.8 }}
      whileHover={{ scale: 1.05, y: -5 }}
      transition={{ type: "spring", damping: 15 }}
    >
      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <span className="text-xs text-zinc-400">{label}</span>
          <span className="text-2xl font-bold text-white">{value}</span>
        </div>
        {trend && (
          <motion.div
            animate={{ y: trend === "up" ? [-2, 2, -2] : [2, -2, 2] }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
          >
            {trend === "up" ? (
              <TrendingUp className="h-6 w-6 text-green-400" />
            ) : (
              <TrendingUp className="h-6 w-6 text-red-400 rotate-180" />
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// ========== LoadingSkeleton 组件（骨架屏）==========
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <>
      {[...Array(rows)].map((_, i) => (
        <motion.tr
          // biome-ignore lint/suspicious/noArrayIndexKey: <>
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.1 }}
          className="border-b border-white/5"
        >
          {[...Array(16)].map((_, j) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: <>
            <td key={j} className="px-3 py-4">
              <motion.div
                className="h-4 bg-white/5 rounded"
                animate={{
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: j * 0.05,
                }}
              />
            </td>
          ))}
        </motion.tr>
      ))}
    </>
  );
}
