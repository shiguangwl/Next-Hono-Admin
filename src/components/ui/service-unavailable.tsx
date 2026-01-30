'use client'

/**
 * 服务不可用状态组件
 * @description 当后端服务不可用时显示的友好界面，现代简约设计
 */

import { Button } from '@heroui/react'
import { motion } from 'framer-motion'
import { Clock, RefreshCw, Server, WifiOff } from 'lucide-react'

export type ServiceErrorType = 'network' | 'server' | 'timeout'

interface ServiceErrorConfig {
  icon: React.ReactNode
  title: string
  description: string
  iconBg: string
}

const ERROR_CONFIGS: Record<ServiceErrorType, ServiceErrorConfig> = {
  network: {
    icon: <WifiOff className="h-8 w-8" />,
    title: '网络连接失败',
    description: '无法连接到服务器，请检查您的网络连接后重试',
    iconBg: 'bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400',
  },
  server: {
    icon: <Server className="h-8 w-8" />,
    title: '服务暂时不可用',
    description: '服务器正在维护或遇到问题，请稍后重试',
    iconBg: 'bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400',
  },
  timeout: {
    icon: <Clock className="h-8 w-8" />,
    title: '请求超时',
    description: '服务响应时间过长，请稍后重试',
    iconBg: 'bg-sky-100 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400',
  },
}

export interface ServiceUnavailableProps {
  type?: ServiceErrorType
  onRetry?: () => void
  isRetrying?: boolean
  title?: string
  description?: string
}

export function ServiceUnavailable({
  type = 'server',
  onRetry,
  isRetrying = false,
  title,
  description,
}: ServiceUnavailableProps) {
  const config = ERROR_CONFIGS[type]

  return (
    <motion.div
      className="flex flex-col items-center justify-center py-16 px-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* 图标 */}
      <motion.div
        className={`p-4 rounded-2xl mb-6 ${config.iconBg}`}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
      >
        <motion.div
          animate={{ rotate: [0, 3, -3, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          {config.icon}
        </motion.div>
      </motion.div>

      {/* 标题 */}
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
        {title || config.title}
      </h2>

      {/* 描述 */}
      <p className="text-zinc-500 dark:text-zinc-400 text-center max-w-sm mb-6 text-sm">
        {description || config.description}
      </p>

      {/* 重试按钮 */}
      {onRetry && (
        <Button
          onPress={onRetry}
          isDisabled={isRetrying}
          className="bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-medium px-5 py-2.5 rounded-xl"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
          {isRetrying ? '正在重试...' : '点击重试'}
        </Button>
      )}

      {/* 提示信息 */}
      <p className="text-zinc-400 dark:text-zinc-500 text-xs mt-6">
        系统会每 10 秒自动尝试重新连接
      </p>
    </motion.div>
  )
}
