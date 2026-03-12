/**
 * 公开路径配置
 * @description 定义无需会话认证的 API 路径
 */

/**
 * 无需会话认证的路径列表
 * @description 这些路径将跳过会话认证中间件
 */
export const PUBLIC_PATHS: readonly string[] = ['/api/auth/login', '/api/health'] as const

/**
 * 检查路径是否为公开路径
 * @param path - 请求路径
 * @returns 是否为公开路径
 */
export function isPublicPath(path: string): boolean {
  return PUBLIC_PATHS.includes(path)
}
