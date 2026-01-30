"use client";

import { buttonVariants } from "@heroui/react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Layout,
  Monitor,
  Rocket,
  ShieldCheck,
  Zap,
} from "lucide-react";
import NextLink from "next/link";

import {
  BackgroundBeams,
  BentoCard,
  BentoGrid,
  GlassCard,
  SpotLight,
} from "@/components/ui/aceternity-components";

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-slate-950 overflow-hidden selection:bg-purple-500/30">
      <BackgroundBeams />
      <SpotLight />

      <motion.header
        className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-slate-950/20 backdrop-blur-xl border-b border-white/5"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
        >
          <div className="p-2 bg-linear-to-br from-purple-500 to-indigo-600 rounded-lg shadow-lg shadow-purple-500/20">
            <Rocket className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold bg-linear-to-r from-white to-white/60 bg-clip-text text-transparent">
            NextHonoAdmin
          </span>
        </motion.div>

        <div className="flex items-center gap-4">
          <NextLink
            href="/login"
            className={buttonVariants({
              variant: "ghost",
              className: "border border-white/10 text-white px-6 font-medium",
            })}
          >
            登录
          </NextLink>
          <NextLink
            href="/dashboard"
            className={buttonVariants({
              className:
                "bg-linear-to-r from-purple-600 to-indigo-600 text-white px-6 font-medium",
            })}
          >
            控制台
          </NextLink>
        </div>
      </motion.header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-32">
        <div className="text-center space-y-8 mb-32">
          <motion.h1
            className="text-5xl md:text-7xl font-bold tracking-tight text-white"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            打造现代化的 <br />
            <span className="bg-linear-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
              全栈应用开发脚手架
            </span>
          </motion.h1>

          <motion.p
            className="max-w-2xl mx-auto text-lg text-slate-400 leading-relaxed"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            基于 Next.js 16+, Hono, Drizzle ORM 和 Tailwind CSS 构建。内置完善的
            RBAC 权限管理系统,助你快速启动业务开发。
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <NextLink
              href="/dashboard"
              className={buttonVariants({
                size: "lg",
                className:
                  "w-full sm:w-auto bg-white text-slate-950 px-8 font-bold text-base h-14 inline-flex items-center justify-center gap-2",
              })}
            >
              立刻开始
              <ArrowRight className="h-5 w-5" />
            </NextLink>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({
                size: "lg",
                variant: "ghost",
                className:
                  "w-full sm:w-auto bg-slate-900 border border-white/10 text-white px-8 font-bold text-base h-14 inline-flex items-center justify-center gap-2",
              })}
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              GitHub
            </a>
          </motion.div>
        </div>

        <section className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-white">强大特性</h2>
            <p className="text-slate-400">集成了现代化开发所需的所有工具</p>
          </div>

          <BentoGrid className="max-w-5xl mx-auto">
            <BentoCard
              title="极速开发体验"
              description="基于 Next.js 15 和 Hono 的全栈架构,提供热更新和强类型支持。"
              icon={<Zap className="h-6 w-6 text-yellow-400" />}
              className="md:col-span-2"
            />
            <BentoCard
              title="权限管理系统"
              description="内置完整的 RBAC 架构,支持角色、菜单、按钮级别的权限控制。"
              icon={<ShieldCheck className="h-6 w-6 text-green-400" />}
              className="md:col-span-1"
            />
            <BentoCard
              title="响应式设计"
              description="完美适配移动端和桌面端,提供流畅的跨设备体验。"
              icon={<Monitor className="h-6 w-6 text-blue-400" />}
              className="md:col-span-1"
            />
            <BentoCard
              title="现代化组件库"
              description="结合 HeroUI 和 Framer Motion,打造细腻的动画和极佳的视觉效果。"
              icon={<Layout className="h-6 w-6 text-purple-400" />}
              className="md:col-span-2"
            />
          </BentoGrid>
        </section>

        <motion.section
          className="mt-32 relative"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="absolute inset-0 bg-linear-to-r from-purple-500/20 to-indigo-500/20 blur-3xl opacity-50 rounded-3xl" />
          <GlassCard className="relative p-12 text-center border-white/10 overflow-hidden">
            <div className="relative z-10 space-y-6">
              <h2 className="text-3xl font-bold text-white">
                准备好开启你的下一个项目了吗?
              </h2>
              <p className="max-w-xl mx-auto text-slate-400">
                NextHonoAdmin
                已经为你准备好了所有基础架构。你可以专注于核心业务逻辑,而不必担心权限管理、数据库配置和
                API 设计。
              </p>
              <NextLink
                href="/dashboard"
                className={buttonVariants({
                  size: "lg",
                  className: "bg-white text-slate-950 px-10 font-bold",
                })}
              >
                克隆项目
              </NextLink>
            </div>
          </GlassCard>
        </motion.section>
      </main>

      <footer className="relative z-10 border-t border-white/5 bg-slate-950/50 backdrop-blur-md py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-purple-500" />
            <span className="font-bold text-white">NextHonoAdmin</span>
          </div>
          <div className="flex items-center gap-8 text-sm text-slate-400">
            <NextLink href="#" className="hover:text-white transition-colors">
              使用协议
            </NextLink>
            <NextLink href="#" className="hover:text-white transition-colors">
              隐私政策
            </NextLink>
            <NextLink href="#" className="hover:text-white transition-colors">
              问题反馈
            </NextLink>
          </div>
          <p className="text-sm text-slate-500">
            © 2026 NextHonoAdmin. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
