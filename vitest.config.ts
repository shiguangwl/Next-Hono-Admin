import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.{js,ts}', 'tests/**/*.{test,spec}.{js,ts}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
    // 测试环境专用变量（不依赖 .env 文件，确保测试隔离和可重复性）
    env: {
      DATABASE_URL: 'mysql://root:password@localhost:3306/admin_scaffold_test',
      JWT_SECRET: 'test-jwt-secret-key-at-least-32-characters-long',
      JWT_EXPIRES_IN: '7d',
      NODE_ENV: 'test', // 测试环境标识，必须保留
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
